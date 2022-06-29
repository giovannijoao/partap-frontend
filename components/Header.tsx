import { Button, Flex, GridItem, Heading, Image } from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth()
  return <GridItem
    bgGradient='linear-gradient(to-r, pink.400, pink.600)'
    area={'header'}
    display="flex"
    alignItems="center"
    py={2}
    px='4'
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      width={36}
      height={36}
      viewBox="0 0 24 24"
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path
        fill="white"
        d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4zm2-15.586 6 6V15l.001 5H16v-5c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H6v-9.586l6-6z"
      />
    </svg>
    <Heading pl='4' fontSize={"2xl"} color="whiteAlpha.900">PartAp</Heading>
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