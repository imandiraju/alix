import React, { createContext, useContext, useState, useEffect } from 'react';
import { REALTIME_URL } from '../services/socket';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  institution: string;
  department: string;
  subjects?: string[];
  role: 'teacher' | 'admin';
  aiEnabled?: boolean;
  avatarInitials: string;
}

export interface VerifyOtpResult {
  verified: boolean;
  user?: UserProfile;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  sendOtp: (email: string) => Promise<{ success: boolean; code: string }>;
  verifyOtp: (email: string, code: string) => Promise<VerifyOtpResult>;
  pendingOtpCode: string | null;
  register: (data: Omit<UserProfile, 'id' | 'role' | 'avatarInitials'> & { password?: string }) => Promise<boolean>;
  updateUser: (updatedUser: UserProfile, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'alix_auth_teacher';
const AUTH_TOKEN_KEY = 'alix_auth_token';
const OTP_STORAGE_KEY = 'alix_pending_otp';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [pendingOtpCode, setPendingOtpCode] = useState<string | null>(null);

  // Sync profile state with server on mount
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      fetch(`${REALTIME_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.user) {
            setUser(d.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(d.user));
          }
        })
        .catch(() => {});
    }
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();
    const res = await fetch(`${REALTIME_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const data = await res.json();
    if (res.ok && data.user) {
      setUser(data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
      if (data.token) localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      return true;
    }

    // Fail strictly with server error message
    throw new Error(data.error || 'Invalid email or password.');
  };

  /**
   * Dispatches a 6-digit confirmation code via Google Apps Script Webhook.
   */
  const sendOtp = async (email: string, name?: string): Promise<{ success: boolean; code: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    const res = await fetch(`${REALTIME_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, name }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, code: '' };
    }

    throw new Error(data.error || 'Failed to dispatch verification code.');
  };

  /**
   * Validates the 6-digit OTP code against the server database.
   */
  const verifyOtp = async (email: string, code: string): Promise<VerifyOtpResult> => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const res = await fetch(`${REALTIME_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid or expired confirmation code.');
    }

    if (data.verified) {
      if (data.user) {
        setUser(data.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        if (data.token) localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }
      return { verified: true, user: data.user };
    }

    throw new Error(data.error || 'Invalid code.');
  };

  const register = async (
    data: Omit<UserProfile, 'id' | 'role' | 'avatarInitials'> & { password?: string }
  ): Promise<boolean> => {
    const res = await fetch(`${REALTIME_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        email: data.email.toLowerCase().trim(),
      }),
    });

    const resData = await res.json();
    if (res.ok && resData.user) {
      setUser(resData.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(resData.user));
      if (resData.token) localStorage.setItem(AUTH_TOKEN_KEY, resData.token);
      return true;
    }

    throw new Error(resData.error || 'Registration failed.');
  };

  const updateUser = (updatedUser: UserProfile, token?: string) => {
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        sendOtp,
        verifyOtp,
        pendingOtpCode,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
