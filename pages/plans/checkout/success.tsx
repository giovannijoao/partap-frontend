
import Header from "../../../components/Header";
import { Button, Center, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ApiInstance } from "../../../services/api";
import useUser from "../../../lib/useUser";
import { useCallback, useState } from "react";

export default function PlansCheckoutSuccess() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBillingInformation = useCallback(async () => {
    setIsLoading(true);
    const response = await ApiInstance.get(`/payments/portal-session`, {
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
        w={{
          base: 'full',
          md: '2xl'
        }}
        h={{
          base: 'full',
          md: 'sm'
        }}
        textAlign="center"
        alignItems={"center"}
        justifyContent="center"
      >
        <Heading textAlign="center" fontSize="2xl">Deu tudo certo com a assinatura.</Heading>
        <Text fontSize="lg" color={'gray.500'}>
          Agora você pode aproveitar dos recursos do seu plano.
        </Text>
        <Flex mt={4} direction="column" gap={2}>
          <Link href="/home"><Button colorScheme={"purple"} isDisabled={isLoading}>Prosseguir para página inicial</Button></Link>
          <Button variant="ghost" onClick={handleBillingInformation} isLoading={isLoading}>Ver informações de cobrança</Button>
        </Flex>
      </Flex>
    </Center>
  </Flex>
}