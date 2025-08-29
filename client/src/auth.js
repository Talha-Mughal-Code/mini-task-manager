import api from './api';

// Simple event system for auth state changes
const authListeners = new Set();

export function addAuthListener(listener) {
  authListeners.add(listener);
}

export function removeAuthListener(listener) {
  authListeners.delete(listener);
}

function notifyAuthChange() {
  authListeners.forEach(listener => listener());
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  if (res.data?.data?.token) localStorage.setItem('token', res.data.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.data.user));
  notifyAuthChange(); // Notify listeners of auth change
  return res.data.data.user;
}

export async function register(name, email, password) {
  await api.post('/auth/register', { name, email, password });
  return login(email, password);
}

export async function logout() {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  notifyAuthChange(); // Notify listeners of auth change
}

export function getCurrentUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}
