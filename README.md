# Finance Portal — GitHub Pages PWA

## Publish on GitHub Pages
1. Create a **public** repository named `finance-portal` in your GitHub account.
2. Upload **the contents of this folder** to the repository root (index.html must be in the root, not inside another folder). Do not upload any private credentials or personal records.
3. Go to **Settings → Pages → Build and deployment**, select **Deploy from a branch**, branch **main**, folder **/(root)**, then Save.
4. After deployment, open `https://YOUR-USERNAME.github.io/finance-portal/`. Allow several minutes for deployment.
5. In Firebase Console → Authentication → Settings → Authorized domains, add `YOUR-USERNAME.github.io` (domain only, without protocol/path).
6. Open the hosted site and sign in with Google. The same Google account sees the same task data in Firebase.

## Install
- Android Chrome: open the hosted site, choose Install app / Add to Home screen.
- iPhone Safari: Share → Add to Home Screen → Add.
- The PWA shell can be cached, but Firebase task sync and authentication require network connectivity.

## Structure
- `index.html`: Home dashboard
- `css/style.css`: responsive design
- `js/firebase.js`: Firebase setup and Google sign-in
- `js/tasks.js`: database task operations
- `js/app.js`: dashboard UI and search
- `manifest.json`: install metadata
- `sw.js`: app-shell service worker
- `assets/icons`: app icon assets

## Security
- Firebase web config is intended to be public. Never commit service-account keys.
- Keep Firebase Realtime Database rules scoped to `users/$uid` with Google-authenticated ownership checks.
- GitHub Pages site source is public. Firebase rules, not hidden JavaScript, protect your data.
- Firebase popup sign-in may not work in all installed PWA browsers; if this happens, sign in via the regular browser first or implement a redirect flow with a suitable auth domain.
