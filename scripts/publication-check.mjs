import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function git(...args) {
  return execFileSync("git", args, { maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
}

const privateFile = /(?:^|\/)(?:\.playwright-cli|output|artifacts|screenshots|test-results|playwright-report|coverage|release|node_modules|\.next|out)(?:\/|$)|详情资料[^/]*\.txt$|\.(?:log|har|zip|tar|gz|bak|pem|key|p12|pfx)$/i;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*["']?\s*[:=]\s*["'][^"'\s]{12,}["']/i,
];
const localPath = /\/(?:Users|home)\/[^\s"'<>]+|[A-Z]:\\Users\\[^\s"'<>]+/i;
const email = /[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
const privateEmail = (value) => !/^(?:\d+\+)?[a-z0-9-]+@users\.noreply\.github\.com$/i.test(value);

export function checkIdentity(commit) {
  const identities = commit
    ? git("show", "-s", "--format=%ae%n%ce", commit).toString().trim().split("\n")
    : ["GIT_AUTHOR_IDENT", "GIT_COMMITTER_IDENT"].map((kind) => {
      const match = git("var", kind).toString().match(/<([^>]+)>/);
      return match?.[1] || "";
    });
  return identities.some(privateEmail) ? ["Commit author and committer must use a GitHub noreply email."] : [];
}

export function checkPublicFiles(paths, ref) {
  const errors = [];
  for (const path of paths) {
    const internalMarkdown = /\.md$/i.test(path) && !["README.md", "AGENTS.md"].includes(path);
    const environmentFile = /(?:^|\/)\.env(?:\.|$)/i.test(path) && path !== ".env.example";
    const privateImage = /\.(?:png|jpe?g|webp|gif|ico|svg|mp4|webm)$/i.test(path) && !/^public\//.test(path);
    if (privateFile.test(path) || internalMarkdown || environmentFile || privateImage) {
      errors.push(`Private artifact is not allowed: ${path}`);
      continue;
    }
    const data = ref ? git("show", ref === ":index" ? `:${path}` : `${ref}:${path}`) : readFileSync(path);
    if (data.includes(0)) continue;
    const source = data.toString("utf8");
    if (localPath.test(source)) errors.push(`Personal machine path found in ${path}`);
    if (secretPatterns.some((pattern) => pattern.test(source))) errors.push(`Possible credential found in ${path}`);
    if ((source.match(email) || []).some(privateEmail)) errors.push(`Non-public email found in ${path}`);
  }
  return errors;
}
