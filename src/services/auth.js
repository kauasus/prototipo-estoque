export function login(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  localStorage.clear();
}

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}
