Purpose
-------
This file gives AI coding agents the exact, project-specific knowledge needed to work effectively in this repo. Keep instructions short and actionable; reference code examples below.

Big picture
-----------
- Monorepo-like layout: backend lives in [back](back) and frontend in [front](front).
- Backend: Express + Mongoose API. Entry is [back/server.js](back/server.js) (also a near-duplicate in [back/back/index.js](back/back/index.js)). Routes are under [back/routes](back/routes) and controllers under [back/controllers](back/controllers). Models live in [back/models](back/models).
- Frontend: Vite + React app in [front/src](front/src). HTTP client is [front/src/api.js](front/src/api.js) which sets `baseURL` to `http://<hostname>:5000/api` and attaches `Authorization: Bearer <token>` from `localStorage`.

How to run (developer workflows)
--------------------------------
- Frontend dev: run in `front`:

  npm install
  npm run dev

- Backend dev: there is no start script in `back/package.json`; run the server directly from the `back` folder:

  node server.js

- Environment: backend requires `MONGO_URI` (and optionally `PORT`) in a `.env` file at `back/.env` or environment variables.

Auth & tokens
-------------
- Backend uses JWT (`jsonwebtoken`) for auth. Frontend stores token in `localStorage` key `accessToken` and `front/src/api.js` attaches it automatically to requests.
- On 401 responses the frontend clears `accessToken` and redirects to `/login` (see `front/src/api.js`).

API & routing conventions
-------------------------
- Route prefixes are organized by feature, e.g. `/api/auth`, `/api/occurrences`, `/api/admin`, `/api/employees`, `/api/career`, `/api/recurrent`, etc. See route registration in [back/server.js](back/server.js).
- Controllers export plain functions (e.g. `addCareer`, `getCareer`) that accept `(req, res)` and use Mongoose models directly. Error responses are typically simple `res.status(400).json({ message: ... })`.
- Static uploads are served from `/uploads` via `express.static` (see [back/server.js](back/server.js)). File uploads use `multer` in middleware files.

Patterns & code examples
------------------------
- Controller pattern (example): create model instance then `save()` and return json. See [back/controllers/training.controller.js](back/controllers/training.controller.js).
- CORS is configured centrally and restricts origins to a small set of internal dev hosts; update CORS in [back/server.js](back/server.js) when deploying or adding dev machines.
- Axios instance: `api.interceptors.request` attaches token; `api.interceptors.response` handles 401 and redirect. See [front/src/api.js](front/src/api.js).

Where to look for common tasks
-----------------------------
- Add a new REST resource: create `model` in [back/models](back/models), controller in [back/controllers](back/controllers), route in [back/routes](back/routes), then register route in [back/server.js](back/server.js).
- Add new frontend API call: add to `front/src/api.js` as wrapper or call `api` directly from components/pages.

Integration points & caveats
---------------------------
- Front expects backend at port `5000` during dev (axios baseURL). If serving backend elsewhere, update `front/src/api.js` or the `BACKEND_URL` in [front/config.js](front/config.js).
- No centralized error middleware — controllers return errors inline. Be conservative when refactoring error handling.

Tests & CI
--------
- There are no discoverable test suites or CI configs in the repo. Prefer small, manual verification steps (run server, exercise endpoints in Postman/browser) when making API changes.

Style & conventions
-------------------
- Prefer explicit, minimal controller functions. Keep route registration in [back/server.js](back/server.js).
- Use `localStorage` token keys `accessToken` and `user` consistently if touching auth flow.

When editing this file
----------------------
- If you find existing `.github/copilot-instructions.md` or AGENT docs, merge relevant content instead of overwriting. No such files were found at the time of creation.

If anything above is ambiguous, ask for the preferred dev hostnames, intended deployment ports, or whether you should add npm `start` scripts in `back/package.json`.
