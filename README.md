# Finance Portal — Home v4 (Task cards)

Upload all files and folders to the root of your existing GitHub Pages `finance-portal` repository. The same Firebase project, Google sign-in, database paths, and rules remain in place.

## Features
- Responsive cards (no horizontal table scrolling)
- Task name is the full description; no separate description field
- Free-text latest status; separate Update Status button
- Created date, last updated date, days open
- Edit, Update Status, Complete, Delete actions on each card
- Search, Firebase live sync, Google sign-in, PWA support

## Existing data
Older tasks with both `name` and `description` keep their existing database records. Cards display `name` (or `description` as a fallback). The old separate `description` value is not displayed or edited. If needed, copy important old description text into the task name before replacing the old workflow. Editing a task does not delete its legacy `description` field.

**Complete** and **Delete** both permanently remove the record after confirmation.

After deployment, reload the page to update the service worker.

## v5 visual update
Higher-contrast task cards on a pale blue-gray background, darker borders, a blue accent edge, stronger shadow, and a tinted status area. No changes to Firebase paths or task logic. The service-worker cache is versioned v5 to pick up the CSS changes.
