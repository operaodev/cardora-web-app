export interface User {
  id: string;
  email: string;
  name: string;
  is_guest: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface SendCodeInput {
  email: string;
}

export interface UpgradeGuestInput {
  email: string;
  name: string;
  password: string;
  code: string;
}
