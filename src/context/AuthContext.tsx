import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  login: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getMe();
          // Backend returns: { status: 'success', data: { user: {...} } }
          const userData = response.data?.user || response.user || response;

          // Map backend user structure to frontend User interface
          const user: User = {
            id: userData.id,
            employeeId: userData.employee_id || userData.employee?.id || userData.id,
            name: userData.name || userData.full_name,
            email: userData.email,
            roles: userData.role_name ? [userData.role_name] : (userData.roles || [])
          };

          setUser(user);
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data: any) => {
    const res = await authService.login(data);
    // Backend returns: { status: 'success', token: string, data: { user: {...} } }
    const token = res.token || res.accessToken;
    const userData = res.data?.user || res.user;

    if (!token) {
      throw new Error('No token received from server');
    }

    if (!userData) {
      throw new Error('No user data received from server');
    }

    // Map backend user structure to frontend User interface
    // Backend has: id, name, email, role_name (string), permissions (array)
    // Frontend expects: id, name, email, roles (array)
    const user: User = {
      id: userData.id,
      employeeId: userData.employee_id || userData.employee?.id || userData.id,
      name: userData.name,
      email: userData.email,
      roles: userData.role_name ? [userData.role_name] : (userData.roles || [])
    };

    localStorage.setItem('token', token);
    setUser(user);
    // Ideally fetch full profile after login to be sure
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
