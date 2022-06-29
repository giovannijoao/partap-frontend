import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiURL } from "../config";
import { destroyCookie, setCookie, parseCookies } from 'nookies'
import { ApiInstance } from "../services/api";
import useSWR from 'swr'
import { useRouter } from "next/router";
import { useToast } from "@chakra-ui/react";


type SignUpData = {
  name: string;
  email: string;
  password: string;
}

type SignInData = {
  email: string;
  password: string;
}

type UserData = {
  name: string;
  email: string;
}

type AuthContextType = {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  user: UserData;
  isLoading: boolean;
  authenticationError: string;

  signIn: (data: SignInData, toastSuccess?: boolean) => Promise<void>;
  signUp: (data: SignUpData, onSignUpSuccess?: () => void) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthContextType)

export const cookiesCtx = undefined;
export function AuthProvider({
  children
}) {
  const toast = useToast()
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticationError, setAuthenticationError] = useState("");
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

  async function signIn(body: SignInData, toastSuccess = true) {
    setAuthenticationError("")
    setIsAuthenticating(true)
    try {
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
      if (toastSuccess) toast({
        title: 'Bem vindo de volta',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      const message = error.response?.data?.message;
      if (message === "Incorrect email/password combination") {
        setAuthenticationError("Usuário não encontrado ou senha incorreta")
      } else {
        setAuthenticationError("Ocorreu um erro. Tente novamente")
      }
    }
    setIsAuthenticating(false)
  }

  async function signUp(body: SignInData, onSignUpSuccess) {
    setAuthenticationError("")
    setIsAuthenticating(true)
    try {
      await ApiInstance.post(`${ApiURL}/users`, body)
      toast({
        title: 'Bem vindo!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      if (onSignUpSuccess) onSignUpSuccess()
    } catch (error) {
      const message = error.response?.data?.message;
      if (message === "Email address already used") {
        setAuthenticationError("Você já está cadastrado. Faça login.")
      } else {
        setAuthenticationError("Ocorreu um erro. Tente novamente")
      }
    }
    setIsAuthenticating(false)
  }

  async function logout() {
    destroyCookie(cookiesCtx, `token`);
    destroyCookie(cookiesCtx, `user`);
    ApiInstance.defaults.headers['Authorization'] = "";
    setIsAuthenticated(false);
    router.push(`/login`)
  }

  return <AuthContext.Provider value={{
    isAuthenticating,
    isAuthenticated,
    authenticationError,
    user: userData,
    isLoading,
    signIn,
    signUp,
    logout,
  }}>
    {children}
  </AuthContext.Provider>
}

export function useAuth() {
  const data = useContext(AuthContext);
  return data;
}