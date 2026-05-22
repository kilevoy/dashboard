# Security Policy

## Supported Versions

This repository contains a portfolio dashboard. Security fixes are applied to the current `main` branch.

## Reporting a Vulnerability

Do not open public issues for secrets, credentials, or exploitable vulnerabilities.

Report security issues privately to the repository owner. Include:

- a concise description of the issue;
- affected files, routes, or dependencies;
- reproduction steps when possible;
- impact and suggested mitigation, if known.

## Secret Handling

Never commit `.env` files, API tokens, personal access tokens, production data, or customer data. If a token is exposed, revoke it immediately and create a new one.
