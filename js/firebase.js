import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getDatabase, ref, get, set, push, update, remove, onValue, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, setPersistence, browserLocalPersistence, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
const firebaseConfig = {
  apiKey: 'AIzaSyBNti5UvD-uXS5xPmoL9Bua6pG8LkHzg1o',
  authDomain: 'finance-portal-734bf.firebaseapp.com',
  databaseURL: 'https://finance-portal-734bf-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'finance-portal-734bf',
  storageBucket: 'finance-portal-734bf.firebasestorage.app',
  messagingSenderId: '156657257216',
  appId: '1:156657257216:web:1ea8f9952e6d85b7d181e5'
};
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export { ref, get, set, push, update, remove, onValue, serverTimestamp, onAuthStateChanged };
export async function loginWithGoogle() {
  await setPersistence(auth, browserLocalPersistence);
  return signInWithPopup(auth, new GoogleAuthProvider());
}
export const logout = () => signOut(auth);
export async function connectFirebase() {
  if (!auth.currentUser) throw new Error('Sign in with Google first.');
  const path = ref(database, `users/${auth.currentUser.uid}/connectionTest`);
  await set(path, { connected: true, timestamp: serverTimestamp() });
  return (await get(path)).val();
}
