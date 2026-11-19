import { auth, loginWithGoogle, logout, connectFirebase, onAuthStateChanged } from './firebase.js';
import { subscribeTasks, addTask, editTask, completeTask } from './tasks.js';
const $ = id => document.getElementById(id);
const state = { user: null, tasks: [], query: '', editingId: null, unsubscribe: null, authVersion: 0 };
const formatDate = ms => typeof ms === 'number' ? new Date(ms).toLocaleString() : 'Saving…';
const daysOpen = ms => typeof ms === 'number' ? Math.max(0, Math.floor((Date.now() - ms) / 86400000)) : '—';
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notice(message, kind = '') { $('auth-message').textContent = message; $('auth-message').className = `notice ${kind}`; }
function render() {
  const tasks = [...state.tasks].sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  $('total').textContent = state.user ? tasks.length : '—';
  $('progress').textContent = state.user ? tasks.filter(t => t.status === 'In progress').length : '—';
  const last = tasks.reduce((max,t) => Math.max(max, typeof t.updatedAt === 'number' ? t.updatedAt : 0),0);
  $('last-update').textContent = state.user ? (last ? new Date(last).toLocaleDateString() : '—') : '—';
  if (!state.user) { $('task-rows').innerHTML = '<tr><td colspan="5" class="empty">Sign in to view your tasks.</td></tr>'; return; }
  if (!tasks.length) { $('search-count').textContent = ''; $('task-rows').innerHTML = '<tr><td colspan="5" class="empty">No ongoing tasks yet. Click “Add task” to begin.</td></tr>'; return; }
  const query = state.query.trim().toLocaleLowerCase();
  const visibleTasks = query ? tasks.filter(t => [t.name, t.description, t.status].some(value => String(value ?? '').toLocaleLowerCase().includes(query))) : tasks;
  $('search-count').textContent = query ? `${visibleTasks.length} of ${tasks.length} tasks found` : `${tasks.length} ongoing task${tasks.length === 1 ? '' : 's'}`;
  if (!visibleTasks.length) { $('task-rows').innerHTML = '<tr><td colspan="5" class="empty">No matching tasks found. Try a different search.</td></tr>'; return; }
  $('task-rows').innerHTML = visibleTasks.map(t => `<tr class="task-row" data-id="${escapeHTML(t.id)}" tabindex="0" role="button" aria-label="Open ${escapeHTML(t.name)}"><td>${escapeHTML(t.name)}</td><td class="description-cell" title="${escapeHTML(t.description)}">${escapeHTML(t.description) || '—'}</td><td><span class="pill ${t.status === 'On hold' ? 'hold' : t.status === 'Waiting' ? 'wait' : t.status === 'Not started' ? 'new' : ''}">${escapeHTML(t.status)}</span></td><td>${daysOpen(t.createdAt)}</td><td>${escapeHTML(formatDate(t.updatedAt))}</td></tr>`).join('');
}
$('task-search').addEventListener('input', e => { state.query = e.target.value; $('clear-search').hidden = !state.query; render(); });
$('clear-search').addEventListener('click', () => { state.query = ''; $('task-search').value = ''; $('clear-search').hidden = true; render(); $('task-search').focus(); });
function openDialog(id = null) {
  const task = state.tasks.find(t => t.id === id);
  state.editingId = task?.id ?? null;
  $('task-form').reset(); $('form-error').textContent = '';
  $('dialog-title').textContent = task ? 'Task details' : 'Add task';
  $('task-name').value = task?.name ?? '';
  $('task-description').value = task?.description ?? '';
  $('task-status').value = task?.status ?? 'Not started';
  $('complete-task').hidden = !task;
  $('task-meta').hidden = !task;
  if (task) $('task-meta').textContent = `Created: ${formatDate(task.createdAt)}  ·  Last updated: ${formatDate(task.updatedAt)}  ·  Days open: ${daysOpen(task.createdAt)}`;
  $('task-dialog').showModal();
}
$('task-rows').addEventListener('click', e => { const row = e.target.closest('[data-id]'); if (row) openDialog(row.dataset.id); });
$('task-rows').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const row = e.target.closest('[data-id]'); if (row) { e.preventDefault(); openDialog(row.dataset.id); } } });
$('add-task').addEventListener('click', () => openDialog());
$('close-dialog').addEventListener('click', () => $('task-dialog').close());
$('cancel-dialog').addEventListener('click', () => $('task-dialog').close());
$('task-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (!state.user) return;
  const name = $('task-name').value.trim();
  if (!name) { $('form-error').textContent = 'Enter a task name.'; return; }
  const values = { name, description: $('task-description').value.trim(), status: $('task-status').value };
  $('save-task').disabled = true; $('form-error').textContent = '';
  try {
    if (state.editingId) await editTask(state.user.uid, state.editingId, values);
    else await addTask(state.user.uid, values);
    $('task-dialog').close();
  } catch (err) { $('form-error').textContent = `Could not save: ${err.message}`; }
  finally { $('save-task').disabled = false; }
});
$('complete-task').addEventListener('click', async () => {
  if (!state.user || !state.editingId) return;
  if (!confirm('Mark this task complete and permanently delete it from Firebase? This cannot be undone.')) return;
  $('complete-task').disabled = true; $('form-error').textContent = '';
  try { await completeTask(state.user.uid, state.editingId); $('task-dialog').close(); }
  catch (err) { $('form-error').textContent = `Could not delete: ${err.message}`; }
  finally { $('complete-task').disabled = false; }
});
$('login').addEventListener('click', async () => {
  $('login').disabled = true;
  try { await loginWithGoogle(); } catch (err) { notice(`Google sign-in failed: ${err.message}`, 'bad'); }
  finally { $('login').disabled = false; }
});
$('logout').addEventListener('click', async () => { try { await logout(); } catch (err) { notice(err.message, 'bad'); } });
onAuthStateChanged(auth, async user => {
  const version = ++state.authVersion;
  state.unsubscribe?.(); state.unsubscribe = null;
  state.user = user; state.tasks = []; state.query = ''; $('task-search').value = ''; $('clear-search').hidden = true; $('task-search').disabled = !user; $('search-count').textContent = ''; render();
  $('login').hidden = !!user; $('logout').hidden = !user; $('add-task').disabled = !user;
  if (!user) { notice('Sign in with Google to view and manage your ongoing work.'); return; }
  notice(`Signed in as ${user.displayName || user.email || 'Google user'}. Connecting…`);
  state.unsubscribe = subscribeTasks(user.uid, tasks => { if (version !== state.authVersion) return; state.tasks = tasks; render(); notice(`Connected · ${user.email || 'Google account'} · Tasks sync automatically`, 'ok'); }, err => { if (version === state.authVersion) notice(`Database error: ${err.message}`, 'bad'); });
  try { await connectFirebase(); } catch (err) { if (version === state.authVersion) notice(`Connection test failed: ${err.message}`, 'bad'); }
});
// Update elapsed-day counters while the portal remains open.
setInterval(() => { if (state.user && !$('task-dialog').open) render(); }, 60000);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.error));
let installPrompt;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; $('install').hidden = false; });
$('install').addEventListener('click', async () => { if (!installPrompt) return; await installPrompt.prompt(); installPrompt = null; $('install').hidden = true; });
