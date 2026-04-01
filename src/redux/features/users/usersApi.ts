import { baseApi } from '../../api/baseApi';
import type { UserDto, RoleDto, PermissionDto } from '@/types/user';

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

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchUsers: builder.query<UserDto[], void>({
      query: () => ({ url: '/users' }),
      providesTags: ['User'],
    }),
    fetchUserById: builder.query<UserDto, string>({
      query: (userId) => ({ url: `/users/${userId}` }),
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),
    createUser: builder.mutation<UserDto, CreateUserDto>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<UserDto, { userId: string; userData: UpdateUserDto }>({
      query: ({ userId, userData }) => ({
        url: `/users/${userId}`,
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    fetchRoles: builder.query<RoleDto[], void>({
      query: () => ({ url: '/roles' }),
      providesTags: ['Role'],
    }),
    fetchPermissions: builder.query<PermissionDto[], void>({
      query: () => ({ url: '/permissions' }),
      providesTags: ['Permission'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useFetchUsersQuery,
  useFetchUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useFetchRolesQuery,
  useFetchPermissionsQuery,
} = usersApi;
