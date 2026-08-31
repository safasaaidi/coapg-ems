import api from './api';

export interface LoginCredentials {
  email: string;
  password: string; // Doit être 'password' pour correspondre au DTO C# LoginRequest
}

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      // 🟢 Utilisation de 'authToken' pour correspondre à api.ts et App.tsx
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getCurrentUser(): UserInfo | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
};