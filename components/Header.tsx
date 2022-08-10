import { Button, Flex, GridItem, Heading, Icon, Image, Link } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaHome } from "react-icons/fa";
import usePlanLimits from "../lib/usePlanLimits";
import useUser from "../lib/useUser";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useUser()
  const { limitsData } = usePlanLimits({});
  return <GridItem
    bgGradient='linear-gradient(to-r, pink.400, pink.600)'
    area={'header'}
    display="flex"
    alignItems="center"
    py={2}
    px='4'
  >
    <Link
      display="flex"
      alignItems="center"
      variant="ghost"
      _hover={{
        backgroundColor: undefined
      }}
      _active={{
        backgroundColor: undefined
      }}
      gap={2}
      href="/home"
      >
      <Icon as={FaHome} color='white' h={6} w={6} />
      <Heading fontSize={"2xl"} color="whiteAlpha.900">PartAp</Heading>
    </Link>
    { user && <Flex ml="auto" alignItems="center" gap={2}>
      { limitsData?.data.plan === 'free_plan' && <Link href="/plans/choose">
        <Button size="xs">Atualizar plano</Button>
      </Link> }
      {<Link href="/user">
        <Button size="xs">Meu Perfil</Button>
      </Link>}
      <Link href="/user"><Image
        borderRadius='full'
        boxSize='8'
        src={`https://ui-avatars.com/api/?name=${user.name}`}
        alt='Profile'
      /></Link>
      <Button size="xs" onClick={logout}>Sair</Button>
    </Flex> }
  </GridItem>
}