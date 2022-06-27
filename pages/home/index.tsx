import { Grid, GridItem, Heading } from "@chakra-ui/react";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "./styles"

export default function HomePage() {
  const { isLoading: isLoadingUser, user } = useAuth();
  if (isLoadingUser) return <></>;
  return <>
    <Grid
      templateAreas={`"header"
                  "controls"
                  "main"
                  "footer"`}
      gridTemplateRows={'50px min-content 1fr 30px'}
      gridTemplateColumns={'1fr'}
      gap='1'
    >
      <GridItem
        pl='2'
        bgGradient='linear-gradient(to-r, pink.400, pink.600)'
        area={'header'}
        display="flex"
        alignItems="center"
      >
        <Image src="/bx_home.svg" alt="Home" width={32} height={32} />
        <Heading pl='4' fontSize={"medium"} color="whiteAlpha.900">Partap</Heading>
      </GridItem>
      <Heading>{`Hello world ${user.name}`}</Heading>
    </Grid>
  </>
}