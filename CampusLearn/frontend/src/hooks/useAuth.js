import { useSelector } from 'react-redux';

export default function useAuth() {
  const auth = useSelector((s) => s.auth);
  return {
    user: auth.user,
    token: auth.token,
    loading: auth.loading,
    error: auth.error
  };
}
