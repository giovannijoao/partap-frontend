
import { Button, Center, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import HeaderV2 from "../../../components/HeaderV2";
import useUser from "../../../lib/useUser";

export default function PlansCheckoutSuccess() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return <Flex direction="column" height={"100vh"}>
    <HeaderV2 />
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
        <Heading textAlign="center" fontSize="2xl">Ops!</Heading>
        <Text fontSize="lg" color={'gray.500'}>
          Parece que não deu certo com o pagamento. Sua assinatura continua a mesma.
        </Text>
        <Flex mt={4} direction="column" gap={2}>
          <Link href="/home"><Button colorScheme={"purple"} isDisabled={isLoading}>Prosseguir para página inicial</Button></Link>
        </Flex>
      </Flex>
    </Center>
  </Flex>
}