import type { UserDto } from './user';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}
