import type { AuthResponse, CreateTodoInput, PatchTodoInput, Todo } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5280';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const body = await response.json();
      if (typeof body.message === 'string') {
        message = body.message;
      } else if (body.errors) {
        const firstError = Object.values(body.errors).flat()[0];
        if (typeof firstError === 'string') {
          message = firstError;
        }
      }
    } catch {
      // Use default message when response body is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register(email: string, password: string) {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  login(email: string, password: string) {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getTodos(token: string, filter?: string) {
    const query = filter && filter !== 'all' ? `?filter=${filter}` : '';
    return request<Todo[]>(`/api/todos${query}`, {}, token);
  },

  createTodo(token: string, input: CreateTodoInput) {
    return request<Todo>(
      '/api/todos',
      { method: 'POST', body: JSON.stringify(input) },
      token
    );
  },

  patchTodo(token: string, id: number, input: PatchTodoInput) {
    return request<Todo>(
      `/api/todos/${id}`,
      { method: 'PATCH', body: JSON.stringify(input) },
      token
    );
  },

  deleteTodo(token: string, id: number) {
    return request<void>(`/api/todos/${id}`, { method: 'DELETE' }, token);
  },
};
