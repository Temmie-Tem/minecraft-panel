import { useState, useEffect } from 'react';
import api from '../api';

export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<UserProfile>('/auth/profile');
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return { user, loading };
}
