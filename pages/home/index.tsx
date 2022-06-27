import { Badge, Box, Flex, Grid, GridItem, Heading, Image, SimpleGrid, Stack, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import { ApiInstance } from "../../services/api";
import useSWR from "swr"

interface PropertyInformationResponse {
  data: Array<{
    _id: string;
    address: string;
    isRent: boolean;
    isSell: boolean;
    information: {
      bedrooms: number;
      parkingSlots: number;
      totalArea: number;
      description: string;
    }
    costs: {
      rentValue: number;
      condominiumValue: number;
      iptuValue: number;
      totalCost: number;
    }
  }>

}
const formatNumber = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 })
export default function HomePage() {
  const { isAuthenticated, isLoading: isLoadingUser, user } = useAuth();
  const { data: response, error } = useSWR(isAuthenticated ? '/properties' : null, ApiInstance, {
    refreshInterval: 60000
  })
  const isLoadingProperties = !response && !error;

  if (isLoadingUser || isLoadingProperties) return <></>;


  const items = response?.data.data.map(item => {
    return {
      ...item,
      costs: {
        totalCost: formatNumber.format(item.costs.totalCost)
      }
    };
  });
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
            items?.map(item => {
              return <Box
                w={"100%"}
                boxShadow='base'
                borderRadius="sm"
                key={item._id}
                display="flex"
                flexDirection="column"
              >
                <Image src="https://dwuka77wsfe40.cloudfront.net/resize/540x360/893526396-620.172499372029417012022MG1239.jpg" alt="Image" width="100%" />
                <Flex p={2}
                  direction="column"
                  grow="1">
                  <Heading fontSize="md" flex="1" flexGrow="1">{item.address}</Heading>
                  <Wrap mt={1}>
                    <WrapItem>
                      <Badge textTransform={"none"}>{item.information.totalArea}m²</Badge>
                    </WrapItem>
                    <WrapItem>
                      <Badge ml={1} textTransform={"none"}>{item.information.bedrooms} {item.information.bedrooms > 1 ? "quartos" : "quarto"}</Badge>
                    </WrapItem>
                    <WrapItem flexGrow="1" >
                      <Text width={"100%"} textAlign={"right"} fontWeight="bold" color="green" fontSize={"xs"}>Total {item.costs.totalCost}</Text>
                    </WrapItem>
                  </Wrap>
                </Flex>

              </Box>
            })
          }
        </SimpleGrid>
      </GridItem>
    </Grid>
  </>
}