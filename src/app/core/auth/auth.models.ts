export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
}

export interface ExternalLoginDto {
  id: string;
  userId: string;
  provider: string;
  providerKey: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  hasPassword: boolean;
  externalLogins: ExternalLoginDto[];
}

export interface UpdateProfileDto {
  username: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserDtoShort {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details: string | null;
}