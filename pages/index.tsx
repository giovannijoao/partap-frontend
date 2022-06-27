import useSwr from 'swr'
import { Box, Button, Grid, Heading, Input } from '@chakra-ui/react'
import React from 'react'

export default function Home() {
  return (
    <Grid
      w={"full"}
      h={"full"}
      templateColumns={"repeat(3, 1fr)"}
      templateRows=""
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
          <Input placeholder='E-mail' />
          <Input placeholder='Password' type="password" />
          <Button>Entrar</Button>
        </Box>
      </Box>
      <div></div>
    </Grid>
  )
}
