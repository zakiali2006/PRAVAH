## Pull Request Checklist

Before requesting a review, please ensure your PR meets all of the following requirements for the "Ready for Main" state:

- [ ] **Tests pass**: `pytest` has been run and all tests pass.
- [ ] **Formatting**: `black` has been run on backend Python code.
- [ ] **Linting**: `flake8` (Python) and `eslint` (Frontend) pass with zero errors.
- [ ] **Frontend Build**: `npm run build` succeeds locally.
- [ ] **No Secrets**: Double-checked that no `.env` files or API keys have been accidentally tracked.
- [ ] **Documentation**: `ARCHITECTURE.md`, `API.md`, or other relevant docs have been updated if behavior changed.
- [ ] **Seed Data**: Any required new mock data has been registered in the Seed Framework (`app/seed/seed.py`).

## Description
Provide a brief overview of the changes in this PR and why they are necessary. Link any relevant issue numbers here.

## Testing Instructions
Explain how reviewers should manually test your feature.
