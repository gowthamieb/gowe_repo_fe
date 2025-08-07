// auth.js (or authUtils.js)

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const login = (token, user) => {
  if (token && user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    console.warn('Login failed: Missing token or user info');
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
    return null;
  }
};
