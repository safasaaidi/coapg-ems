import api from '../../../services/api';

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(email: string, password: string): Promise<CurrentUser> {
    const response = await api.post<{ token: string }>('/auth/login', { email, password });
    const { token } = response.data;

    localStorage.setItem('authToken', token);

    // Le backend ne renvoie que le token — les infos utilisateur (id, email, role, nom)
    // sont extraites directement du token JWT décodé, pas d'un objet "user" séparé.
    const payload = JSON.parse(atob(token.split('.')[1]));
    const user: CurrentUser = {
      id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      firstName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ?? '',
      lastName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] ?? '',
    };

    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // authService.ts (vers la ligne 40)

getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    
    // Vérification : on ne parse que si la valeur existe et n'est pas "undefined"
    if (!userStr || userStr === "undefined") {
        return null;
    }

    try {
        return JSON.parse(userStr);
    } catch (e) {
        // En cas d'erreur de parsing, on nettoie le storage invalide
        localStorage.removeItem('user');
        return null;
    }
},
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
};