# Project Governance Model

This document describes the governance structure and decision-making model for **CineCurator**.

---

## Roles & Responsibilities

### Maintainers
Maintainers are active contributors responsible for the overall direction, code quality, security, and release orchestration of CineCurator.

**Current Maintainer:**
- **[@Shivanshu85](https://github.com/Shivanshu85)** (Project Creator & Lead Maintainer)

**Maintainer Responsibilities:**
- Reviewing and merging Pull Requests.
- Trieaging issues and feature requests.
- Maintaining production release stability on Vercel and Render.
- Enforcing the [Code of Conduct](CODE_OF_CONDUCT.md) and security policies.

---

## Decision-Making Process

CineCurator follows a consensus-seeking decision-making process:

1. **Minor Changes (Bug fixes, documentation updates, styling refactors):** Approved by at least one maintainer review.
2. **Major Architectural Changes (ML algorithm replacements, database schema migrations, API breaking changes):**
   - Require a dedicated RFC (Request for Comments) discussion in [GitHub Discussions](https://github.com/Shivanshu85/Cinecurator/discussions).
   - Require formal approval from the Lead Maintainer.
