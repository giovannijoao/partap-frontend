import { Button, Flex, GridItem, Heading, Icon, Image } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaHome } from "react-icons/fa";
import useUser from "../lib/useUser";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useUser()
  return <GridItem
    bgGradient='linear-gradient(to-r, pink.400, pink.600)'
    area={'header'}
    display="flex"
    alignItems="center"
    py={2}
    px='4'
  >
    <Button
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
      onClick={() => router.push('/home')}
      >
      <Icon as={FaHome} color='white' h={6} w={6} />
      <Heading fontSize={"2xl"} color="whiteAlpha.900">PartAp</Heading>
    </Button>
    { user && <Flex ml="auto" alignItems="center" gap={2}>
      <Image
        borderRadius='full'
        boxSize='8'
        src={`https://ui-avatars.com/api/?name=${user.name}`}
        alt='Profile'
      />
      <Button size="xs" onClick={logout}>Sair</Button>
    </Flex> }
  </GridItem>
}