const BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

const SESSION_STORAGE_KEY = 'lumina-auth-session';

export class ApiError extends Error {
  status: number;
  details?: { field: string; message: string }[];

  constructor(status: number, message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('lumina-auth-token');
    if (raw) return raw;
    // Fallback: extract from session object
    const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed?.token) return parsed.token;
    }
  } catch {
    return null;
  }
  return null;
}

export function setToken(token: string) {
  localStorage.setItem('lumina-auth-token', token);
}

export function clearToken() {
  localStorage.removeItem('lumina-auth-token');
}

function redirectToLogin() {
  clearToken();
  localStorage.removeItem(SESSION_STORAGE_KEY);
  window.location.hash = '#/login';
}

interface RequestOptions {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string> || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    redirectToLogin();
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data.error || `Request failed with status ${res.status}`,
      data.details,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
