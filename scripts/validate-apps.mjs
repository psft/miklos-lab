import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const appsRoot = path.resolve("apps");
const allowedStatuses = new Set(["Draft", "Published", "Needs review", "Archived"]);
const forbiddenFileNames = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  "vercel.json",
]);
const riskyPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /sk_live_[A-Za-z0-9_-]{20,}/,
  /pk_live_[A-Za-z0-9_-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}["']/i,
];
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".txt"]);

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(target));
    } else if (entry.isFile()) {
      files.push(target);
    }
  }
  return files;
}

async function validateMetadata(appPath, errors) {
  const metadataPath = path.join(appPath, "oblex.json");
  if (!(await exists(metadataPath))) return;

  try {
    const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
    if (metadata.name !== undefined && !String(metadata.name).trim()) {
      errors.push(`${metadataPath}: name must not be blank when provided`);
    }
    if (metadata.status !== undefined && !allowedStatuses.has(String(metadata.status).trim())) {
      errors.push(`${metadataPath}: status must be one of ${[...allowedStatuses].join(", ")}`);
    }
    if (metadata.notes !== undefined && String(metadata.notes).length > 500) {
      errors.push(`${metadataPath}: notes should be 500 characters or fewer`);
    }
  } catch (error) {
    errors.push(`${metadataPath}: invalid JSON (${error.message})`);
  }
}

async function validateFileContents(file, errors) {
  if (forbiddenFileNames.has(path.basename(file))) {
    errors.push(`${file}: do not publish env, deployment, or secret config files`);
    return;
  }

  if (!textExtensions.has(path.extname(file).toLowerCase())) return;
  const text = await readFile(file, "utf8");
  for (const pattern of riskyPatterns) {
    if (pattern.test(text)) {
      errors.push(`${file}: looks like it may contain a secret, token, password, or private key`);
      return;
    }
  }
}

const errors = [];
let appCount = 0;

if (!(await exists(appsRoot))) {
  errors.push("Missing apps/ folder.");
} else {
  const entries = await readdir(appsRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    appCount += 1;
    const appPath = path.join(appsRoot, entry.name);
    if (!(await exists(path.join(appPath, "index.html")))) {
      errors.push(`${appPath}: missing index.html`);
    }
    await validateMetadata(appPath, errors);
    const files = await walkFiles(appPath);
    await Promise.all(files.map((file) => validateFileContents(file, errors)));
  }
}

if (appCount === 0) {
  errors.push("Add at least one app folder under apps/.");
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`FAIL ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${appCount} kid app${appCount === 1 ? "" : "s"}.`);
