import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  institution: string;
  department: string;
  role: 'teacher' | 'admin';
  avatarInitials: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  sendOtp: (email: string) => Promise<{ success: boolean; code: string }>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  pendingOtpCode: string | null;
  register: (data: Omit<UserProfile, 'id' | 'role' | 'avatarInitials'> & { password?: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'alix_auth_teacher';
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

  const login = async (email: string): Promise<boolean> => {
    const name = email
      .split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const profile: UserProfile = {
      id: `teacher-${Date.now()}`,
      email,
      name: name || 'Faculty Member',
      institution: 'Academic Institution',
      department: 'Faculty Department',
      role: 'teacher',
      avatarInitials: (name || email).slice(0, 2).toUpperCase(),
    };
    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    return true;
  };

  /**
   * Generates a 6-digit OTP verification code.
   */
  const sendOtp = async (email: string): Promise<{ success: boolean; code: string }> => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingOtpCode(randomCode);
    sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify({ email, code: randomCode, timestamp: Date.now() }));
    return { success: true, code: randomCode };
  };

  /**
   * Validates the 6-digit OTP code and authorizes the educator.
   */
  const verifyOtp = async (email: string, code: string): Promise<boolean> => {
    const storedStr = sessionStorage.getItem(OTP_STORAGE_KEY);
    let expected = pendingOtpCode;

    if (storedStr) {
      try {
        const stored = JSON.parse(storedStr);
        if (stored.code) expected = stored.code;
      } catch {
        // fallback
      }
    }

    if (expected && code.trim() === expected.trim()) {
      await login(email);
      setPendingOtpCode(null);
      sessionStorage.removeItem(OTP_STORAGE_KEY);
      return true;
    }

    return false;
  };

  const register = async (
    data: Omit<UserProfile, 'id' | 'role' | 'avatarInitials'> & { password?: string }
  ): Promise<boolean> => {
    const profile: UserProfile = {
      id: `teacher-${Date.now()}`,
      name: data.name,
      email: data.email,
      institution: data.institution || 'University Faculty',
      department: data.department || 'Academic Department',
      role: 'teacher',
      avatarInitials: data.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };
    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
