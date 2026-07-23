# Contributing to CineCurator

First off, thank you for considering contributing to **CineCurator**! Whether you are fixing a bug, adding new machine learning models, improving documentation, or refining UI components, your contributions help make movie discovery better for everyone.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed on your development machine:
- **Node.js** `>= 18.x` (LTS recommended)
- **npm** `>= 9.x`
- **Python** `>= 3.10`
- **Git**

### 2. Fork and Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Cinecurator.git
   cd Cinecurator
   ```

### 3. Setup Next.js Frontend
```bash
npm install
cp .env.example .env.local
npm run dev
```

### 4. Setup FastAPI ML Backend
```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```

---

## Development Guidelines

### Branch Naming Conventions
Use descriptive branch names according to the work being performed:
- `feature/description` (e.g., `feature/hybrid-recommendation-model`)
- `fix/description` (e.g., `fix/trailer-modal-z-index`)
- `docs/description` (e.g., `docs/add-api-architecture-guide`)
- `refactor/description` (e.g., `refactor/query-cache-stale-time`)

### Code Style & Quality Standards
- **Frontend (TypeScript / React):**
  - Run `npm run build` locally before opening a pull request to ensure zero TypeScript compiler or lint errors.
  - Follow standard React component composition patterns. Keep components Modular under `components/`.
  - Use Tailwind CSS classes consistent with CineCurator's cinematic dark design token palette (`bg-background`, `text-on-surface`, `bg-primary-container`).

- **Backend (Python / FastAPI):**
  - Adhere to PEP 8 naming standards.
  - Use Pydantic schemas for request validation and response typing.
  - Include docstrings for ML model training and evaluation routines.

---

## Pull Request Workflow

1. Ensure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Run build verification:
   ```bash
   npm run build
   ```
3. Commit your changes with clear, structured commit messages:
   ```bash
   git commit -m "feat(ml): implement sub-millisecond top-K candidate search using np.argpartition"
   ```
4. Push to your fork and submit a Pull Request targeting `main`.
5. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely.

---

## Reporting Bugs & Suggesting Features

- **Bug Reports:** Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml) to submit detailed steps to reproduce.
- **Feature Requests:** Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml) to share ideas for ML algorithms or UI enhancements.
