import api from '../../../services/api';

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatarUrl?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<CurrentUser> {
    const response = await api.post<{ token: string }>('/auth/login', { email, password });
    const { token } = response.data;

    localStorage.setItem('authToken', token);

    // Extraction des informations utilisateur depuis le payload du token JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    const firstName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ?? '';
    const lastName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] ?? '';
    const userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? 'Demandeur';

    const user: CurrentUser = {
      id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role: userRole,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim() || email.split('@')[0],
      avatarUrl: payload['avatarUrl'] ?? undefined,
    };

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', user.role);

    return user;
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  },

  getCurrentUser(): CurrentUser | null {
    const userStr = localStorage.getItem('user');

    if (!userStr || userStr === 'undefined') {
      return null;
    }

    try {
      const user: CurrentUser = JSON.parse(userStr);
      if (!user.fullName) {
        user.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0];
      }
      return user;
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
};