
import { Badge, Box, Button, Center, Checkbox, Divider, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, FormControl, FormLabel, forwardRef, Grid, GridItem, Heading, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, RangeSlider, RangeSliderFilledTrack, RangeSliderThumb, RangeSliderTrack, Select, SimpleGrid, Stack, Tag, TagLabel, TagLeftIcon, TagRightIcon, Text, Tooltip, useDisclosure, useMediaQuery, useToast, Wrap, WrapItem } from "@chakra-ui/react";
import { AddIcon, DeleteIcon, InfoOutlineIcon, SearchIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import useUser from "../../lib/useUser";
import useProperties from "../../lib/useProperties";
import { FaCouch, FaHome, FaTrain } from "react-icons/fa";
import { GoogleAd } from "../../components/GoogleAd";
import useCostsFilters from "../../lib/useCostsFilters";
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import withPlanLimits from "../../lib/withPlanLimits";
import usePlanLimits from "../../lib/usePlanLimits";
import plans from "../../plans";
import HeaderV2 from "../../components/HeaderV2";

export const getServerSideProps = withPlanLimits(async (result) => {
  const planLimits = result.props.planLimits;
  return {
    props: {
      limits: planLimits,
    }
  };
})

export default function HomePage({
  limits: limitsDataFromServer,
}) {
  const router = useRouter();
  const toast = useToast();
  const [isMobileDevice] = useMediaQuery('(max-width: 420px)')
  useUser({
    redirectTo: '/login',
  })
  const { limitsData } = usePlanLimits({
    fallback: limitsDataFromServer,
  });
  const filtersRef = useRef(null);

  const [addressFieldValue, setAddressFieldValue] = useState("");
  const [filters, setFilters] = useState({
    address: "",
    isAvailable: [true],
  } as any);

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

  useEffect(() => {
    router.prefetch('/new')
  }, [router])

  const onChangeFilters = useCallback((newFilters: object) => {
    setFilters(s => ({
      address: s.address,
      ...newFilters
    }))
  }, [])

  const handleAddProperty = useCallback(() => {
    const limits = limitsData?.data.properties;
    if (limits.unlimited || limits.available > 0) return router.push('/new')
    toast({
      title: 'Limite de imóveis atingido',
      description: `Como seu plano é o ${plans[limitsData?.data.plan].title} você só pode criar ${limits.allowed} imóveis. Para criar mais, marque um como indisponível.`,
    })
  }, [limitsData?.data.plan, limitsData?.data.properties, router, toast]);

  const items = properties?.data.map(item => {
    const totalCost = item.totalCost.map(cost => {
      const value = item.costs?.filter(c => cost.calc?.includes(c.costId)).reduce((a, c) => a + c.value, 0);
      return {
        id: cost.costId,
        text: cost.text,
        value: value.toLocaleString('pt', {
          style: 'currency',
          currency: "BRL"
        }),
        showIn: cost.showInMainCard?.views || []
      }
    })
    const costs = item.costs.map(cost => {
      return {
        ...cost,
        value: cost.value.toLocaleString('pt', {
          style: 'currency',
          currency: "BRL"
        }),
      }
    })
    return {
      ...item,
      costs,
      totalCost,
    };
  });

  const isDesktop = !isMobileDevice;

  const handleCleanFilters = useCallback(() => {
    filtersRef.current.cleanFilters();
    setAddressFieldValue('');
  }, [])

  const itemsElements = useMemo(() => {
    return items?.map(item => {
      const costsElements = [];
      costsElements.push(...item.totalCost.filter(t => t.showIn.includes(filtersRef.current?.selectedVisualizationMode || 'isBoth')).map(totalCost => {
        return <Text key={totalCost.id} fontWeight="bold" color="green" fontSize={"xs"}>{totalCost.text} {totalCost.value}</Text>
      }))
      if (filtersRef.current?.exposedCostsFilter.length > 0) {
        const fields = Array.from(new Set(filtersRef.current.exposedCostsFilter.filter(f => f.field.includes('costs||')).map(x => x.field))).map((f: string) => {
          const [property, field] = f.split('||');
          const cost = item[property].find(x => x.text === field);
          return <Text key={item._id.concat(field)} color="green" fontSize={"xs"}>{field} {cost?.value}</Text>
        })
        costsElements.push(...fields);
      }
      return <Link
        w={"100%"}
        boxShadow='lg'
        borderRadius="sm"
        key={item._id}
        display="flex"
        flexDirection="column"
        cursor={"pointer"}
        href={`/property/${item._id}`}
        _hover={{
          textDecoration: undefined
        }}
      >
        {item.images && item.images[0] ? <Box width="100%" height="3xs" position="relative">
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
            {!item.isAvailable &&
              <Badge ml={1} textTransform={"none"} colorScheme="red">Indisponível</Badge>
            }
          </Flex>
        </Box> : <Center width="100%" height="3xs" flexDirection="column" gap={2}>
          <Icon as={FaHome} h={16} w={16} />
          <Text>Sem imagem</Text>
        </Center>}
        <Flex p={2}
          direction="column"
          flexGrow={1}
        >
          <Heading fontSize="md">{item.address}</Heading>
          <Flex mt={1} alignItems="center">
            <Flex>
              {item.information.totalArea &&
                <Badge textTransform={"none"}>{item.information.totalArea}m²</Badge>
              }
              {item.information.bedrooms &&
                <Badge ml={1} textTransform={"none"}>{item.information.bedrooms} {item.information.bedrooms > 1 ? "quartos" : "quarto"}</Badge>
              }
            </Flex>
            <Flex direction="column" flex={1} alignItems="end">
              {
                costsElements
              }
            </Flex>
          </Flex>
        </Flex>
      </Link>
    })
  }, [items])
  return <>
    <Grid
      gap={2}
      templateAreas={`
        "header"
        "body"
      `}
      templateRows="auto 1fr"
      templateColumns="1fr"
    >
      <HeaderV2 />
      <Box
        gridArea="body"
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
              }} disabled={items?.length === 0 && !filters.address} type='text' value={addressFieldValue} placeholder='Buscar endereço' onChange={e => setAddressFieldValue(e.target.value)} />
            </InputGroup>}
          </Box>
          <Flex gridArea="add" gap={2} w={{
            base: 'full',
            md: 'fit-content'
          }} ml="auto">
            <Button w={{
              base: 'full',
              md: '3xs'
            }} onClick={handleAddProperty} colorScheme={'purple'}>Adicionar</Button>
            {
              !limitsData?.data.properties.unlimited && <Tooltip label={
                limitsData?.data.properties.available > 0 ?
                  `Como seu plano é o ${plans[limitsData?.data.plan].title}, você pode criar mais ${limitsData?.data.properties.available} ${limitsData?.data.properties.available > 1 ? 'imóveis' : 'imóvel'}`
                  :
                  `Você não pode mais criar imóveis. Marque como indisponível algum imóvel para liberar a criação${limitsData?.data.plan === 'free_plan' ? '   ou atualize seu plano' : ''}.`
                }>
                <Flex
                  alignItems="center"
                  px={2}
                  py={1}
                  bgColor="gray.100"
                  borderRadius="md"
                  gap={1}
                  w="fit-content"
                  m="auto"
                >
                  <Text>{limitsData?.data.properties.totalCount - limitsData?.data.properties.unavailableCount}</Text>
                  <Text>{'/'}</Text>
                  <Text>{limitsData?.data.properties.allowed}</Text>
                </Flex>
              </Tooltip>
            }
          </Flex>
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
              }} disabled={items?.length === 0 && !filters.address} type='text' value={addressFieldValue} placeholder='Buscar endereço' onChange={e => setAddressFieldValue(e.target.value)} />
            </InputGroup>
            <Filters onChangeFilters={onChangeFilters} ref={filtersRef} />
          </Flex>
          }
          <Flex>
            <SimpleGrid
              gap={4}
              alignItems="flex-start"
              columns={{
                base: 1,
                sm: 2,
                md: 3
              }}
            >
              {
                items?.length === 0 && <Flex
                  direction="column"
                  gap={2}
                  boxShadow='base'
                  borderRadius="sm"
                  p={4}
                  h="fit-content"
                >
                  <Heading fontSize={"md"}>Parece que não temos nada por aqui...</Heading>
                  <Text>Adicione uma nova propriedade</Text>
                  <Button onClick={handleAddProperty}>Adicionar</Button>
                  {filtersRef.current?.isFiltersApplied && <>
                    <Text>Ou remova os filtros</Text>
                    <Button size="sm" onClick={handleCleanFilters}>Remover filtros</Button>
                  </>}
                </Flex>
              }
              {
                itemsElements
              }
            </SimpleGrid>
            <GoogleAd adSlot={"9985735186"} />
          </Flex>
        </Flex>
      </Box>
    </Grid>
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
            <Filters onChangeFilters={onChangeFilters} ref={filtersRef} />
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onCloseFilters}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    }
  </>
}

