import { Badge, Box, Flex, Grid, GridItem, Heading, Image, SimpleGrid, Text } from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "./styles"

export default function HomePage() {
  const { isLoading: isLoadingUser, user } = useAuth();
  if (isLoadingUser) return <></>;
  const items = [1, 2, 3, 4, 5, 6];
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
        <Image src="/bx_home.svg" alt="Home" w={8} h={8} />
        <Heading pl='4' fontSize={"medium"} color="whiteAlpha.900">Partap</Heading>
      </GridItem>
      <GridItem area="controls">

      </GridItem>
      <GridItem
        area="main"
        m={2}
      >
        <SimpleGrid
          minChildWidth="200px"
          gap={4}
          >
          {
            items.map(item => {
              return <Box
                w={"100%"}
                boxShadow='base'
                borderRadius="sm"
                key={item}
              >
                <Image src="/image-example.png" alt="Image" />
                <Box p={2}>
                  <Heading fontSize="md">Rua Napoleão de Barros</Heading>
                  <Flex mt={1}>
                    <Badge>50m²</Badge>
                    <Badge ml={1}>1 quarto</Badge>
                    <Box flexGrow={1}/>
                    <Text color="green" fontSize={"xs"}>Total R$ 1.700</Text>
                  </Flex>
                </Box>

              </Box>
            })
          }
        </SimpleGrid>
      </GridItem>
    </Grid>
  </>
}