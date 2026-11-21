# Repository Guidelines

## Project Structure & Module Organization

ShopLedger is a small Node/Express POS, Khata ledger, and GST invoice app. `server.js` creates the Express app and mounts `/api` routes. Keep endpoint handlers in `routes/` (`orders.js`, `products.js`, `customers.js`, `reports.js`) and reusable business rules in `lib/`. `public/` contains the browser UI: `index.html`, `js/app.js`, and `css/style.css`. Runtime data lives in `data/db.json`; treat it as business data, not a fixture. `config.js` contains shop settings, GST slabs, and coupons. Architecture documentation is in `docs/`.

## Build, Test, and Development Commands

- `npm install` installs Express and body-parser.
- `npm start` runs `node server.js` and serves the app on port `3000` by default; set `PORT=3001 npm start` to use another port.
- `npm test` currently exits with “no test specified”; add automated tests before relying on it in CI.

There is no build step, linter, formatter, or test framework configured.

## Coding Style & Naming Conventions

Use the existing CommonJS style: `var name = require(...)` and `module.exports`. Use two-space indentation, single quotes, semicolons, and `function` expressions for route handlers. Name files with lowercase nouns (`pricing.js`), exported functions with camelCase (`computeTotals`), and routes with plural resources (`/orders`). Keep request parsing and HTTP responses in `routes/`; put pricing, tax, inventory, ledger, and persistence rules in `lib/`.

## Testing Guidelines

No test suite exists yet. For a behavior change, add a focused test suite and cover happy paths plus invalid input, stock limits, coupon caps, Khata limits, cancellation, and GST rounding. In particular, test that checkout totals from `lib/pricing.js` agree with printable invoice totals from `lib/invoice.js`.

## Commit & Pull Request Guidelines

Recent commits use concise, lowercase, imperative summaries such as `invoice page for accountant` and `support hsn gst slabs and coupon maxDiscount caps`. Follow that pattern; keep each commit scoped to one concern. PRs should describe user-visible behavior, list validation performed, link the issue when available, and include screenshots for `public/` changes. Call out any `data/db.json` migration or accounting-impacting change.

## Security & Data Handling

Do not expose real customer data, secrets, or production exports in commits. Avoid hard-coding new credentials in `config.js`. Changes to taxes, coupons, invoice calculations, stock, or Khata balances require explicit review because they alter persisted financial data.
