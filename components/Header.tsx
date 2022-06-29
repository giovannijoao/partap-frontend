import { GridItem, Heading, Image } from "@chakra-ui/react";

export default function Header() {
  return <GridItem
    pl='2'
    bgGradient='linear-gradient(to-r, pink.400, pink.600)'
    area={'header'}
    display="flex"
    alignItems="center"
  >
    <Image color={"white"} src="/bx_home.svg" alt="Home" w={8} h={8} />
    <Heading pl='4' fontSize={"medium"} color="whiteAlpha.900">Partap</Heading>
  </GridItem>
}