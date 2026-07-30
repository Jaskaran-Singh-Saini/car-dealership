# PROMPTS.md — AI Chat History Log

Chat log with Claude (Anthropic), used throughout development. Kept in chronological order, grouped loosely by phase for readability. Some back-and-forth (retries, minor corrections) has been trimmed, but the actual prompts and reasoning are real.

---

## Phase 0 — Planning

**Me:**
> This is the project assignment from the company, due Thursday, so timeline matters here. I've put together a workflow document outlining my planned approach — review it and let me know if it holds up or needs adjustment.

**Claude:** Reviewed the kata brief and the pre-written workflow doc, confirmed the 2-day timeline was realistic, broke it into backend-first / frontend-second / polish-last, and asked where to start.

**Me:**
> I'd like to use this stack instead, since it matches my prior work experience: Django + DRF + Simple JWT + PostgreSQL on the backend, React/Vite/Tailwind/Axios/React Router/Context on the frontend. Suggest any adjustments based on what's worked well for me before.

**Claude:** Swapped its original Node/Prisma plan for Django, restructured the repo layout, kept the same day-by-day sequencing.

---

## Phase 1 — Repo + Env Setup

**Me:**
> Let's set up the project directory, initialize git, and configure the local environment. I'll be developing in WSL — let me do the setup.

Got the mkdir/git init/.gitignore/venv/Postgres commands, ran them one at a time, checked versions (Python 3.10.12, Postgres 14.23) before moving on.

**Me:**
> Going forward, present file edits explicitly in a dedicated section, and keep comments meaningful rather than excessive. Separately, I still need a GitHub repo for this project — let me set that up and connect it.

Got GitHub repo + PAT auth steps, and the settings.py diff (installed apps, middleware, DB config, JWT/CORS config) as a reference file to copy from manually since Claude can't touch my actual filesystem.

---

## Phase 2 — Auth (TDD)

Confirmed folder structure with `find`, got the custom User model (role field: USER/ADMIN), ran migrations.

**Me:**
> Given the timeline, let's batch related changes together rather than iterating file by file — I'll review and commit them in logical groups.

Got serializers, views, urls, and the failing test file all together in one go, with a note to commit test/impl separately anyway to keep the TDD story intact.

Hit a wall running tests:
```
psycopg2.errors.InsufficientPrivilege: permission denied to create database
```
Turned out my Postgres user could write to tables but not spin up a fresh test DB. One-line fix:
```sql
ALTER USER dealership_user CREATEDB;
```
4/4 green after that.

---

## Phase 3 — Vehicles (TDD)

Same batched approach — model, serializer, admin-only permission class, views (CRUD + search + purchase + restock), urls, and 12 tests covering the main paths and the admin-only edge cases. All green on the first real run once files were in place.

---

## Phase 4 — Git Cleanup (twice)

Ran into a messy commit history after retrying some commands (mismatched `-m` messages, duplicated commits). Shared a screenshot of the GitHub commits page and asked:

**Me:**
> The commit history has a few duplicates from earlier retries — can you help me clean this up?

then, wanting to be careful given the stakes:

**Me:**
> This is going toward a company assignment submission, so I want to be deliberate here rather than risk losing any work — let's verify the current state before making any changes to history.

Claude made me paste `git log --oneline` and `git show --stat HEAD` before suggesting anything destructive, walked me through an interactive rebase to squash duplicates the first time, and a soft-reset + re-stage-in-groups the second time when auth and vehicles ended up jumbled into one commit. Force-pushed with `--force-with-lease` both times, verified the log after each step.

---

## Phase 5 — Seed Data + Coverage

Got a management command seeding an admin, a regular user, and 10 vehicles (including one at zero stock on purpose, to test the disabled-purchase-button UI later). Set up pytest-cov, landed at 92% coverage.

---

## Phase 6 — Frontend Bootstrap

Scaffolded with Vite (react-ts template), then hit a snag:
```
npx tailwindcss init -p
npm error could not determine executable to run
```
Tailwind v4 dropped the old CLI init entirely — Claude caught it, switched to the `@tailwindcss/vite` plugin approach instead. Built the axios client, types, and AuthContext after that.

---

## Phase 7 — Pages

Went in the order I specified: Login/Register pages first, then routing plus a placeholder dashboard to verify auth end-to-end, then the real dashboard (vehicle grid, search bar, purchase button disabled at zero quantity), then the admin panel (rendered only when `isAdmin` is true from context).

Hit one minor issue — `Failed to resolve import "./pages/DashboardPage"` — which turned out to be a file not yet saved at the correct path rather than a real bug.

---

## Phase 8 — The Login Bug

**Me:**
> Login is consistently returning 401 even with correct credentials. Here's the terminal output — let's debug this systematically. [pasted output]

This one took a few rounds of investigation. Checked the seeded users existed → fine. Checked `authenticate()` directly in the Django shell → fine. Checked the endpoint with raw curl → fine, valid tokens returned. So the backend was clean and the issue had to be on the frontend. Pulled the actual Network tab response and found it:
```json
"message": "Token is expired"
```
The axios interceptor was attaching an old expired token to the login request itself, so DRF rejected the whole request before it reached the login logic. Fixed by skipping the Authorization header on `/auth/` routes. Cleared localStorage, and it worked immediately after.

---

## Phase 9 — Polish

Added react-hot-toast, wired it into login/purchase/admin actions, swapped the loading text for a spinner. While taking screenshots of the admin panel for the README, I noticed a `-1` in a restock field had gone through without any validation error. Flagged it, and Claude added a 400 guard plus a regression test — 13/13 vehicle tests passing after.

---

## Phase 10 — Docs

**Me:**
> I'd like the AI Usage section to more clearly reflect my role in the collaboration — I directed the stack choice, sequencing, and outcomes throughout, and I want that represented accurately rather than reading as if the work was done solely by Claude. Could you also provide a structured template for this file so the log is organized rather than a raw dump?

Had Claude redo the README's AI Usage section to reflect what actually happened — I picked the stack, directed the sequencing, handled all the git history corrections by hand, ran and tested everything locally, and caught the restock validation gap through manual QA — rather than reading as if Claude built the project independently. Also had this file restructured by phase instead of a raw transcript, which is the format used here.

---

*Full commit history in the repository provides additional detail beyond this condensed log.*