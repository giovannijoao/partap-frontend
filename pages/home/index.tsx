import { Badge, Box, Button, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Image, Input, InputGroup, InputLeftElement, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, SimpleGrid, Stack, Text, useDisclosure, Wrap, WrapItem } from "@chakra-ui/react";
import { ApiInstance } from "../../services/api";
import { mutate } from "swr"
import { SearchIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import useUser from "../../lib/useUser";
import useProperties from "../../lib/useProperties";
import useProperty from "../../lib/useProperty";
import usePropertyExtractor from "../../lib/usePropertyExtractor";


const formatNumber = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 })

export default function HomePage() {
  const router = useRouter();
  useUser({
    redirectTo: '/login',
  })
  const { mutateProperty } = useProperty();
  const { mutatePropertyExtractor } = usePropertyExtractor()

  const [addressFieldValue, setAddressFieldValue] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const { isOpen: isAddOpen, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure()

  const { properties } = useProperties({
    addressFilter,
  });

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => setAddressFilter(addressFieldValue), 500)
    return () => clearTimeout(timeout)
  }, [addressFieldValue])

  const handleImport = useCallback(async () => {
    mutatePropertyExtractor(importUrl);
    router.push(`/new?url=${importUrl}`)
  }, [mutatePropertyExtractor, importUrl, router])

  useEffect(() => {
    router.prefetch('/new')
  }, [router])

  const items = properties?.data.data.map(item => {
    const costs = Object.fromEntries(Object.entries(item.costs).map(([key, value]) => [key, {
      isPresent: value && value != 0,
      formatted: formatNumber.format(value)
    }]))
    return {
      ...item,
      costs
    };
  });

  return <>
    <Grid
      width={"full"}
      templateAreas={`"header"
                  "main"
                  "footer"`}
      gridTemplateRows={'auto min-content 1fr 30px'}
      gridTemplateColumns={'1fr'}
      gap='1'
    >
      <Header />
      <GridItem
        area="main"
        m={4}
      >
        <Box mb={4}>
          <Heading fontSize={"2xl"}>Imóveis que estou acompanhando</Heading>
          <Box mt={2}>
            <Flex gap={2}>
              <Box>
                <InputGroup w={"xs"}>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <SearchIcon color='gray.300' />
                  </InputLeftElement>
                  <Input disabled={items?.length === 0} type='text' placeholder='Buscar' onChange={e => setAddressFieldValue(e.target.value)} />
                </InputGroup>
              </Box>
              <Button ml="auto" onClick={onOpenAdd}>Adicionar</Button>
            </Flex>
          </Box>
        </Box>
        <SimpleGrid
          columns={{
            base: 1,
            sm: 2,
            md: 4,
          }}
          gap={4}
          >
          {
            items?.length === 0 && <Flex
              direction="column"
              gap={2}
              boxShadow='base'
              borderRadius="sm"
              p={4}
            >
              <Heading fontSize={"md"}>Parece que não temos nada por aqui...</Heading>
              <Text>Adicione uma nova propriedade</Text>
              <Button onClick={onOpenAdd}>Adicionar</Button>
            </Flex>
          }
          {
            items?.map(item => {
              return <Box
                w={"100%"}
                boxShadow='base'
                borderRadius="sm"
                key={item._id}
                display="flex"
                flexDirection="column"
                cursor={"pointer"}
                onClick={() => router.push(`/property/${item._id}`)}
                onMouseEnter={() => mutateProperty(item._id)}
              >
                {item.images && item.images[0]  && <Image src={item.images[0].url} alt="Image" width="100%" />}
                <Flex p={2}
                  direction="column"
                  grow="1">
                  <Heading fontSize="md" flex="1" flexGrow="1">{item.address}</Heading>
                  <Wrap mt={1}>
                    { item.information.totalArea  && <WrapItem>
                      <Badge textTransform={"none"}>{item.information.totalArea}m²</Badge>
                    </WrapItem>}
                    { item.information.bedrooms && <WrapItem>
                      <Badge ml={1} textTransform={"none"}>{item.information.bedrooms} {item.information.bedrooms > 1 ? "quartos" : "quarto"}</Badge>
                    </WrapItem> }
                    {item.costs.totalCost?.isPresent && <WrapItem flexGrow="1" >
                      <Text width={"100%"} textAlign={"right"} fontWeight="bold" color="green" fontSize={"xs"}>Total {item.costs.totalCost.formatted}</Text>
                    </WrapItem>}
                    {item.isSell && !item.isRent && item.costs.sellPrice?.isPresent && <WrapItem flexGrow="1" >
                      <Text width={"100%"} textAlign={"right"} fontWeight="bold" color="green" fontSize={"xs"}>Compra {item.costs.sellPrice?.formatted}</Text>
                    </WrapItem>}
                  </Wrap>
                </Flex>

              </Box>
            })
          }
        </SimpleGrid>
      </GridItem>
    </Grid>
    <Modal isOpen={isAddOpen} onClose={onCloseAdd}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adicionar uma propriedade</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column">
          <FormControl>
            <FormLabel textAlign="center">Importe a partir de uma URL ou<br/>crie manualmente o imóvel</FormLabel>
            <Input placeholder='Importar de site' onChange={e => setImportUrl(e.target.value)} />
          </FormControl>
          <Button colorScheme='blue' mr="auto" mx="auto" mt={2} onClick={handleImport}>
            Importar
          </Button>
          <Link href="/new" textAlign={"center"}>Criar manualmente</Link>
        </ModalBody>
      </ModalContent>
    </Modal>
  </>
}