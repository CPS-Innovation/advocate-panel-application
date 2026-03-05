# Apply to join a CPS advocate panel prototype

A GOV.UK Prototype Kit service for exploring the CPS Advocate Panel application journey.

## What this prototype covers

This prototype contains end-to-end journey pages for:

- application start and dashboard pages
- about-you question flows (barrister and solicitor variants)
- current chambers or firm details
- preferred circuit and Crown Court selection flows
- year-of-call and qualification questions
- equalities questions
- task list and check-answers patterns

The project is designed for service design and user research, not production deployment.

## Tech stack

- [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk/)
- GOV.UK Frontend
- Nunjucks templates
- Node.js

## Project structure

```text
app/
  routes.js                 # Route and branching logic
  views/                    # Nunjucks pages and journey templates
  assets/sass/              # Custom styling
public/                     # Built frontend assets
```

Notes:

- `app/views` is the single source of truth for templates.
- Duplicate `app/views/content` structure has been removed.

## Key routing logic

Most branching behaviour is in `app/routes.js`, including:

- role routing (barrister / solicitor / other)
- panel and level selection branching
- solicitor-specific question branching
- employment type branching
- equalities journey progression

## Run locally

Install dependencies:

```bash
npm install
```

Start the prototype:

```bash
npm run dev
```

Alternative:

```bash
npm run serve
```

Build autocomplete JS bundle:

```bash
npm run build:js
```

Default local URL:

- `http://localhost:3000`

## Content and design notes

- Typography has been normalised to a consistent hierarchy:
  - `h1` uses `govuk-heading-l`
  - `h2` uses `govuk-heading-m`
  - `h3` uses `govuk-heading-s`
- Pages follow GOV.UK patterns for task lists, radios, check answers, and form questions.

## Repository and deployment

- Repository: `CPS-Innovation/advocate-panel-application`
- The app is deployed on Heroku for prototype access.

## Licence

See `LICENSE` / `LICENCE.txt` in this repository.
