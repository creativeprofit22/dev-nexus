---
name: commit
description: Run checks, commit with AI message, and push
---

# Quick Commit with Quality Checks

1. **Run quality checks**:
   ```bash
   cd /mnt/e/Projects/dev-nexus
   bun run typecheck && bun run lint:check
   ```
   Fix ALL errors before continuing.

2. **Review changes**: `git status` and `git diff`

3. **Generate commit message**:
   - Start with verb: Add/Update/Fix/Remove/Refactor/Chore
   - Be specific and concise (one line preferred)
   - Format: `type: brief description`

4. **Commit and push**:
   ```bash
   git add -A
   git commit -m "your generated message"
   git push
   ```
