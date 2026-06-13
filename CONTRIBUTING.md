# Contributing to UrbanPulse AI

Thank you for considering a contribution to UrbanPulse AI. This document explains how to contribute effectively and get your changes merged quickly.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Reporting Bugs](#reporting-bugs)
- [Proposing Features](#proposing-features)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Code Style](#code-style)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

All contributors must adhere to the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Reporting Bugs

Before opening a bug report:

1. **Search existing issues** to avoid duplicates
2. **Reproduce the bug** with a minimal example
3. **Use the bug report template** at `.github/ISSUE_TEMPLATE/bug_report.md`

Include:
- Steps to reproduce (numbered list)
- Expected vs. actual behaviour
- Environment details (OS, Node version, Python version, Docker version)
- Console output or screenshots

---

## Proposing Features

1. **Open a feature request issue first** — discuss the idea before writing code
2. Wait for maintainer feedback before investing time in implementation
3. Reference the issue number in your PR

---

## Development Setup

### Prerequisites

```bash
# Required
node >= 18.x
python >= 3.11
docker >= 24.x
docker compose >= 2.x

# Recommended
git >= 2.40
```

### Fork & Clone

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/urbanpulse-ai.git
cd urbanpulse-ai

# 3. Add the upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/urbanpulse-ai.git
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev           # Start at http://localhost:3000
npm run build         # Verify production build passes
npm run lint          # ESLint check
```

### Backend Setup (per service)

```bash
cd services/core-api
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
uvicorn main:app --reload --port 8000
```

### Full Stack (Docker)

```bash
cp .env.example .env
docker-compose up -d --build
python seed.py
```

---

## Making Changes

1. **Create a branch** from `main`:

   ```bash
   git checkout -b feat/my-feature-name      # New feature
   git checkout -b fix/bug-description       # Bug fix
   git checkout -b docs/update-readme        # Documentation
   git checkout -b refactor/component-name   # Refactoring
   ```

2. **Make your changes** — keep commits focused and atomic

3. **Test your changes**:
   - Frontend: `npm run build` must pass with zero TypeScript errors
   - Backend: run `pytest` in the relevant service directory
   - Full stack: smoke-test with `docker-compose up --build`

4. **Update documentation** if your change affects the public API, environment variables, or setup steps

---

## Code Style

### TypeScript / Next.js

- ESLint config: `frontend/.eslintrc.json`
- Run: `npm run lint`
- Key rules:
  - No `any` types without a comment explaining why
  - No `Math.random()` in render paths (use seeded RNG from `lib/intelligence.ts`)
  - Client Components must begin with `"use client";`
  - All new components go under `src/components/transit/` or `src/components/layout/`

### Python

- Formatter: **Ruff** (`ruff format .`)
- Linter: **Ruff** (`ruff check .`)
- Type hints required on all public functions
- Docstrings for all classes and public methods
- Run: `ruff format . && ruff check .` before committing

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer: Closes #123]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no feature/fix |
| `test` | Adding or updating tests |
| `chore` | Build, CI, tooling |
| `perf` | Performance improvement |

**Examples:**

```
feat(copilot): add back-navigation to step wizard
fix(map): eliminate Math.random hydration mismatch in PassengerFlow
docs(readme): add deployment instructions for Railway
refactor(intelligence): extract seeded RNG to shared utility
```

---

## Pull Request Process

1. **Ensure your branch is up to date** with upstream main:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run the full verification checklist**:
   - [ ] `npm run build` passes with zero errors (frontend)
   - [ ] `npm run lint` passes with zero warnings (frontend)
   - [ ] `ruff check .` passes (any Python service changed)
   - [ ] No `console.log` left in frontend code
   - [ ] No `print()` left in production Python paths
   - [ ] New environment variables added to `.env.example`
   - [ ] Documentation updated if needed

3. **Open a PR** using the PR template

4. **Link the issue** your PR resolves: `Closes #123`

5. **Request a review** — PRs require at least one approval before merging

6. **Address review feedback** — push additional commits to the same branch

7. **Squash and merge** — maintainers will squash commits on merge

---

## Questions?

Open a [GitHub Discussion](https://github.com/yourusername/urbanpulse-ai/discussions) for questions that aren't bugs or feature requests.
