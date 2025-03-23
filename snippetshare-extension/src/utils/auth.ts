let firebaseToken: string | null = null;

export function setToken(token: string) {
  firebaseToken = token;
}

export function getToken() {
  return firebaseToken;
}

export function clearToken() {
  firebaseToken = null;
}
