import { Box, Button, Flex, FormControl, FormLabel, Grid, Heading, Input, SimpleGrid } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react'
import { useForm } from "react-hook-form";
import { AuthContext } from '../../contexts/AuthContext';
import useSWR from 'swr'
import { ApiInstance } from '../../services/api';

export default function Home() {
  const router = useRouter()
  const { register, handleSubmit } = useForm()
  const { isAuthenticated, signIn } = useContext(AuthContext);
  const { data, error } = useSWR(isAuthenticated ? '/profile' : null, ApiInstance)

  useEffect(() => {
    console.log(data, error)
  }, [data, error])

  useEffect(() => {
    if (isAuthenticated) router.push('/home')
  }, [router, isAuthenticated])

  async function handleSignIn(info) {
    signIn(info)
  }

  return (
    <SimpleGrid
      w={"full"}
      h={"full"}
      columns={{base: 1, md: 3}}
      p={2}
      justifyItems={"center"}
    >
      <div></div>
      <Box
        alignSelf={"center"}
      >
        <Heading size={"2xl"} textAlign="center">Partap</Heading>
        <Box
          mt={4}
          display={"flex"}
          flexDir="column"
          gap={1}
        >
          <Heading fontSize={'medium'} textAlign="center">Faça login para entrar</Heading>
          <form onSubmit={handleSubmit(handleSignIn)}>
            <FormControl>
              <Flex direction="column" gap={2}>
                <Input placeholder='E-mail' {...register('email')} />
                <Input placeholder='Password' type="password" {...register('password')} />
                <Button type="submit">Entrar</Button>
              </Flex>
            </FormControl>
          </form>
        </Box>
      </Box>
      <div></div>
    </SimpleGrid>
  )
}
