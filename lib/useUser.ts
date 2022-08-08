import { useCallback, useEffect } from 'react'
import Router from 'next/router'
import useSWR from 'swr'
import { IUser } from '../pages/api/user'
import { OwnAPI } from '../services/own-api'

export default function useUser({
  redirectTo = '',
  redirectIfFound = false,
  fallback = null,
} = {}) {
  const { data: user, mutate: mutateUser, error } = useSWR<IUser>('/api/user', url => OwnAPI.get(url).then(res => res.data), {
    fallbackData: fallback
  })

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn)
    ) {
      Router.push(redirectTo)
    }
  }, [user, redirectIfFound, redirectTo])

  const logout = useCallback(async () => {
    await OwnAPI.post(`/api/logout`);
    mutateUser({
      isLoggedIn: false,
    });
    Router.push("/login");
  }, [mutateUser]);

  return { user, mutateUser, error, logout }
}