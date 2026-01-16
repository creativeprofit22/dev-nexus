---
name: fix
description: Run typechecking and linting, then spawn parallel agents to fix all issues
---

# DevNexus Code Quality Check & Auto-Fix

This command runs all linting and typechecking tools for DevNexus, collects errors, groups them by domain, and spawns parallel agents to fix them.

## Step 1: Run Linting and Typechecking

Run the code quality checks for this Next.js/TypeScript project:

```bash
cd /mnt/e/Projects/dev-nexus

# Run TypeScript type checking
bun run typecheck

# Run ESLint (check mode - no auto-fix yet)
bun run lint:check

# Run Prettier check
bun run format:check
```

Capture all output from these commands.

## Step 2: Collect and Parse Errors

Parse the output from the linting and typechecking commands. Group errors by domain:

### **Type Errors** (from `bun run typecheck`):
- Parse TypeScript errors in format: `file.ts(line,col): error TS####: message`
- Group by file path
- Extract error codes and messages

### **Lint Errors** (from `bun run lint:check`):
- Parse ESLint errors in format: `file.ts  line:col  error  message  rule-name`
- Separate errors from warnings
- Group by file path
- Extract rule names

### **Format Errors** (from `bun run format:check`):
- Parse Prettier format issues
- List files that need formatting

Create structured data:
```typescript
{
  typeErrors: Array<{file: string, line: number, col: number, message: string, code: string}>,
  lintErrors: Array<{file: string, line: number, col: number, message: string, rule: string, severity: 'error'|'warning'}>,
  formatErrors: Array<{file: string}>
}
```

## Step 3: Spawn Parallel Agents

**IMPORTANT**: If there are errors, spawn agents in parallel using a SINGLE response with MULTIPLE Task tool calls.

### Agent 1: Type Error Fixer
**When to spawn**: If `typeErrors.length > 0`

Prompt:
```
Fix all TypeScript type errors in DevNexus at /mnt/e/Projects/dev-nexus.

**Errors to fix**:
[INSERT LIST OF TYPE ERRORS WITH FILE PATHS, LINE NUMBERS, AND MESSAGES]

**Instructions**:
1. Read each file with errors
2. Fix the type errors (add types, fix type mismatches, etc.)
3. Do NOT change functionality, only fix types
4. After fixing, run: bun run typecheck
5. Verify all type errors are resolved

**Rules**:
- Use proper TypeScript types, avoid 'any'
- Follow existing code patterns
- Keep fixes minimal and focused
```

### Agent 2: Lint Error Fixer
**When to spawn**: If `lintErrors.length > 0`

Prompt:
```
Fix all ESLint errors in DevNexus at /mnt/e/Projects/dev-nexus.

**Errors to fix**:
[INSERT LIST OF LINT ERRORS WITH FILE PATHS, LINE NUMBERS, RULES, AND MESSAGES]

**Instructions**:
1. Read each file with errors
2. Fix ESLint rule violations
3. Common fixes: remove unused vars, add missing deps to useEffect, etc.
4. After fixing, run: bun run lint:check
5. Verify all lint errors are resolved

**Rules**:
- Fix errors, not warnings (unless user requests)
- Follow project ESLint config
- Keep fixes minimal and focused
```

### Agent 3: Format Fixer
**When to spawn**: If `formatErrors.length > 0`

Prompt:
```
Fix all Prettier formatting issues in DevNexus at /mnt/e/Projects/dev-nexus.

**Files to format**:
[INSERT LIST OF FILES NEEDING FORMATTING]

**Instructions**:
1. Run: bun run format
2. Verify with: bun run format:check
3. Confirm all formatting is correct

**Note**: Prettier auto-formats, this agent just runs the command and verifies.
```

**Example parallel spawn** (use actual error data):
```
Send a SINGLE message with THREE Task tool calls:
1. Task(subagent_type="general-purpose", description="Fix type errors", prompt="[type error fixing prompt]")
2. Task(subagent_type="general-purpose", description="Fix lint errors", prompt="[lint error fixing prompt]")
3. Task(subagent_type="general-purpose", description="Fix formatting", prompt="[format fixing prompt]")
```

## Step 4: Verify All Fixes

After all agents complete, run the full check again:

```bash
cd /mnt/e/Projects/dev-nexus
bun run typecheck && bun run lint:check && bun run format:check
```

If all checks pass, report:
```
✅ All code quality checks passed!
   - TypeScript: 0 errors
   - ESLint: 0 errors
   - Prettier: All files formatted
```

If any checks still fail, report remaining issues and suggest manual review.

## Step 5: Optional - Run Auto-Fix

If user wants to apply auto-fixes for simple issues:

```bash
# Auto-fix lint issues (ESLint will fix what it can)
bun run lint

# Auto-format all files
bun run format
```

Then re-run checks to see remaining issues.

---

## Usage

Run this command with: `/fix`

The command will:
1. Check TypeScript types
2. Check ESLint rules
3. Check Prettier formatting
4. Spawn parallel agents to fix all issues
5. Verify fixes
6. Report results
