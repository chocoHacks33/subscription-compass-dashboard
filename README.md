# Subscription Compass Dashboard

A small, dependency-free dashboard for reviewing recurring subscription costs, yearly impact, plan status, and the next renewal.

## Run locally

Open `index.html` directly, or serve the folder with any static file server.

## Validate

```bash
npm run check
```

The checks use Node's built-in test runner, so there are no packages to install.

## Project structure

- `index.html` — accessible dashboard structure
- `styles.css` — responsive visual design
- `app.js` — sample data, calculations, and rendering
- `test/app.test.js` — calculation and formatting tests

The sample data is intentionally local and easy to replace with real subscription records.

The cost concentration insight highlights the largest active plan and its share of monthly spend.
