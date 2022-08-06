import { Button, Center, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { FaHome, FaStickyNote } from "react-icons/fa";
import useUser from "../lib/useUser";

export default function Index() {
  const user = useUser({
    redirectIfFound: true,
    redirectTo: '/login'
  });
  return <Flex direction="column">
    <Flex
      direction="column"
      height="calc(100vh - 4rem)"
      bgGradient='linear-gradient(to-r, pink.400, pink.600)'
      justifyContent="center"
      p={8}
      gap={6}
    >
      <Flex direction='column' color="white">
        <Icon as={FaHome} h={14} w={14} />
        <Heading fontSize="6xl">PartAp</Heading>
        <Text fontSize="2xl">Seu novo jeito de organizar a busca por imóveis!</Text>
      </Flex>
      <Flex direction="column" w="sm">
        <Button>Entrar</Button>
      </Flex>
    </Flex>
    <Flex
      direction="column"
      height="calc(100vh - 4rem)"
      bgColor="pink.50"
      p={8}
      gap={6}
    >
      <Heading>Sobre a ferramenta</Heading>
      <Flex>
        <Flex
          direction="column"
          border={"2px"}
          borderColor="pink.500"
          borderRadius="lg"
          p={4}
        >
          <Flex alignItems="center" gap={2}>
            <Center
              p={4}
              bgColor="pink.400"
              color="white"
              borderRadius={"full"}
            >
              <Icon as={FaStickyNote} h={8} w={8} />
            </Center>
            <Heading fontSize='lg' color="pink.500">A evolução do bloco de notas</Heading>
          </Flex>
          <Text
            color="pink.700"
          >
            Deixe de lado o bloco de notas.
            Com
          </Text>
        </Flex>
      </Flex>
    </Flex>

  </Flex>
}