let operators = [{
  "operator": "eq",
  "selectOption": '= (igual a)',
  "text": "igual a"
},
{
  "operator": "gt",
  "selectOption": '> (maior que)',
  "text": "maior que"
},
{
  "operator": "gte",
  "selectOption": '>= (igual ou maior que)',
  "text": "igual ou maior que"
},
{
  "operator": "lt",
  "selectOption": '< (menor que)',
  "text": "menor que"
},
{
  "operator": "lte",
  "selectOption": '<= (igual ou menor que)',
  "text": "igual ou menor que"
}]


const Filters = forwardRef(({
  onChangeFilters,
}, ref) => {

  const fieldFormMethods = useForm<{
    isAvailable?: boolean[]
    minBedrooms?: number
    minBathrooms?: number
    minParkingSlots?: number
    isNearSubway?: boolean
    isFurnished?: boolean
    minValue?: number
    maxValue?: number
    view: string;
    keywords?: string
    costsFilter: Array<{
      field: string;
      operator: string;
      value: number;
    }>
  }>();

  const { control: controlFilters, register: registerFieldFilter, watch: watchFilter, reset: resetFilters, setValue } = fieldFormMethods;

  const watchFields = watchFilter();
  useEffect(() => {
    let timeout = setTimeout(() => {
      let view: object;
      if (watchFields.view === 'isRent') {
        view = {
          isSell: undefined,
          isRent: true,
          isBoth: undefined
        }
      } else if (watchFields.view === 'isSell') {
        view = {
          isSell: true,
          isRent: undefined,
          isBoth: undefined
        }
      } else {
        view = {
          isSell: undefined,
          isRent: undefined,
          isBoth: true
        }
      }
      const costsFilter = watchFields.costsFilter?.reduce((a, costFilter) => {
        const [property, field] = costFilter.field.split("||");
        return [
          ...a,
          {
            [property]: {
              $elemMatch: {
                text: field,
                value: {
                  [`$${costFilter.operator}`]: Number(costFilter.value)
                }
              }
            }
          }
        ]
      }, [])
      onChangeFilters({
        ...watchFields,
        ...view,
        costsFilter
      })
    }, 1000)
    return () => clearTimeout(timeout)
  }, [onChangeFilters, watchFields])

  const { fields: fieldsCostsFilter, append: appendCostsFilter, remove: removeCostsFilter } = useFieldArray({
    control: controlFilters,
    name: 'costsFilter'
  })


  const exposedCostsFilter = useMemo(() => fieldsCostsFilter, [fieldsCostsFilter])

  // Used by parent element
  const isFiltersApplied = useMemo(() =>
    watchFields.minBedrooms ||
    watchFields.minBathrooms ||
    watchFields.minParkingSlots ||
    watchFields.isNearSubway ||
    watchFields.isFurnished ||
    watchFields.keywords ||
    fieldsCostsFilter.length > 0
    , [fieldsCostsFilter.length, watchFields.isFurnished, watchFields.isNearSubway, watchFields.keywords, watchFields.minBathrooms, watchFields.minBedrooms, watchFields.minParkingSlots])

  const selectedVisualizationMode = useMemo(() => watchFields.view, [watchFields.view])

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
    return <Controller
      name={option.filterProp}
      key={option.name.concat('-filter')}
      render={({
        field: { value, onChange },
      }) => {
        return <Flex
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
            {["1+", "2+", "3+", "4+"].map(q => {
              const isSelected = (value || '').concat('+') === q;
              return <Button
                key={q.concat(`-${option.name}-filter`)}
                onClick={() => onChange(isSelected ? undefined : q.replace('+', ''))}
                size="xs"
                colorScheme='purple'
                variant={isSelected ? undefined : 'outline'}
              >
                {q}
              </Button>
            })}
          </Wrap>
        </Flex>
      }}
    />
  }), [])

  const toggleOptions = useMemo(() => [{
    name: 'isNearSubway',
    text: 'Metro próximo'
  }, {
    name: 'isFurnished',
    text: 'Mobiliado'
  }].map(option => {
    return <Controller
      name={option.name}
      key={option.name.concat('-filter')}
      render={({
        field: { value, onChange }
      }) => {
        return <Tag size={'md'} variant='subtle' colorScheme={value ? 'purple' : 'gray'} cursor={"pointer"} onClick={() => onChange(!value ? true : undefined)}>
          {!value && <TagLeftIcon boxSize='12px' as={AddIcon} />}
          <TagLabel>{option.text}</TagLabel>
          {value && <TagRightIcon boxSize='12px' as={DeleteIcon} />}
        </Tag>
      }}
    />
  }), []);

  const handleCleanFilters = useCallback(() => {
    resetFilters({
      minBedrooms: null,
      minBathrooms: null,
      minParkingSlots: null,
      isNearSubway: null,
      isFurnished: null,
      minValue: null,
      maxValue: null,
      view: 'isBoth',
      keywords: null,
      costsFilter: []
    })
    setValue('isAvailable', [true])
  }, [resetFilters, setValue])

  // Used by parent element
  useImperativeHandle(ref, () => ({
    exposedCostsFilter,
    selectedVisualizationMode,
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
      <Controller
        control={controlFilters}
        name="view"
        defaultValue="isBoth"
        render={({
          field: { value, onChange }
        }) => {

          return <Flex gap={1}>
            <Button flex={1} size="xs" colorScheme={value === 'isBoth' ? 'purple' : 'gray'} onClick={() => onChange('isBoth')}>Ambos</Button>
            <Button flex={1} size="xs" colorScheme={value === 'isRent' ? 'purple' : 'gray'} onClick={() => onChange('isRent')}>Aluguel</Button>
            <Button flex={1} size="xs" colorScheme={value === 'isSell' ? 'purple' : 'gray'} onClick={() => onChange('isSell')}>Compra</Button>
          </Flex>
        }}
      />
    </Flex>
    <FormProvider {...fieldFormMethods}>
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
        direction="column"
      >
        <Text fontSize="xs">Filtros de preço</Text>
        <Divider />
        <PriceAddFilterForm appendCostsFilter={appendCostsFilter} />
        <Divider />
        <Flex direction="column">
          {
            fieldsCostsFilter.map((filter, i) => {
              const [property, text] = filter.field.split('||');
              const operator = operators.find(o => o.operator === filter.operator)
              return <Flex
                alignItems="center"
                key={filter.id}
                justifyContent="space-evenly"
                gap={2}
                p={2}
                border="1px"
                borderColor={"gray.50"}
              >
                <Center
                  display="column"
                  textAlign="center"
                  p={2}
                  border="1px"
                  borderColor="gray.100"
                  borderRadius="md"
                >
                  <Text>
                    {text}
                    {' '}
                  </Text>
                  <Text fontSize="xs">
                    {property === "costs" ? 'Custo unitário' : 'Custo total'}
                    {' '}
                  </Text>
                </Center>
                <Text textAlign="center">
                  é
                  {' '}
                  {operator.text}
                  {' '}
                </Text>
                <Text
                  p={2}
                  border="1px"
                  borderColor="gray.100"
                  borderRadius="md"
                >{filter.value.toLocaleString('pt', {
                  style: 'currency',
                  currency: 'BRL'
                })}</Text>
                <IconButton icon={<DeleteIcon />} aria-label="Remover filtro" onClick={() => removeCostsFilter(i)}></IconButton>
              </Flex>
            })
          }
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
        <Input placeholder="Palavras-chaves (case insensitive)" {...registerFieldFilter('keywords', {
          setValueAs: v => !v || !v.trim() ? null : v,
        })} />
        <Flex alignItems="center" gap={2}>
          <Text ml="auto" fontSize="xs">Use vírgulas para separar as palavras</Text>
        </Flex>
      </Flex>
      <Button size="xs" onClick={handleCleanFilters} opacity={isFiltersApplied ? 1 : 0.5}>Limpar filtros</Button>
      <AvailabilityFilter control={controlFilters} />
    </FormProvider>
  </Flex>
})

const PriceAddFilterForm = ({
  appendCostsFilter
}) => {

  const { filtersCustomData } = useCostsFilters();

  const {
    register: registerPriceFilterAdd,
    handleSubmit: handleSubmitPriceFilterAdd,
    reset: resetPriceFilterAdd,
    formState: formStatePriceFilterAdd
  } = useForm<{
    field: string;
    operator: string;
    value: number;
  }>();

  const handlePriceFilterAdd = useCallback((values) => {
    appendCostsFilter(values)
    resetPriceFilterAdd()
  }, [appendCostsFilter, resetPriceFilterAdd]);


  return <form onSubmit={handleSubmitPriceFilterAdd(handlePriceFilterAdd)}>
    <Flex alignItems={"center"} gap={2}>
      <FormControl isInvalid={!!formStatePriceFilterAdd?.errors.field}>
        <Select defaultValue="#" size={"xs"} {...registerPriceFilterAdd('field', {
          required: true,
          setValueAs: (value) => value === '#' ? null : value
        })}>
          <option disabled value="#">Custo</option>
          <optgroup label="Custos Unitários">
            {filtersCustomData?.data.costFilters.filter(x => x.property === "costs").map(costFilter => {
              return <option key={`${costFilter.property}-${costFilter.text}`} value={`${costFilter.property}||${costFilter.text}`}>{costFilter.text}</option>
            })}
          </optgroup>
          <optgroup label="Custos Totais">
            {filtersCustomData?.data.costFilters.filter(x => x.property === "totalCost").map(costFilter => {
              return <option key={`${costFilter.property}-${costFilter.text}`} value={`${costFilter.property}||${costFilter.text}`}>{costFilter.text}</option>
            })}
          </optgroup>
        </Select>
      </FormControl>
      <FormControl isInvalid={!!formStatePriceFilterAdd?.errors.operator}>
        <Select defaultValue="#" size="xs" {...registerPriceFilterAdd('operator', {
          required: true,
          setValueAs: (value) => value === '#' ? null : value
        })}>
          <option disabled value="#">Filtro</option>
          {
            operators.map(operator => <option key={operator.operator} value={operator.operator}>{operator.selectOption}</option>)
          }
        </Select>
      </FormControl>
      <FormControl isInvalid={!!formStatePriceFilterAdd?.errors.value}>
        <Input type="number" size="xs" {...registerPriceFilterAdd('value', {
          required: true,
        })} />
      </FormControl>
      <IconButton size="xs" icon={<AddIcon />} aria-label="Adicionar filtro de valor" type="submit" />
    </Flex>
  </form>
}

const AvailabilityFilter = ({
  control,
}) => {
  useWatch();
  return <Controller
    name="isAvailable"
    control={control}
    defaultValue={[true]}
    render={({
      field: { value, onChange }
    }) => {
      const change = () => {
        if (value.includes(false)) {
          onChange([true])
        } else {
          onChange([true, false])
        }
      }
      return <Box
        p={2}
        borderRadius="md"
        boxShadow="md"
      >
        <Checkbox checked={value.includes(false)} defaultChecked={value.includes(false)} onChange={change}>Mostrar indisponíveis</Checkbox>
      </Box>
    }}
  />
}