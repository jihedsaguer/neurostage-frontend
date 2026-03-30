import { useCallback, useEffect, useState } from 'react';
import type { UserDto, RoleDto } from '../types/user';
import type { CreateUserDto, UpdateUserDto } from '../api/userService';
import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  fetchRoles,
} from '../api/userService';

interface UseUsersResult {
  users: UserDto[];
  roles: RoleDto[];
  isLoading: boolean;
  error: string | null;
  fetchAllUsers: () => Promise<void>;
  getUserById: (userId: string) => Promise<UserDto>;
  createUser: (userData: CreateUserDto) => Promise<UserDto>;
  updateUser: (userId: string, userData: UpdateUserDto) => Promise<UserDto>;
  deleteUser: (userId: string) => Promise<void>;
  loadRoles: () => Promise<void>;
}

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    setError(message);
    throw err;
  };

  const fetchAllUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchUsers();
      setUsers(result);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (userId: string) => {
    try {
      return await fetchUserById(userId);
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, []);

  const createUserAction = useCallback(async (userData: CreateUserDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const created = await createUser(userData);
      setUsers((current) => [...current, created]);
      return created;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserAction = useCallback(async (userId: string, userData: UpdateUserDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await updateUser(userId, userData);
      setUsers((current) => current.map((user) => (user.id === userId ? updated : user)));
      return updated;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUserAction = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteUser(userId);
      setUsers((current) => current.filter((user) => user.id !== userId));
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    setError(null);

    try {
      const result = await fetchRoles();
      setRoles(result);
    } catch (err) {
      handleError(err);
    }
  }, []);

  useEffect(() => {
    void fetchAllUsers();
  }, [fetchAllUsers]);

  return {
    users,
    roles,
    isLoading,
    error,
    fetchAllUsers,
    getUserById,
    createUser: createUserAction,
    updateUser: updateUserAction,
    deleteUser: deleteUserAction,
    loadRoles,
  };
};
