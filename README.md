# Finance Portal v6 — Functional Areas

Includes previous Home v5 tasks, Firebase Google sign-in, PWA files, and a new Functional Area modal.

## Deploy
Upload the **contents** of this folder (not its enclosing folder) to the root of your existing GitHub Pages repository. Commit and wait for deployment, then refresh the website. No Firebase rules changes needed: office data lives under `users/<uid>/offices`.

## First use
Sign in with Google, click **Functional Area**, then click **Import 4 supplied offices**. The import only works when the offices collection is empty; it does not automatically alter the database. Import contains 69 supplied functional areas across 4 offices, preserving their descriptions exactly as supplied, including truncated words and typos. Edit those later in the modal if needed.

## Operations
Switch offices via dropdown; add/edit/delete offices; add/edit/delete functional areas; search codes and descriptions. Deleting an office also deletes all its functional areas. Functional area codes are strings and may occur in different offices. All writes are scoped to the signed-in Google UID. Existing tasks are untouched.

## Note
This is a personal project. Don't commit service-account keys or private financial data to GitHub. Firebase web config is client-side and protected by database rules.


## v7 update
- Replaced colorful icon with minimal navy-and-white F logo.
- Removed Install app button from the Home page and its JavaScript listener.
- PWA manifest and service worker remain, so browser-menu installation is still possible.
- Cache version bumped to v7 for GitHub Pages updates.
- No Firebase configuration, rules, task data, or office data changed.
