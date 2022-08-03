import { Badge, Box, Button, Checkbox, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, FormControl, FormLabel, forwardRef, Grid, GridItem, Heading, IconButton, Image, Input, InputGroup, InputLeftElement, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, RangeSlider, RangeSliderFilledTrack, RangeSliderThumb, RangeSliderTrack, Select, SimpleGrid, Stack, Tag, TagLabel, TagLeftIcon, TagRightIcon, Text, useDisclosure, useMediaQuery, Wrap, WrapItem } from "@chakra-ui/react";
import { ApiInstance } from "../../services/api";
import { mutate } from "swr"
import { AddIcon, DeleteIcon, InfoOutlineIcon, SearchIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import useUser from "../../lib/useUser";
import useProperties from "../../lib/useProperties";
import useProperty from "../../lib/useProperty";
import usePropertyExtractor from "../../lib/usePropertyExtractor";
import { FaCouch, FaTrain } from "react-icons/fa";
const formatNumber = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 })

export default function HomePage() {
  const router = useRouter();
  const [isMobileDevice] = useMediaQuery('(max-width: 420px)')
  useUser({
    redirectTo: '/login',
  })
  const { mutateProperty } = useProperty();
  const { mutatePropertyExtractor } = usePropertyExtractor()
  const filtersRef = useRef(null);

  const [addressFieldValue, setAddressFieldValue] = useState("");
  const [filters, setFilters] = useState({
    address: ""
  } as any);

  const [importUrl, setImportUrl] = useState("");
  const { isOpen: isAddOpen, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure()
  const { isOpen: isOpenFilters, onOpen: onOpenFilters, onClose: onCloseFilters } = useDisclosure()
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

  const onChangeFilters = useCallback((newFilters: object) => {
    setFilters(s => ({
      address: s.address,
      ...newFilters
    }))
  }, [])

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

  const isDesktop = !isMobileDevice;

  return <>
    <Flex
      direction="column"
      gap={2}
    >
      <Header />
      <Box
        p={4}
      >
        <Grid
          mb={{
            base: 2,
            md: 0
          }}
          alignItems="center"
          gridTemplateAreas={{
            base: `
                "title title"
                "search search"
                "add filters"
              `,
            md: `
                "title add"
              `
          }}
          gridTemplateColumns={{
            base: "2fr 1fr",
            md: "repeat(2, 1fr)"
          }}
          gap={2}
        >
          <Heading fontSize={"2xl"} gridArea="title">Imóveis que estou acompanhando</Heading>
          <Box gridArea="search">
            {isMobileDevice && <InputGroup >
              <InputLeftElement
                pointerEvents='none'
              >
                <SearchIcon color='gray.300' />
              </InputLeftElement>
              <Input w={{
                base: 'full',
                md: "xs"
              }} disabled={items?.length === 0 && !filters.address} type='text' placeholder='Buscar' onChange={e => setAddressFieldValue(e.target.value)} />
            </InputGroup>}
          </Box>
          <Button ml={{ base: undefined, md: 'auto' }} onClick={onOpenAdd} gridArea="add">Adicionar</Button>
          {isMobileDevice && <Button onClick={onOpenFilters} gridArea="filters">Filtros</Button>}
        </Grid>
        <Flex
          gap={4}
          direction={{
            base: 'column',
            md: 'row'
          }}
        >
          {isDesktop && <Flex
            direction="column"
            position="sticky"
            top={4}
            alignSelf="flex-start"
            w={{
              base: '100%',
              md: '30%'
            }}
            maxW={{
              base: undefined,
              md: "fit-content"
            }}
          >
            <InputGroup mb={2}>
              <InputLeftElement
                pointerEvents='none'
              >
                <SearchIcon color='gray.300' />
              </InputLeftElement>
              <Input w={{
                base: 'full',
                md: "xs"
              }} disabled={items?.length === 0 && !filters.address} type='text' placeholder='Buscar' onChange={e => setAddressFieldValue(e.target.value)} />
            </InputGroup>
            <Filters mutateProperties={mutateProperties} onChangeFilters={onChangeFilters} ref={filtersRef} />
          </Flex>
          }
          <SimpleGrid
            flex={2}
            columns={{
              base: 1,
              sm: 2,
              md: 3,
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
                {filtersRef.current?.isFiltersApplied && <>
                  <Text>Ou remova os filtros</Text>
                  <Button size="sm" onClick={filtersRef.current.cleanFilters}>Remover filtros</Button>
                </>}
              </Flex>
            }
            {
              items?.map(item => {
                return <Box
                  w={"100%"}
                  h="xs"
                  boxShadow='lg'
                  borderRadius="sm"
                  key={item._id}
                  display="flex"
                  flexDirection="column"
                  cursor={"pointer"}
                  onClick={() => router.push(`/property/${item._id}`)}
                  onMouseEnter={() => mutateProperty(item._id)}
                >
                  {item.images && item.images[0] && <Box width="100%" height="3xs" position="relative">
                    <Image src={item.images[0].url} alt="Image" width="100%" height="100%" />
                    <Flex position="absolute" bottom={1} left={1} gap={1}>
                      {item.information.nearSubway && <Tag size={"md"} variant='subtle' colorScheme='cyan' >
                        <TagLeftIcon boxSize='12px' as={FaTrain} />
                        <TagLabel>Metro próx.</TagLabel>
                      </Tag>}
                      {item.information.isFurnished && <Tag size={"md"} variant='subtle' colorScheme='orange' >
                        <TagLeftIcon boxSize='12px' as={FaCouch} />
                        <TagLabel>Mobiliado</TagLabel>
                      </Tag>}
                    </Flex>
                  </Box>}
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
                      {item.isRent && item.costs.totalCost?.isPresent && <WrapItem flexGrow="1" >
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
    {
      isMobileDevice && <Drawer
        isOpen={isOpenFilters}
        placement='right'
        onClose={onCloseFilters}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filtros</DrawerHeader>

          <DrawerBody>
            <Filters mutateProperties={mutateProperties} onChangeFilters={onChangeFilters} ref={filtersRef} />
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onCloseFilters}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    }
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

const Filters = forwardRef(({
  mutateProperties,
  onChangeFilters,
}, ref) => {
  const [filters, setFilters] = useState({
    isAvailable: [true],
  } as {
    isAvailable?: boolean[]
    minBedrooms?: number
    minBathrooms?: number
    minParkingSlots?: number
    isNearSubway?: boolean
    isFurnished?: boolean
    minValue?: number
    maxValue?: number
    isSell?: boolean
    isRent?: boolean
    isBoth?: boolean
    keywords?: string
  })
  const [modoVisualizacao, setModoVisualizacao] = useState<'isRent' | 'isSell' | 'isBoth'>('isBoth')

  const [minValue, setMinValue] = useState<number | undefined>();
  const [maxValue, setMaxValue] = useState<number | undefined>();
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    mutateProperties(filters)
    onChangeFilters(filters)
  }, [mutateProperties, onChangeFilters, filters])

  useEffect(() => {
    let timeout = setTimeout(() => {
      setFilters(s => ({ ...s, minValue, maxValue, keywords: keywords.trim() !== '' ? keywords : undefined }))
    }, 1000)
    return () => clearTimeout(timeout)
  }, [minValue, maxValue, keywords])

  useEffect(() => {
    if (modoVisualizacao === 'isRent') {
      setFilters((s) => ({
        ...s,
        isSell: undefined,
        isRent: true,
        isBoth: undefined
      }))
    } else if (modoVisualizacao === 'isSell') {
      setFilters((s) => ({
        ...s,
        isSell: true,
        isRent: undefined,
        isBoth: undefined
      }))
    } else {
      setFilters((s) => ({
        ...s,
        isSell: undefined,
        isRent: undefined,
        isBoth: true
      }))
    }
  }, [modoVisualizacao])

  // Used by parent element
  const isFiltersApplied = useMemo(() =>
    filters.minBedrooms ||
    filters.minBathrooms ||
    filters.minParkingSlots ||
    filters.isNearSubway ||
    filters.isFurnished
    , [filters.isFurnished, filters.isNearSubway, filters.minBathrooms, filters.minBedrooms, filters.minParkingSlots])

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
        return newFilters;
      })
    }
    return <Tag key={option.name.concat('-filter')} size={'md'} variant='subtle' colorScheme={filters[option.name] ? 'purple' : 'gray'} cursor={"pointer"} onClick={onClick}>
      {!filters[option.name] && <TagLeftIcon boxSize='12px' as={AddIcon} />}
      <TagLabel>{option.text}</TagLabel>
      {filters[option.name] && <TagRightIcon boxSize='12px' as={DeleteIcon} />}
    </Tag>
  }), [filters]);

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

  const handleCleanFilters = useCallback(() => {
    setFilters(f => ({
      isAvailable: f.isAvailable,
      isSell: f.isSell,
      isRent: f.isRent,
      isBoth: f.isBoth,
    }))
    setMinValue(0)
    setMaxValue(0)
  }, [])

  // Used by parent element
  useImperativeHandle(ref, () => ({
    isFiltersApplied,
    cleanFilters() {
      handleCleanFilters()
    },
  }));

  return <Flex
    flex={1}
    direction={"column"}
    gap={2}
  >
    <Flex
      p={2}
      borderRadius="md"
      boxShadow={"xs"}
      direction="column"
    >
      <Text fontSize={"xs"}>Modo de Visualização</Text>
      <Flex gap={1}>
        <Button flex={1} size="xs" colorScheme={modoVisualizacao === 'isBoth' ? 'purple' : 'gray'} onClick={() => setModoVisualizacao('isBoth')}>Ambos</Button>
        <Button flex={1} size="xs" colorScheme={modoVisualizacao === 'isRent' ? 'purple' : 'gray'} onClick={() => setModoVisualizacao('isRent')}>Aluguel</Button>
        <Button flex={1} size="xs" colorScheme={modoVisualizacao === 'isSell' ? 'purple' : 'gray'} onClick={() => setModoVisualizacao('isSell')}>Compra</Button>
      </Flex>
    </Flex>
    {mainOptions}
    <Wrap>
      {toggleOptions}
    </Wrap>
    <Flex
      maxW="xs"
      gap={2}
      boxShadow='xs'
      p={2}
      borderRadius="md"
    >
      <Flex direction="column">
        <Text fontSize="xs">Preço Minimo</Text>
        <Input type="number" placeholder='0.00' value={minValue} defaultValue={minValue} onChange={(e) => setMinValue(Number(e.target.value))} min={0} />
      </Flex>
      <Flex direction="column">
        <Text fontSize="xs">Preço Maximo</Text>
        <Input type="number" placeholder='0.00' value={maxValue} defaultValue={maxValue} onChange={(e) => setMaxValue(Number(e.target.value))} min={0} />
      </Flex>
    </Flex>
    <Flex
      maxW="xs"
      gap={2}
      boxShadow='xs'
      p={2}
      borderRadius="md"
      direction="column"
    >
      <Input placeholder="Palavras-chaves (case insensitive)" value={keywords} onChange={e => setKeywords(e.target.value)} />
      <Flex alignItems="center" gap={2}>
        <Text ml="auto" fontSize="xs">Use vírgulas para separar as palavras</Text>
      </Flex>
    </Flex>
    <Button size="xs" onClick={handleCleanFilters} opacity={isFiltersApplied ? 1 : 0.5}>Limpar filtros</Button>
    <Box
      p={2}
      borderRadius="md"
      boxShadow="md"
    >
      <Checkbox checked={filters.isAvailable.includes(false)} defaultChecked={filters.isAvailable.includes(false)} onChange={toggleAvailabilityFilter}>Mostrar indisponíveis</Checkbox>
    </Box>
  </Flex>
})