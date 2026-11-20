import { auth, loginWithGoogle, logout, connectFirebase, onAuthStateChanged } from './firebase.js';
import { subscribeTasks, addTask, editTask, completeTask, updateTaskStatus, deleteTask } from './tasks.js';
const $ = id => document.getElementById(id);
const state = { user: null, tasks: [], query: '', editingId: null, unsubscribe: null, authVersion: 0 };
const formatDate = ms => typeof ms === 'number' ? new Date(ms).toLocaleString() : 'Saving…';
const daysOpen = ms => typeof ms === 'number' ? Math.max(0, Math.floor((Date.now() - ms) / 86400000)) : '—';
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notice(message, kind = '') { $('auth-message').textContent = message; $('auth-message').className = `notice ${kind}`; }
function render() {
  const tasks = [...state.tasks].sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  $('total').textContent = state.user ? tasks.length : '—';
  $('progress').textContent = state.user ? tasks.filter(t => typeof t.updatedAt === 'number' && new Date(t.updatedAt).toDateString() === new Date().toDateString()).length : '—';
  const last = tasks.reduce((max,t) => Math.max(max, typeof t.updatedAt === 'number' ? t.updatedAt : 0),0);
  $('last-update').textContent = state.user ? (last ? new Date(last).toLocaleDateString() : '—') : '—';
  if (!state.user) { $('task-cards').innerHTML = '<p class="empty">Sign in to view your tasks.</p>'; return; }
  if (!tasks.length) { $('search-count').textContent = ''; $('task-cards').innerHTML = '<p class="empty">No ongoing tasks yet. Click “Add task” to begin.</p>'; return; }
  const query = state.query.trim().toLocaleLowerCase();
  const visibleTasks = query ? tasks.filter(t => [t.name, t.description, t.status].some(value => String(value ?? '').toLocaleLowerCase().includes(query))) : tasks;
  $('search-count').textContent = query ? `${visibleTasks.length} of ${tasks.length} tasks found` : `${tasks.length} ongoing task${tasks.length === 1 ? '' : 's'}`;
  if (!visibleTasks.length) { $('task-cards').innerHTML = '<p class="empty">No matching tasks found. Try a different search.</p>'; return; }
  $('task-cards').innerHTML = visibleTasks.map(t => `
    <article class="task-card" data-id="${escapeHTML(t.id)}">
      <div class="task-card-top"><div class="task-card-title-wrap"><span class="task-card-kicker">ONGOING WORK</span><h3>${escapeHTML(t.name || t.description || 'Untitled task')}</h3></div><span class="days-badge">${daysOpen(t.createdAt)} days open</span></div>
      <div class="latest-status"><span class="field-caption">Status / latest update</span><p>${escapeHTML(t.status) || '<span class="muted">No update yet</span>'}</p></div>
      <div class="task-dates"><span><b>Created</b>${escapeHTML(formatDate(t.createdAt))}</span><span><b>Last updated</b>${escapeHTML(formatDate(t.updatedAt))}</span></div>
      <div class="card-actions"><button type="button" class="ghost" data-action="edit">Edit</button><button type="button" class="primary" data-action="status">Update status</button><button type="button" class="complete-button" data-action="complete">Complete</button><button type="button" class="danger" data-action="delete">Delete</button></div>
    </article>`).join('');
}
$('task-search').addEventListener('input', e => { state.query = e.target.value; $('clear-search').hidden = !state.query; render(); });
$('clear-search').addEventListener('click', () => { state.query = ''; $('task-search').value = ''; $('clear-search').hidden = true; render(); $('task-search').focus(); });
let dialogMode = 'edit';
function openDialog(id = null, mode = 'edit') {
  const task = state.tasks.find(t => t.id === id);
  state.editingId = task?.id ?? null;
  dialogMode = mode;
  $('task-form').reset(); $('form-error').textContent = '';
  $('dialog-title').textContent = !task ? 'Add task' : mode === 'status' ? 'Update status' : 'Edit task';
  $('task-name').value = task?.name || task?.description || '';
  $('task-status').value = task?.status ?? '';
  $('task-name').hidden = mode === 'status';
  document.querySelector('label[for="task-name"]').hidden = mode === 'status';
  $('task-name').required = mode !== 'status';
  $('complete-task').hidden = !task;
  $('delete-task').hidden = !task;
  $('save-task').textContent = mode === 'status' ? 'Save status update' : 'Save task';
  $('task-meta').hidden = !task;
  if (task) $('task-meta').textContent = `Created: ${formatDate(task.createdAt)}  ·  Last updated: ${formatDate(task.updatedAt)}  ·  Days open: ${daysOpen(task.createdAt)}`;
  $('task-dialog').showModal();
}
async function removeTask(id, action) {
  if (!state.user || !id) return;
  const wording = action === 'complete' ? 'Complete this task and permanently remove it from Firebase?' : 'Permanently delete this task from Firebase?';
  if (!confirm(`${wording} This cannot be undone.`)) return;
  try {
    if (action === 'complete') await completeTask(state.user.uid, id);
    else await deleteTask(state.user.uid, id);
    if ($('task-dialog').open) $('task-dialog').close();
  } catch (err) { alert(`Could not remove task: ${err.message}`); }
}
$('task-cards').addEventListener('click', e => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;
  const id = button.closest('.task-card')?.dataset.id;
  if (!id) return;
  if (button.dataset.action === 'edit') openDialog(id);
  if (button.dataset.action === 'status') openDialog(id, 'status');
  if (button.dataset.action === 'complete' || button.dataset.action === 'delete') removeTask(id, button.dataset.action);
});
$('add-task').addEventListener('click', () => openDialog());
$('close-dialog').addEventListener('click', () => $('task-dialog').close());
$('cancel-dialog').addEventListener('click', () => $('task-dialog').close());
$('task-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (!state.user) return;
  const name = $('task-name').value.trim();
  if (dialogMode !== 'status' && !name) { $('form-error').textContent = 'Enter a task name.'; return; }
  const values = { name, status: $('task-status').value.trim() };
  $('save-task').disabled = true; $('form-error').textContent = '';
  try {
    if (state.editingId && dialogMode === 'status') await updateTaskStatus(state.user.uid, state.editingId, values.status);
    else if (state.editingId) await editTask(state.user.uid, state.editingId, values);
    else await addTask(state.user.uid, values);
    $('task-dialog').close();
  } catch (err) { $('form-error').textContent = `Could not save: ${err.message}`; }
  finally { $('save-task').disabled = false; }
});
$('complete-task').addEventListener('click', () => removeTask(state.editingId, 'complete'));
$('delete-task').addEventListener('click', () => removeTask(state.editingId, 'delete'));
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
