# Security Policy

## Supported Versions

The following versions of UrbanPulse AI are currently receiving security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes (current)   |
| < 1.0   | ❌ No              |

---

## Reporting a Vulnerability

We take the security of UrbanPulse AI seriously. If you believe you have found a security vulnerability in this project, **please do not file a public GitHub issue**. Public disclosure before a fix is available puts all users at risk.

### How to Report

Please report vulnerabilities by sending an email to:

**📧 [security@urbanpulse.ai](mailto:security@urbanpulse.ai)**

Include the following information in your report:

- **Description** — A clear description of the vulnerability and its potential impact
- **Steps to reproduce** — Detailed steps to reliably reproduce the issue
- **Affected component** — Which service, module, or endpoint is affected
- **Environment** — OS, runtime versions, deployment method (Docker / Vercel / local)
- **Proof of concept** — If available, a minimal PoC script or request demonstrating the issue
- **Suggested fix** — If you have a recommended remediation, please include it

### Response Timeline

| Stage                          | Timeframe        |
| ------------------------------ | ---------------- |
| Initial acknowledgement        | Within **48 hours** |
| Severity assessment & triage   | Within **5 business days** |
| Patch development begins       | Within **10 business days** |
| Fix released (critical/high)   | Within **30 days** |
| Fix released (medium/low)      | Within **60 days** |
| Public disclosure               | Within **90 days** of report |

We will keep you informed at each stage of the process. If we are unable to meet a stated deadline, we will notify you with an updated timeline and explanation.

---

## Coordinated Disclosure Policy

UrbanPulse AI follows a **90-day coordinated disclosure** model:

1. You report the vulnerability privately to `security@urbanpulse.ai`.
2. We acknowledge, assess, and develop a patch.
3. We release a fix and prepare a security advisory.
4. After the fix is released (or after 90 days from the original report, whichever comes first), the vulnerability details may be publicly disclosed.

We credit security researchers who responsibly disclose vulnerabilities, unless they prefer to remain anonymous. If you wish to be acknowledged, please let us know in your report.

---

## Security Considerations

### 🔐 JWT Secrets

- All JWT secrets **must** be set via environment variables (`JWT_SECRET_KEY`). Never hardcode secrets in source code or configuration files.
- Secrets should be at least **256 bits** of cryptographically random entropy (e.g., generated with `openssl rand -hex 32`).
- JWT tokens are signed using **HS256** by default. For production deployments at scale, consider rotating to **RS256** with asymmetric key pairs.
- Token expiry is configured via `ACCESS_TOKEN_EXPIRE_MINUTES`. Keep access tokens short-lived (recommended: ≤ 60 minutes) and use refresh tokens for session continuity.
- Invalidated tokens are tracked in Redis. Ensure Redis is not publicly accessible and is secured with authentication (`requirepass`).

### 🗝️ API Key Handling

- API keys (Mapbox, OpenAI, external transit APIs) **must** be stored in environment variables and never committed to version control.
- Use `.env.local` for local development and populate secrets via your CI/CD secret manager (e.g., GitHub Actions Secrets, Vercel Environment Variables) for production.
- Rotate API keys immediately if you suspect they have been exposed.
- The `.gitignore` in this repository excludes all `.env*` files. Verify this is intact before pushing to any remote.
- The application is designed to **degrade gracefully** when API keys are absent — the Mapbox premium map falls back to an animated SVG network, and the AI engine falls back to the deterministic seeded intelligence layer.
- Do **not** expose API keys to the browser/client side unless they are explicitly scoped for frontend use (e.g., a public Mapbox token). Server-side secrets must only be accessed from server components or API routes.

### 🌐 CORS Configuration

- The Core API (`api-core`) enforces CORS via FastAPI's `CORSMiddleware`. In production, the `ALLOWED_ORIGINS` environment variable **must** be set to an explicit allowlist of trusted origins (e.g., `https://urbanpulse.vercel.app`).
- **Never** set `allow_origins=["*"]` in production, especially when cookies or Authorization headers are used.
- The development default (`http://localhost:3000`) is intentionally permissive. Ensure this is overridden in all staging and production environments.
- Verify that `allow_credentials=True` is only set when strictly necessary, and never combined with a wildcard origin.

### 🐳 Docker & Container Security

- Run all containers as **non-root users**. The provided Dockerfiles use `USER appuser` accordingly.
- Do not bind internal service ports (TimescaleDB `:5432`, Redis `:6379`, ChromaDB `:8000`) to `0.0.0.0` in production. Use Docker's internal network and expose only the API gateway.
- Regularly update base images (`python:3.11-slim`, `node:20-alpine`) to pick up OS-level security patches.
- Use Docker secrets or an external vault (e.g., HashiCorp Vault, AWS Secrets Manager) for managing secrets in orchestrated environments.

### 🛡️ General Best Practices

- All endpoints that modify state are protected by JWT authentication. Do not disable authentication middleware in production.
- SQL queries use parameterised statements via SQLAlchemy — do not concatenate raw user input into queries.
- Input validation is enforced via Pydantic schemas on all API request bodies.
- The application does not log sensitive values (tokens, passwords, API keys). If you add custom logging, ensure sensitive fields are redacted.
- Dependency versions are pinned in `requirements.txt` and `package-lock.json`. Run `npm audit` and `pip-audit` regularly to check for known CVEs in dependencies.

---

## What NOT to Do

> ⚠️ **Please do not file public GitHub Issues, Discussions, or Pull Requests for security vulnerabilities.**

Public disclosure before a fix is available gives malicious actors a window to exploit the vulnerability against production deployments. Always use the private email channel above.

This includes:
- Do **not** post vulnerability details in GitHub Issues
- Do **not** post in public community forums or Discord servers
- Do **not** publish a blog post or social media thread before coordinated disclosure is complete
- Do **not** submit a pull request that reveals the vulnerability in its title, description, or diff

---

## Scope

The following are **in scope** for security reports:

- Authentication & authorisation bypasses
- Injection vulnerabilities (SQL, command, SSTI, etc.)
- Sensitive data exposure (API keys, PII, tokens in logs or responses)
- Broken access control between tenant/operator data
- Server-Side Request Forgery (SSRF)
- Insecure direct object references (IDOR)
- Dependency vulnerabilities with a clear exploit path

The following are **out of scope**:

- Theoretical vulnerabilities without a proof of concept
- Rate limiting / brute-force issues on local development instances
- Missing security headers on the static SVG fallback pages
- Social engineering attacks
- Vulnerabilities in third-party services (Mapbox, Vercel infrastructure, etc.)

---

## Security Hall of Fame

We sincerely thank the following researchers for their responsible disclosures:

_No disclosures yet. Be the first!_

---

*This policy was last updated: 2026-06-13*
