import { Badge, Box, Flex, Grid, GridItem, Heading, Image, Input, InputGroup, InputLeftElement, Select, SimpleGrid, Stack, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import { ApiInstance } from "../../services/api";
import useSWR from "swr"
import { ButtonChooserItem } from "./styles";
import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
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
    },
    images: {
      url: string;
      description: string;
    }[]
  }>

}

const formatNumber = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 })

export default function HomePage() {
  const { isAuthenticated, isLoading: isLoadingUser, user } = useAuth();
  const [addressFieldValue, setAddressFieldValue] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const { data: response, error } = useSWR(isAuthenticated ? ['/properties', addressFilter] : null, (url, args) => {
    return ApiInstance.get(url, {
      params: {
        ...args && ({ address: args })
      }
    })
  }, {
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      if (retryCount >= 10) return
      revalidate({ retryCount })
    }
  })

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => setAddressFilter(addressFieldValue), 500)
    return () => clearTimeout(timeout)
  }, [addressFieldValue])

  if (isLoadingUser) return <></>;

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
      <GridItem area="controls" p={2}>
        <Heading fontSize={"2xl"}>Imóveis que estou acompanhando</Heading>
        {/* <Select width={48} mt={2}>
          <option value='isRent' selected>Aluguel</option>
          <option value='isSell'>Comprar</option>
          <option value='both'>Aluguel/Comprar</option>
        </Select> */}
        <Box mt={2}>
          <InputGroup w={"xs"}>
            <InputLeftElement
              pointerEvents='none'
            >
              <SearchIcon color='gray.300' />
            </InputLeftElement>
            <Input type='text' placeholder='Buscar' onChange={e => setAddressFieldValue(e.target.value)} />
          </InputGroup>
        </Box>
      </GridItem>
      <GridItem
        area="main"
        m={2}
      >
        <SimpleGrid
          columns={{
            base: 1,
            sm: 2,
            md: 4,
          }}
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
                <Image src={item.images[0].url} alt="Image" width="100%" />
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