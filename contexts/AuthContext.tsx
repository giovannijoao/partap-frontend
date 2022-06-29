import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiURL } from "../config";
import { destroyCookie, setCookie, parseCookies } from 'nookies'
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
  user: UserData;
  isLoading: boolean

  signIn: (data: SignInData) => void;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthContextType)

export const cookiesCtx = undefined;
export function AuthProvider({
  children
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: fetchedUserData, error } = useSWR(isAuthenticated ? '/profile' : null, ApiInstance, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0
  })

  const userData = fetchedUserData?.data.data || {};
  const isLoading = !fetchedUserData && !error;

  useEffect(() => {
    const cookies = parseCookies(cookiesCtx);
    if (cookies.token) {
      ApiInstance.defaults.headers['Authorization'] = cookies.token;
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
    ApiInstance.defaults.headers['Authorization'] = data.data.token
    setIsAuthenticated(true);
  }

  async function logout() {
    destroyCookie(cookiesCtx, `token`);
    destroyCookie(cookiesCtx, `user`);
    ApiInstance.defaults.headers['Authorization'] = "";
    setIsAuthenticated(false);
    router.push(`/login`)
  }

  return <AuthContext.Provider value={{
    isAuthenticated,
    user: userData,
    isLoading,
    signIn,
    logout,
  }}>
    {children}
  </AuthContext.Provider>
}

export function useAuth() {
  const data = useContext(AuthContext);
  return data;
}