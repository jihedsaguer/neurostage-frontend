import type { UserDto, RoleDto, PermissionDto } from '../types/user';
import { BASE_URL } from '../../../config/config';
import { useAuthStore } from '@/features/auth/store/authStore';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roleIds?: string[];
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  roleIds?: string[];
  isActive?: boolean;
}

const getAuthHeaders = (): HeadersInit => {
  const accessToken = useAuthStore.getState().accessToken;

  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data as T;
};

export const fetchUsers = async (): Promise<UserDto[]> => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<UserDto[]>(response);
};

export const fetchUserById = async (userId: string): Promise<UserDto> => {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<UserDto>(response);
};

export const createUser = async (userData: CreateUserDto): Promise<UserDto> => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  return handleResponse<UserDto>(response);
};

export const updateUser = async (userId: string, userData: UpdateUserDto): Promise<UserDto> => {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  return handleResponse<UserDto>(response);
};

export const deleteUser = async (userId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  await handleResponse<void>(response);
};

export const fetchRoles = async (): Promise<RoleDto[]> => {
  const response = await fetch(`${BASE_URL}/roles`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<RoleDto[]>(response);
};

export const fetchPermissions = async (): Promise<PermissionDto[]> => {
  const response = await fetch(`${BASE_URL}/permissions`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<PermissionDto[]>(response);
};

