---
name: update-app
description: Update dependencies, fix deprecations and warnings
---

# DevNexus Dependency Update & Deprecation Fix

Update all dependencies, fix deprecation warnings, and ensure zero security vulnerabilities.

## Step 1: Check for Updates

Check which dependencies have newer versions available:

```bash
cd /mnt/e/Projects/dev-nexus
bun outdated
```

Review the output to see:
- Which packages have updates
- Current vs latest versions
- Breaking changes (major version bumps)

## Step 2: Update Dependencies

Update dependencies to their latest compatible versions:

```bash
# Update all dependencies
bun update

# Check for security vulnerabilities
bun audit
```

If `bun audit` shows vulnerabilities, run:
```bash
bun audit --fix
```

**Note**: Review breaking changes for major version updates before proceeding.

## Step 3: Check for Deprecations & Warnings

Perform a clean install and capture ALL output:

```bash
# Remove old dependencies
rm -rf node_modules bun.lockb

# Fresh install
bun install
```

**Read the entire output carefully.** Look for:
- ❌ **Deprecation warnings** (e.g., "Package X is deprecated, use Y instead")
- ⚠️ **Peer dependency warnings** (missing or incompatible peer deps)
- 🔒 **Security vulnerabilities** (high/critical severity)
- 💥 **Breaking changes** (mentioned in package postinstall messages)
- 🚨 **Incorrect peer dependencies** (version mismatches)

**Common patterns to watch for**:
```
warn: deprecated package-name@version
warn: incorrect peer dependency "react@19.2.3"
WARN Package has been deprecated
audit: X vulnerabilities found
```

## Step 4: Fix Issues

For each warning/deprecation found:

### Deprecation Warnings
1. Research the deprecated package on npm/GitHub
2. Find the recommended replacement
3. Update `package.json` to use the new package
4. Update imports in code
5. Test functionality

Example:
```bash
# If "old-package" is deprecated in favor of "new-package"
bun remove old-package
bun add new-package
# Then update imports: import { X } from 'new-package'
```

### Peer Dependency Warnings
1. Check which package requires the peer dependency
2. Install the missing peer dependency at the correct version
3. Verify compatibility

Example:
```bash
# If peer dep warning for "@types/react@19"
bun add -D @types/react@19
```

### Security Vulnerabilities
1. Run `bun audit` to see details
2. Update vulnerable packages: `bun update <package-name>`
3. If no fix available, consider alternative packages
4. Document security decisions

### Breaking Changes
1. Check package's CHANGELOG or migration guide
2. Update code to match new API
3. Run tests to verify functionality

## Step 5: Run Quality Checks

After fixing all deprecations and warnings, verify code quality:

```bash
cd /mnt/e/Projects/dev-nexus

# TypeScript type checking
bun run typecheck

# ESLint linting
bun run lint:check

# Prettier formatting
bun run format:check

# Run tests
bun run test
```

Fix ALL errors before continuing:
```bash
# Auto-fix linting issues
bun run lint

# Auto-format code
bun run format
```

If tests fail due to dependency updates:
1. Update test expectations if API changed
2. Fix breaking changes in application code
3. Re-run tests until all pass

## Step 6: Verify Clean Install

Ensure a fresh install works with ZERO warnings:

```bash
cd /mnt/e/Projects/dev-nexus

# Complete cleanup
rm -rf node_modules bun.lockb

# Fresh install
bun install
```

**Success criteria**:
- ✅ No deprecation warnings
- ✅ No peer dependency warnings
- ✅ No security vulnerabilities
- ✅ All dependencies resolve correctly
- ✅ Installation completes without errors

## Step 7: Test Application

Start the dev server and verify functionality:

```bash
# Start Next.js dev server
bun run dev
```

**Manual checks**:
1. Visit http://localhost:3000
2. Verify landing page loads
3. Check tRPC health: `curl http://localhost:3000/api/trpc/healthcheck`
4. Test any updated dependencies (3D, forms, etc.)
5. Check browser console for errors
6. Verify hot reload works

If issues found:
1. Identify which dependency update caused the issue
2. Check package's migration guide
3. Update code accordingly
4. Re-test

## Step 8: Commit Updates

After all checks pass, commit the changes:

```bash
git add package.json bun.lockb
git commit -m "chore: update dependencies and fix deprecations

- Updated all dependencies to latest versions
- Fixed deprecation warnings
- Resolved security vulnerabilities
- Verified zero warnings on clean install
- All quality checks passing"
```

---

## Common DevNexus Dependencies to Watch

**Next.js/React**:
- `next` - Check for breaking changes in Next.js releases
- `react`, `react-dom` - Major updates may affect component APIs

**3D Graphics**:
- `three` - Breaking changes in Three.js can affect R3F
- `@react-three/fiber`, `@react-three/drei` - Update together with Three.js

**Database/API**:
- `drizzle-orm`, `drizzle-kit` - Check migration guides for schema changes
- `@trpc/server`, `@trpc/client` - Update together to avoid version mismatches

**UI Libraries**:
- `@xyflow/react` - ReactFlow major updates may have breaking changes
- `@tiptap/react` - Tiptap updates may affect editor behavior

**Testing**:
- `vitest` - Check for test API changes
- `@playwright/test` - Update browser binaries if needed: `bunx playwright install`

---

## Usage

Run this command with: `/update-app`

The command will:
1. Check for available updates
2. Update all dependencies
3. Fix security vulnerabilities
4. Identify and fix deprecations
5. Run quality checks
6. Verify clean install
7. Test application functionality
