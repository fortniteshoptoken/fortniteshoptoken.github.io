# Repository rules

These rules are enforced by Git hooks in `.githooks/` and by the `Repository rules` GitHub Action. Do not bypass them (no `--no-verify`).

1. **Commit messages are a bare version number only**, e.g. `1.0`, `1.1`, `1.2`. Each commit must be greater than the previous one (minor +1: `1.9` → `1.10`). No other text, no body, no prefixes.
2. **README.md contains exactly one line:** `# Fortnite Shop Token Guide`. Do not add any other content to README.md; put notes elsewhere.
3. Merge pull requests with **Squash and merge** and set the commit message to the next version number.
4. **Never commit internal build research**, such as the game detail export `*详情资料*.txt`. It is ignored by `.gitignore` and rejected by the hooks and the Action; keep it outside the repository.

Run `npm install` once after cloning so the hooks are enabled (`core.hooksPath=.githooks`).

5. **Public repository privacy:** only `README.md` and `AGENTS.md` may be committed as Markdown. Never commit internal reports, browser snapshots, test screenshots, logs, archives, credentials, or personal machine paths. Use a public GitHub nickname and GitHub noreply address for both author and committer. Keep required font licenses.
