import { Heading } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext';
export default function Index() {
  const router = useRouter()
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) router.push('/home')
    router.push('/login')
  }, [router, isAuthenticated])

  return <></>
}
