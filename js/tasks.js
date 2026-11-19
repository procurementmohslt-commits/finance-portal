import { database, ref, push, set, update, remove, onValue, serverTimestamp } from './firebase.js';
const tasksPath = uid => `users/${uid}/tasks`;
export function subscribeTasks(uid, onData, onError) {
  return onValue(ref(database, tasksPath(uid)), snap => {
    const raw = snap.val() || {};
    onData(Object.entries(raw).map(([id, task]) => ({ id, ...task })));
  }, onError);
}
export function addTask(uid, { name, description, status }) {
  const taskRef = push(ref(database, tasksPath(uid)));
  return set(taskRef, { name, description, status, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export function editTask(uid, id, { name, description, status }) {
  return update(ref(database, `${tasksPath(uid)}/${id}`), { name, description, status, updatedAt: serverTimestamp() });
}
export function completeTask(uid, id) {
  // Completion intentionally deletes the task permanently, as requested.
  return remove(ref(database, `${tasksPath(uid)}/${id}`));
}
