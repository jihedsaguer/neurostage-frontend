export interface AuthResponse {
      user: import('../../users/types/user').UserDto;
    accessToken: string;
  refreshToken: string;
}