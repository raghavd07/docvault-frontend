import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');
    const loginTime = sessionStorage.getItem('loginTime');

    if (storedUser && storedToken && loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      if (elapsed > SESSION_DURATION) {
        // Session expired — clear everything
        sessionStorage.clear();
      } else {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', tokenData);
    sessionStorage.setItem('loginTime', Date.now().toString());
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;