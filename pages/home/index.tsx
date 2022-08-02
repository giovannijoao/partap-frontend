import { Badge, Box, Button, Checkbox, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Image, Input, InputGroup, InputLeftElement, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, SimpleGrid, Stack, Tag, TagLabel, TagLeftIcon, TagRightIcon, Text, useDisclosure, Wrap, WrapItem } from "@chakra-ui/react";
import { ApiInstance } from "../../services/api";
import { mutate } from "swr"
import { AddIcon, DeleteIcon, SearchIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const { isOpen: isOpenFilters, onOpen: onOpenFilters, onClose: onCloseFilters } = useDisclosure()

  const [addressFieldValue, setAddressFieldValue] = useState("");
  const [filters, setFilters] = useState({
    isAvailable: [true]
  } as {
    address?: string,
    isAvailable?: boolean[]
  })
  const [importUrl, setImportUrl] = useState("");
  const { isOpen: isAddOpen, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure()
  const { properties, mutateProperties } = useProperties({
    filters,
  });


  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => setFilters(s => ({
      ...s,
      address: addressFieldValue
    })), 500)
    return () => clearTimeout(timeout)
  }, [addressFieldValue])

  const handleImport = useCallback(async () => {
    mutatePropertyExtractor(importUrl);
    router.push(`/new?url=${importUrl}`)
  }, [mutatePropertyExtractor, importUrl, router])

  useEffect(() => {
    router.prefetch('/new')
  }, [router])

  const items = properties?.data.map(item => {
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
    <Flex
      direction="column"
      gap={2}
    >
      <Header />
      <Box
        p={4}
      >
        <Box mb={4}>
          <Heading fontSize={"2xl"}>Imóveis que estou acompanhando</Heading>
          <Grid
            mt={2}
            alignItems="center"
            gridTemplateAreas={{
              base: `
                "search add"
              `,
              md: `
                "search add"
              `
            }}
            gridTemplateColumns={{
              base: "2fr 1fr",
              md: "repeat(2, 1fr)"
            }}
            gap={2}
          >
            <Box gridArea="search">
              <InputGroup >
                <InputLeftElement
                  pointerEvents='none'
                >
                  <SearchIcon color='gray.300' />
                </InputLeftElement>
                <Input disabled={items?.length === 0 && !filters.address} type='text' placeholder='Buscar' onChange={e => setAddressFieldValue(e.target.value)} />
              </InputGroup>
            </Box>
            <Button ml="auto" onClick={onOpenAdd} gridArea="add">Adicionar</Button>
          </Grid>
        </Box>
        <Flex
          gap={4}
          direction={{
            base: 'column',
            md: 'row'
          }}
        >
          <Filters mutateProperties={mutateProperties} />
          <SimpleGrid
            flex={2}
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
                  boxShadow='lg'
                  borderRadius="sm"
                  key={item._id}
                  display="flex"
                  flexDirection="column"
                  cursor={"pointer"}
                  onClick={() => router.push(`/property/${item._id}`)}
                  onMouseEnter={() => mutateProperty(item._id)}
                >
                  {item.images && item.images[0] && <Image src={item.images[0].url} alt="Image" width="100%" height="100%" />}
                  <Flex p={2}
                    direction="column"
                    grow="1">
                    <Heading fontSize="md" flex="1" flexGrow="1">{item.address}</Heading>
                    <Wrap mt={1}>
                      {item.information.totalArea && <WrapItem>
                        <Badge textTransform={"none"}>{item.information.totalArea}m²</Badge>
                      </WrapItem>}
                      {item.information.bedrooms && <WrapItem>
                        <Badge ml={1} textTransform={"none"}>{item.information.bedrooms} {item.information.bedrooms > 1 ? "quartos" : "quarto"}</Badge>
                      </WrapItem>}
                      {!item.isAvailable && <WrapItem>
                        <Badge ml={1} textTransform={"none"} colorScheme="red">Indisponível</Badge>
                      </WrapItem>}
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
        </Flex>
      </Box>
    </Flex>
    <Modal isOpen={isAddOpen} onClose={onCloseAdd}>
      <ModalOverlay />
      <ModalContent mx={2}>
        <ModalHeader>Adicionar uma propriedade</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column">
          <FormControl>
            <FormLabel textAlign="center">Importe a partir de uma URL ou<br />crie manualmente o imóvel</FormLabel>
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

const Filters = ({
  mutateProperties
}) => {
  const [filters, setFilters] = useState({
    isAvailable: [true],
  } as {
    address?: string,
    isAvailable?: boolean[]
    minBedrooms?: number
    minBathrooms?: number
    minParkingSlots?: number
    isNearSubway?: boolean
    isFurnished?: boolean
  })

  const toggleAvailabilityFilter = useCallback(() => {
    setFilters(filters => {
      const newFilters = { ...filters }
      if (newFilters.isAvailable.includes(false)) {
        newFilters.isAvailable = [true]
      } else {
        newFilters.isAvailable = [true, false]
      }
      return newFilters;
    })
  }, [])

  useEffect(() => {
    mutateProperties(filters)
  }, [mutateProperties, filters])

  const mainOptions = useMemo(() => [{
    name: 'bedrooms',
    text: 'Quartos',
    icon: '/cil_bed.svg',
    filterProp: 'minBedrooms'
  }, {
    name: 'bathrooms',
    text: 'Banheiros',
    icon: '/cil_shower.svg',
    filterProp: 'minBathrooms'
  }, {
    name: 'parkingSlots',
    text: 'Vagas',
    icon: '/bxs_car-garage.svg',
    filterProp: 'minParkingSlots'
  }].map(option => {
    const onChange = (selectedOpt: string) => {
      const parsedOption = selectedOpt.replace('+', '');
      setFilters(state => {
        const { ...newState } = state;
        if (newState[option.filterProp] === parsedOption) {
          newState[option.filterProp] = undefined;
        } else {
          newState[option.filterProp] = parsedOption;
        }
        return newState;
      })
    }
    return <Flex
      key={option.name.concat('-filter')}
      borderRadius={"md"}
      boxShadow={"xs"}
      p={2}
      gap={2}
      wrap="wrap"
      flexDir={"row"}
    >
      <Flex alignItems="center" gap={2} flex={1}>
        <Image src={option.icon} alt="Field" />
        <Text>{option.text}</Text>
      </Flex>
      <Wrap>
        {["+1", "+2", "+3", "+4"].map(q => <Button
          key={q.concat(`-${option.name}-filter`)}
          onClick={() => onChange(q)}
          size="xs"
          colorScheme='purple'
          variant={'+'.concat(filters[option.filterProp]) !== q ? 'outline' : undefined}
        >
          {q}
        </Button>)}
      </Wrap>
    </Flex>
  }), [filters])

  const toggleOptions = useMemo(() => [{
    name: 'isNearSubway',
    text: 'Metro próximo'
  }, {
    name: 'isFurnished',
    text: 'Mobiliado'
  }].map(option => {
    const onClick = () => {
      setFilters((state) => {
        const { ...newFilters } = state;
        if (newFilters[option.name]) {
          newFilters[option.name] = undefined;
        } else {
          newFilters[option.name] = true;
        }
        console.log(300, newFilters)
        return newFilters;
      })
    }
    return <Tag key={option.name.concat('-filter')} size={'md'} variant='subtle' colorScheme={filters[option.name] ? 'purple' : 'gray'} cursor={"pointer"} onClick={onClick}>
      {!filters[option.name] && <TagLeftIcon boxSize='12px' as={AddIcon} />}
      <TagLabel>{option.text}</TagLabel>
      {filters[option.name] && <TagRightIcon boxSize='12px' as={DeleteIcon} />}
    </Tag>
  })
    , [filters]);

  return <Flex
    flex={1}
    w={{
      base: '100%',
      md: '30%'
    }}
    maxW={{
      base: undefined,
      md: "fit-content"
    }}
    direction={"column"}
    gap={2}
  >
    {mainOptions}
    <Wrap>
      {toggleOptions}
    </Wrap>
    <Box
      p={2}
      borderRadius="md"
      boxShadow="md"
    >
      <Checkbox defaultChecked={filters.isAvailable.includes(false)} onChange={toggleAvailabilityFilter}>Mostrar indisponíveis</Checkbox>
    </Box>
  </Flex>
}