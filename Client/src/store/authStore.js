import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: (() => {
    try {
      const storedProfile = localStorage.getItem('menumitra_profile');
      return storedProfile ? JSON.parse(storedProfile) : null;
    } catch (e) {
      console.error('Failed to parse cached authentication profile in store creation', e);
      return null;
    }
  })(),
  token: localStorage.getItem('menumitra_token') || null,
  role: localStorage.getItem('menumitra_role') || null,
  loading: false,
  error: null,

  // Initialize auth state from local storage
  initAuth: () => {
    try {
      const storedProfile = localStorage.getItem('menumitra_profile');
      const token = localStorage.getItem('menumitra_token');
      const role = localStorage.getItem('menumitra_role');
      
      if (storedProfile && token && role) {
        set({
          user: JSON.parse(storedProfile),
          token,
          role,
          error: null
        });
      }
    } catch (e) {
      console.error('Failed to parse cached authentication profile', e);
      get().logout();
    }
  },

  // Owner or Admin Login
  login: async (emailOrLoginId, password, isAdmin = false) => {
    set({ loading: true, error: null });
    try {
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
      const payload = isAdmin 
        ? { login_id: emailOrLoginId, password } 
        : { email: emailOrLoginId, password };

      const response = await api.post(endpoint, payload);
      const { token, role, user, admin } = response.data;
      
      const profile = user || admin;

      // Cache session in localStorage
      localStorage.setItem('menumitra_token', token);
      localStorage.setItem('menumitra_role', role);
      localStorage.setItem('menumitra_profile', JSON.stringify(profile));

      set({
        token,
        role,
        user: profile,
        loading: false,
        error: null
      });

      return { success: true, role };
    } catch (err) {
      set({ loading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  // Signup Owner: Handles registration, caches token, starts trial
  signup: async (signUpDetails) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/signup', signUpDetails);
      const { token, role, user } = response.data;

      // Cache session in localStorage
      localStorage.setItem('menumitra_token', token);
      localStorage.setItem('menumitra_role', role);
      localStorage.setItem('menumitra_profile', JSON.stringify(user));

      set({
        token,
        role,
        user,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (err) {
      set({ loading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  // Set Profile Updates
  updateProfileState: (updatedProfile) => {
    localStorage.setItem('menumitra_profile', JSON.stringify(updatedProfile));
    set({ user: updatedProfile });
  },

  // Logout Session
  logout: () => {
    localStorage.removeItem('menumitra_token');
    localStorage.removeItem('menumitra_role');
    localStorage.removeItem('menumitra_profile');
    
    set({
      user: null,
      token: null,
      role: null,
      error: null
    });
  }
}));
