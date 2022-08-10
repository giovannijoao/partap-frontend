import { Button, Center, Divider, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import Header from "../../components/Header";
import { ApiURL } from "../../config";
import { sessionOptions } from "../../lib/session";
import useUser from "../../lib/useUser";
import { ApiInstance } from "../../services/api";

type IProps = {
  userServerData: object
  plan: {
    planId: string
    active: boolean
  }
}

const plans = {
  'free_plan': {
    title: 'Gratuito',
    description: 'Com anúncios. 5 apartamentos. Compartilhamento com 1 pessoa. Atualização de imóveis semanal. Sem chat no imóvel.'
  },
  basic_plan: {
    title: 'Básico',
    description: 'Sem anúncios. 15 apartamentos disponíveis. Compartilhamento com 2 pessoas. Atualização de imóveis diária. Chat no imóvel.'
  },
  pro_plan: {
    title: 'Pro',
    description: 'Sem anúncios. Ilimitados apartamentos disponíveis. Compartilhamento ilimitado. Atualização de imóveis diária. Chat no imóvel.'
  }
}

export default function UserPage({
  plan,
  userServerData,
}: IProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser({
    redirectTo: '/login',
    fallback: userServerData
  });

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

  const planData = plans[plan.planId];
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
        w="lg"
        gap={4}
      >
        <Flex gap={4} alignItems='center'>
          <Image
            borderRadius='full'
            boxSize={24}
            src={`https://ui-avatars.com/api/?name=${user?.name}`}
            alt='Profile'
          />
          <Heading>{user.name}</Heading>
        </Flex>
        <Divider />
        <Flex gap={2}>
            <Text fontWeight={"bold"}>E-mail: </Text>
            <Text>{user.email}</Text>
        </Flex>
        <Flex
          flexDirection="column"
          boxShadow={"md"}
          p={4}
        >
          <Flex gap={2}>
            <Text fontWeight={"bold"}>Plano: </Text>
            <Text>{planData.title}</Text>
          </Flex>
          <Text>{planData.description}</Text>
        </Flex>
        <Flex mt={4} direction="column" gap={2}>
          <Button variant="ghost" onClick={handleBillingInformation} isLoading={isLoading}>Ver informações de cobrança</Button>
        </Flex>
      </Flex>
    </Center>
  </Flex>
}

export const getServerSideProps = withIronSessionSsr(async ({
  req,
  res
}) => {
  const result = await fetch(`${ApiURL}/subscription-plans`, {
    headers: {
      Authorization: req.session.user.token,
    },
  })
  const data = await result.json()
  return {
    props: {
      userServerData: req.session.user || null,
      plan: data.data || null,
    }
  }
}, sessionOptions)
