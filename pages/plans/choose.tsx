import { Box, Button, Center, Flex, Heading, HStack, List, ListIcon, ListItem, Stack, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode, useCallback, useState } from "react";
import { FaCheckCircle, FaCircle, FaTimesCircle } from "react-icons/fa";
import Header from "../../components/Header";
import useUser from "../../lib/useUser";
import { ApiInstance } from "../../services/api";

function PriceWrapper({ children }: { children: ReactNode }) {
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      // alignSelf={{ base: 'center', lg: 'flex-start' }}
      borderColor={'gray.200'}
      borderRadius={'xl'}>
      {children}
    </Box>
  );
}


export default function ChoosePlanPage() {
  const { user } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = useCallback(async (choice) => {
    setIsLoading(true);
    const response = await ApiInstance.post(`/payments/create-checkout-session`, {
      lookup_key: choice,
    }, {
      headers: {
        Authorization: user?.token
      }
    })

    const url = response.data.data.url;
    router.replace(url);
  }, [user?.token, router])
  return <Flex direction="column" height={"100vh"}>
    <Header />
    <Center flexDirection="column" flex={1} bgColor="gray.50">
      <Flex
        m={4}
        direction="column"
        bgColor="white"
        boxShadow={"lg"}
        p={4}
        borderRadius="lg"
      >
        <VStack spacing={2} textAlign="center">
          <Heading as="h1" fontSize="2xl">
            Planos que cabem no seu bolso
          </Heading>
          <Text fontSize="lg" color={'gray.500'}>
            Comece com um teste grátis por 3 dias. Cancele a qualquer momento.
          </Text>
        </VStack>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          textAlign="center"
          justify="center"
          spacing={{ base: 4, lg: 10 }}
          alignItems="center"
          py={10}>
          <PriceWrapper>
            <Box py={4} px={12}>
              <Text fontWeight="500" fontSize="2xl">
                Gratuito
              </Text>
            </Box>
            <VStack
              bg={'gray.50'}
              py={4}
              borderBottomRadius={'xl'}>
              <List spacing={3} textAlign="start" px={12}>
                <ListItem>
                  <ListIcon as={FaTimesCircle} color="red.500" />
                  Sem Anúncios
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  5 apartamentos
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Compartilhe com <span style={{
                    fontWeight: 'bold'
                  }}>1</span> pessoa
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Atualização de imóveis (Semanal)
                </ListItem>
                <ListItem>
                  <ListIcon as={FaTimesCircle} color="red.500" />
                  Chat no imóvel
                </ListItem>
              </List>
              <Box w="80%" pt={7}>
                <Button isLoading={isLoading} w="full" colorScheme="red" variant="outline">
                  Continuar com o plano gratuito
                </Button>
              </Box>
            </VStack>
          </PriceWrapper>

          <PriceWrapper>
            <Box position="relative">
              <Box
                position="absolute"
                top="-16px"
                left="50%"
                style={{ transform: 'translate(-50%)' }}>
                <Text
                  textTransform="uppercase"
                  bg={'red.300'}
                  px={3}
                  py={1}
                  color={'gray.900'}
                  fontSize="sm"
                  fontWeight="600"
                  rounded="xl">
                  Mais popular
                </Text>
              </Box>
              <Box py={4} px={12}>
                <Text fontWeight="500" fontSize="2xl">
                  Básico
                </Text>
                <HStack justifyContent="center">
                  <Text fontSize="3xl" fontWeight="600">
                    R$
                  </Text>
                  <Text fontSize="5xl" fontWeight="900">
                    4,99
                  </Text>
                  <Text fontSize="3xl" color="gray.500">
                    /semana
                  </Text>
                </HStack>
              </Box>
              <VStack
                bg={'gray.50'}
                py={4}
                borderBottomRadius={'xl'}>
                <List spacing={3} textAlign="start" px={12}>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Sem Anúncios
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    15 apartamentos
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Compartilhe com <span style={{
                      fontWeight: 'bold'
                    }}>2</span> pessoas
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Atualização de imóveis (Diária)
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Chat no imóvel
                  </ListItem>
                </List>
                <Box w="80%" pt={7}>
                  <Button isLoading={isLoading} w="full" colorScheme="red" onClick={() => handleCheckout('basic_plan')}>
                    Iniciar teste gratuito
                  </Button>
                </Box>
              </VStack>
            </Box>
          </PriceWrapper>

          <PriceWrapper>
            <Box py={4} px={12}>
              <Text fontWeight="500" fontSize="2xl">
                Familia
              </Text>
              <HStack justifyContent="center">
                <Text fontSize="3xl" fontWeight="600">
                  R$
                </Text>
                <Text fontSize="5xl" fontWeight="900">
                  10,99
                </Text>
                <Text fontSize="3xl" color="gray.500">
                  /semana
                </Text>
              </HStack>
            </Box>
            <VStack
              bg={'gray.50'}
              py={4}
              borderBottomRadius={'xl'}>
              <List spacing={3} textAlign="start" px={12}>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Sem Anúncios
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Apartamentos ilimitados
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Compartilhamento ilimitado
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Atualização de imóveis (Diária)
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Chat no imóvel
                </ListItem>
              </List>
              <Box w="80%" pt={7}>
                <Button isLoading={isLoading} w="full" colorScheme="red" variant="outline">
                  Iniciar teste gratuito
                </Button>
              </Box>
            </VStack>
          </PriceWrapper>
        </Stack>
      </Flex>
    </Center>
  </Flex>
}