# Security Policy

## Supported Versions

CineCurator actively maintains and patches security issues for the following production release branches:

| Version | Supported | Maintenance Status |
| :--- | :---: | :--- |
| `1.x.x` (Current Main) | ✅ | Active Security Maintenance |
| `< 1.0.0` | ❌ | End of Life |

---

## Reporting a Vulnerability

The CineCurator core maintainers take security seriously. If you discover a vulnerability or security risk involving authentication, API keys, CORS configurations, rate limiting, or data disclosure, please report it responsibly.

### Disclosure Process

1. **Do NOT open a public GitHub issue** for undisclosed security vulnerabilities.
2. Email your security report directly to the repository maintainer at **`security@cinecurator.com`** or contact **[@Shivanshu85](https://github.com/Shivanshu85)** via private GitHub advisory.
3. Include the following details in your report:
   - Type of vulnerability (e.g., CORS misconfiguration, XSS, token leakage, API exposure)
   - Steps to reproduce the issue
   - Proof of Concept (PoC) code or HTTP request payloads
   - Impact assessment on production deployment

### Response Timelines

- **Acknowledgement:** Within 24 hours of receiving the vulnerability report.
- **Initial Assessment:** Within 48 hours.
- **Patch & Release:** Security patches are prioritized and targeted for release within 7 days of confirmation.

---

## Security Architecture & Best Practices in CineCurator

CineCurator incorporates several built-in security features across its microservice architecture:

### 1. Secret Isolation & Environment Security
- Server-side environment variables (`TMDB_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `YOUTUBE_API_KEY`) are kept isolated on Vercel/Render server runtimes and are **never** exposed to client bundles.
- Client-facing environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) use restricted anonymous privileges.

### 2. Row Level Security (RLS)
- Supabase PostgreSQL tables (`user_library`) enforce strict Row Level Security policies (`auth.uid() = user_id`) to ensure users can only read, write, or delete their own saved library items.

### 3. CORS Controls
- The FastAPI ML microservice enforces explicit origin validation via `ALLOWED_ORIGINS` environment settings in production environments.

### 4. Third-Party API Resilience
- Public API calls to external services (TMDB, OMDb) pass through Next.js proxy endpoints (`/api/movie`, `/api/recommend`) to prevent client IP tracking and key exposure.
