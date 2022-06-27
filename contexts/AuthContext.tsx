import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiURL } from "../config";
import { setCookie, parseCookies } from 'nookies'
import { ApiInstance } from "../services/api";
import useSWR from 'swr'
import { useRouter } from "next/router";

type SignInData = {
  email: string;
  password: string;
}

type UserData = {
  name: string;
  email: string;
}

type AuthContextType = {
  isAuthenticated: boolean;
  signIn: (data: SignInData) => void;
  user: UserData;
  isLoading: boolean
}

export const AuthContext = createContext({} as AuthContextType)

export const cookiesCtx = undefined;
export function AuthProvider({
  children
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: fetchedUserData, error } = useSWR(isAuthenticated ? '/profile' : null, ApiInstance)

  const userData = fetchedUserData?.data.data || {};
  const isLoading = !fetchedUserData && !error;

  useEffect(() => {
    const cookies = parseCookies(cookiesCtx);
    if (cookies.token) {
      setIsAuthenticated(true)
    }
  }, [])

  async function signIn(body: SignInData) {
    const result = await ApiInstance.post(`${ApiURL}/sessions`, body)
    const data = result.data;
    setCookie(cookiesCtx, 'token', data.data.token, {
      maxAge: 24 * 60 * 60
    })
    setCookie(cookiesCtx, 'user', JSON.stringify(data.data.user), {
      maxAge: 24 * 60 * 60
    })
    setIsAuthenticated(true);
  }

  return <AuthContext.Provider value={{
    isAuthenticated,
    signIn,
    user: userData,
    isLoading,
  }}>
    {children}
  </AuthContext.Provider>
}

export function useAuth() {
  const data = useContext(AuthContext);
  return data;
}