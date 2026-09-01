type Listener = () => void;

const listeners = new Set<Listener>();
let cachedToken: string | null = null;

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function getAuthToken(): string | null {
  if (cachedToken === null) {
    cachedToken = readStoredToken();
  }
  return cachedToken;
}

export function setAuthToken(token: string | null) {
  cachedToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }
  notify();
}

export function subscribeAuthToken(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
