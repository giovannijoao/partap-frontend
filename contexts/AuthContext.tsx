import { createContext, useContext, useEffect, useState } from "react";
import { ApiURL } from "../config";
import { setCookie, parseCookies } from 'nookies'


type SignInData = {
  email: string;
  password: string;
}

type AuthContextType = {
  isAuthenticated: boolean;
  signIn: (data: SignInData) => void;
}

type CookiesData = {
  token: string;
}

export const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({
  children
}) {
  const cookiesCtx = undefined;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const cookies = parseCookies(cookiesCtx) as CookiesData;
    if (cookies.token) setIsAuthenticated(true)
  }, [cookiesCtx])

  async function signIn(body: SignInData) {
    const result = await fetch(`${ApiURL}/sessions`, {
      "method": "POST",
      "body": JSON.stringify(body),
      "headers": {
        "Content-Type": "application/json"
      },
    })
    const data = await result.json();
    setCookie(cookiesCtx, 'token', data.data.token)
    setIsAuthenticated(true);
  }

  return <AuthContext.Provider value={{
    isAuthenticated,
    signIn,
  }}>
    {children}
  </AuthContext.Provider>
}