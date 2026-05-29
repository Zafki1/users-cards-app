import type { User, UserFormData } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getUsers() {
  return request<User[]>('/users');
}

export function getUser(id: string) {
  return request<User & { cards: UserFormData['cards'] }>(`/users/${id}`);
}

export function createUser(data: UserFormData) {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateUser(id: string, data: UserFormData) {
  return request<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function deleteUser(id: number) {
  return request<void>(`/users/${id}`, {
    method: 'DELETE'
  });
}

