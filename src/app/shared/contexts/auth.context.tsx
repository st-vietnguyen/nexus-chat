import React, { createContext, useState } from 'react';

export interface User {
  email: string;
  firstName: string;
  gender: string;
  id: number
  image: string
  lastName: string
  token: string
  username: string
}

export interface AuthData {
  data: User | null;
  isAuthenticated: boolean
  login: (data: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthData | null>(null);

export const AuthProvider = (props) => {
  const [data, setData] = useState<User>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (user: User) => {
    setData(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setData(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ data, isAuthenticated, login, logout }} {...props}>
      {props.children}
    </AuthContext.Provider>
  );
};
