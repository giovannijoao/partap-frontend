import { Box, Button, Flex, FormControl, FormLabel, Grid, Heading, Input, SimpleGrid, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import { useAuth } from '../../contexts/AuthContext';
import useSWR from 'swr'
import { ApiInstance } from '../../services/api';

export default function Home() {
  const router = useRouter()
  const [signUpForm, setSignUpForm] = useState(false);
  const { register, handleSubmit } = useForm()
  const { isAuthenticating, isAuthenticated, signIn, signUp, authenticationError } = useAuth();
  const { data, error } = useSWR(isAuthenticated ? '/profile' : null, ApiInstance)

  useEffect(() => {
    console.log(data, error)
  }, [data, error])

  useEffect(() => {
    if (isAuthenticated) router.push('/home')
  }, [router, isAuthenticated])

  async function handleSignUp(info) {
    await signUp(info)
    await signIn(info, false);
  }

  return (
    <SimpleGrid
      w={"100vw"}
      h={"100vh"}
      columns={{ base: 1, md: 3 }}
      p={2}
      alignItems="center"
      justifyItems={"center"}
    >
      <div></div>
      <Flex
        alignSelf={"center"}
        direction="column"
        gap={2}
      >
        <Heading size={"2xl"} color="purple.500" textAlign="center">Partap</Heading>
        <Heading fontSize={'medium'} textAlign="center">Faça login para entrar</Heading>
        {!signUpForm && <>
          <form onSubmit={handleSubmit((info) => signIn(info))}>
            <Flex w="xs" direction="column" gap={2}>
              <Input required placeholder='E-mail' {...register('email')} />
              <Input required placeholder='Password' type="password" {...register('password')} />
              {authenticationError && <Text fontSize="sm" color="red.500" textAlign="center">{authenticationError}</Text>}
              <Button colorScheme='green' isLoading={isAuthenticating} type="submit">Entrar</Button>
            </Flex>
          </form>
          <Button size="sm" type="submit" onClick={() => setSignUpForm(true)}>Cadastrar</Button>
        </>}
        {signUpForm && <>
          <form onSubmit={handleSubmit(handleSignUp)}>
            <Flex w="xs" direction="column" gap={2}>
              <Input required placeholder='Nome' {...register('name')} />
              <Input required placeholder='E-mail' {...register('email')} />
              <Input required placeholder='Password' type="password" {...register('password')} />
              {authenticationError && <Text fontSize="sm" color="red.500" textAlign="center">Usuário já existe</Text>}
              <Button colorScheme='green' isLoading={isAuthenticating} type="submit">Cadastrar</Button>
            </Flex>
          </form>
          <Button size="sm" type="submit" onClick={() => setSignUpForm(false)}>Voltar ao login</Button>
        </>}
      </Flex>
      <div></div>
    </SimpleGrid>
  )
}
