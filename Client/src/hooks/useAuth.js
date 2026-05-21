import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, role, loading, error, login, signup, logout, updateProfileState } = useAuthStore();

  const isAuthenticated = !!token;
  const isOwner = isAuthenticated && role === 'owner';
  const isAdmin = isAuthenticated && role === 'admin';

  return {
    user,
    token,
    role,
    loading,
    error,
    isAuthenticated,
    isOwner,
    isAdmin,
    login,
    signup,
    logout,
    updateProfile: updateProfileState
  };
};
