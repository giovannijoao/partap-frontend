import { Box, Button, Center, Flex, FormControl, FormLabel, Grid, Heading, Icon, Input, SimpleGrid, Text, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import { ApiInstance } from '../../services/api';
import { OwnAPI } from '../../services/own-api';
import useUser from '../../lib/useUser';
import { FaHome } from 'react-icons/fa';

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
    <Center
      w={"100vw"}
      h={"100vh"}
      alignItems="center"
      justifyItems={"center"}
    >
      <Flex
        alignSelf={"center"}
        direction="column"
        boxShadow="lg"
        borderRadius="md"
      >
        <Flex
          bgGradient='linear-gradient(to-r, pink.400, pink.600)'
          direction="column"
          alignItems={"center"}
          py={4}
          borderTopRadius="lg"
        >
          <Center flexDirection="column">
            <Icon as={FaHome} h={12} w={12} color="white" />
            <Heading size={"2xl"} color="white" textAlign="center">Partap</Heading>
            <Text w="70%" wordBreak={'break-word'} color="white" textAlign="center" fontSize="sm" mt={2}>Seu novo jeito de organizar a procura por imóveis</Text>
          </Center>
        </Flex>
        <Flex
          direction="column"
          gap={2}
          py={8}
          px={12}
        >
          <Heading fontSize={'medium'} textAlign="center">Faça login para entrar</Heading>
          {!signUpForm && <>
            <form onSubmit={handleSubmit(handleSignIn)}>
              <Flex w="xs" direction="column" gap={2}>
                <Input required placeholder='E-mail' {...register('email')} />
                <Input required placeholder='Senha' type="password" {...register('password')} />
                {errorMsg && <Text fontSize="sm" color="red.500" textAlign="center">{errorMsg}</Text>}
                <Button
                  colorScheme='green'
                  isLoading={isLoading}
                  type="submit">Entrar</Button>
              </Flex>
            </form>
            <Button size="sm" variant="ghost" type="submit" onClick={() => setSignUpForm(true)}>Cadastrar</Button>
          </>}
          {signUpForm && <>
            <form onSubmit={handleSubmit(handleSignUp)}>
              <Flex w="xs" direction="column" gap={2}>
                <Input required placeholder='Nome' {...register('name')} />
                <Input required placeholder='E-mail' {...register('email')} />
                <Input required placeholder='Senha' type="password" {...register('password')} />
                {errorMsg && <Text fontSize="sm" color="red.500" textAlign="center">{errorMsg}</Text>}
                <Button colorScheme='green' isLoading={isLoading} type="submit">Cadastrar</Button>
              </Flex>
            </form>
            <Button size="sm" type="submit" onClick={() => setSignUpForm(false)}>Voltar ao login</Button>
          </>}
        </Flex>

      </Flex>
    </Center>
  )
}
