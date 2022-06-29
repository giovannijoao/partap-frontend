import { Box, Button, Flex, FormControl, FormLabel, Grid, Heading, Input, SimpleGrid, Text, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import { ApiInstance } from '../../services/api';
import { OwnAPI } from '../../services/own-api';
import useUser from '../../lib/useUser';

export default function Home() {
  const router = useRouter()
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [signUpForm, setSignUpForm] = useState(false);

  const { mutateUser, error } = useUser({
    redirectTo: '/home',
    redirectIfFound: true,
  })

  const { register, handleSubmit } = useForm()

  async function handleSignIn(info) {
    setIsLoading(true)
    try {
      const result = await OwnAPI.post("/api/login", info).then(res => res.data)
      mutateUser(result)
      toast({
        title: 'Bem vindo!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      if (error.response?.data?.message === "Incorrect email/password combination") {
        setErrorMsg("Usuário não encontrado ou senha incorreta")
      } else {
        setErrorMsg("Ocorreu um erro. Tente novamente")
      }
    }
    setIsLoading(false)
  }

  async function handleSignUp(info) {
    setIsLoading(true)
    try {
      await ApiInstance.post(`/users`, info)
      handleSignIn(info)
    } catch (error) {
      const message = error.response?.data?.message;
      if (message === "Email address already used") {
        setErrorMsg("Você já está cadastrado. Faça login.")
      } else {
        setErrorMsg("Ocorreu um erro. Tente novamente")
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setErrorMsg("")
  }, [signUpForm])

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
          <form onSubmit={handleSubmit(handleSignIn)}>
            <Flex w="xs" direction="column" gap={2}>
              <Input required placeholder='E-mail' {...register('email')} />
              <Input required placeholder='Password' type="password" {...register('password')} />
              {errorMsg && <Text fontSize="sm" color="red.500" textAlign="center">{errorMsg}</Text>}
              <Button
               colorScheme='green'
               isLoading={isLoading}
               type="submit">Entrar</Button>
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
              {errorMsg && <Text fontSize="sm" color="red.500" textAlign="center">{errorMsg}</Text>}
              <Button colorScheme='green' isLoading={isLoading} type="submit">Cadastrar</Button>
            </Flex>
          </form>
          <Button size="sm" type="submit" onClick={() => setSignUpForm(false)}>Voltar ao login</Button>
        </>}
      </Flex>
      <div></div>
    </SimpleGrid>
  )
}
