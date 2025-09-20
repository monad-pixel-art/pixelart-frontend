# Repository Guidelines

## Project Structure & Module Organization

- `src/` holds React UI code, Redux state, and styling modules; follow existing folder naming when adding features.
- `test/` aggregates Jest suites that exercise reducers, components, and utilities; co-locate lightweight specs alongside source when it improves clarity.
- `public/` delivers static assets consumed by the webpack dev server, while `deploy/` stores hosting artifacts and scripts.
- `examples/` and `screenshots/` provide reference material; update them only when new UI capabilities land.

## Build, Test, and Development Commands

- `npm install` installs Node 22 compatible dependencies defined in `package.json` and `package-lock.json`.
- `npm run development` starts `webpack-dev-server --hot` for local work at `http://localhost:8080`.
- `npm run validate` chains lint, style checks, formatting diff, and Jest to block regressions before commits.
- `npm run deploy` builds production bundles via `webpack.production.config.js`; use it to verify release artifacts.

## Coding Style & Naming Conventions

- JavaScript and JSX follow ESLint AirBnB rules with Prettier formatting (2-space indentation, single quotes, dangling commas where allowed).
- CSS-in-JS adheres to Stylelint presets; prefer descriptive component names in PascalCase and utility helpers in camelCase.
- Keep Redux action constants UPPER_SNAKE_CASE and colocate reducers/selectors near their feature modules.
- Run `npm run format` only when ready to apply Prettier updates project-wide.

## Testing Guidelines

- Jest is the primary framework; mock canvas APIs with `jest-canvas-mock` as needed.
- Name files `*.test.js` and mirror the `src/` path to simplify imports, e.g., `src/store/palette.test.js`.
- Use `npm test` for a one-off run and `npm run test -- --watch` during iterative development.
- When adding rendering logic, snapshot test critical components and assert reducers against edge cases (undo/redo, export flows).

## Commit & Pull Request Guidelines

- Follow conventional commits observed in history (`feat:`, `fix:`, `chore:`, `docs:`) with concise, imperative descriptions.
- Each PR should describe scope, testing performed, and any UI changes (include screenshots or GIFs from `screenshots/` when relevant).
- Reference GitHub issues with `Fixes #id` when work closes a ticket, and ensure CI command `npm run validate` passes before requesting review.
