export interface AuthResponse {
  token: string;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface PatchTodoInput {
  title?: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
  clearDueDate?: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';
