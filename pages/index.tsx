import { AddIcon, DeleteIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Checkbox, Fade, Flex, FormControl, Heading, Highlight, Icon, IconButton, Image, Input, InputGroup, InputLeftAddon, InputLeftElement, Link, SimpleGrid, Table, TableContainer, Tag, TagLabel, TagLeftIcon, TagRightIcon, Tbody, Td, Text, Th, Thead, Tr, Wrap } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { FaBed, FaCar, FaCaretRight, FaCouch, FaFilter, FaHome, FaPhotoVideo, FaRobot, FaSearchDollar, FaSearchLocation, FaShower, FaTrain, FaUsers } from "react-icons/fa";
import { ImportProviders } from "../importProviders";
import { ApiInstance } from "../services/api";
import { IPropertySaved } from "./interfaces/IProperty";

interface CustomProperty extends Omit<IPropertySaved, 'share' | 'user' | 'messages'> {
  color: string
}

const itemsElements = (() => {
  const items: CustomProperty[] = [{
    color: 'red.300',
    address: 'Travessa Ilhas Canárias, 146, Parque Paulistano',
    images: [],
    information: {
      bathrooms: 1,
      bedrooms: 2,
      description: '',
      floor: 0,
      parkingSlots: 1,
      totalArea: 80,
      acceptPets: false,
      nearSubway: true,
      isFurnished: true,
    },
    contactInfo: {},
    costs: [
      {
        "costId": "rentValue",
        "text": "Aluguel",
        "value": 1500
      },
      {
        "costId": "iptuValue",
        "text": "IPTU",
        "value": 100,
      },
      {
        "costId": "homeownersInsuranceValue",
        "text": "Seguro incêndio",
        "value": 50,
      },
      {
        "costId": "tenantServiceFee",
        "text": "Taxa de serviço",
        "value": 50,
      }
    ],
    isAvailable: true,
    isRent: true,
    isSell: false,
    provider: 'fake',
    totalCost: [
      {
        "costId": "totalRent",
        "text": "Aluguel",
        "calc": ["rentValue", "condominiumValue", "iptuValue", "homeownersInsuranceValue", "tenantServiceFee"],
        "showInMainCard": {
          "views": ["isRent", "isBoth"]
        },
      }
    ],
    board: {
      id: null,
      index: 0
    }
  }, {
    color: 'green.300',
    address: 'Rua Andorinhas, 160, Vila Seabra',
    images: [],
    information: {
      bathrooms: 1,
      bedrooms: 3,
      description: '',
      floor: 0,
      parkingSlots: 1,
      totalArea: 90,
      acceptPets: false,
      nearSubway: true,
      isFurnished: false,
    },
    contactInfo: {},
    costs: [{
      "costId": "rentValue",
      "text": "Aluguel",
      "value": 2000,
    },
    {
      "costId": "iptuValue",
      "text": "IPTU",
      "value": 100,
    },
    {
      "costId": "homeownersInsuranceValue",
      "text": "Seguro incêndio",
      "value": 26,
    },
    {
      "costId": "tenantServiceFee",
      "text": "Taxa de serviço",
      "value": 44,
    },
    {
      "costId": "494669153367",
      "text": "Reforma",
      "value": 5000,
    },
    {
      "costId": "221214278880",
      "text": "Instalação de cameras",
      "value": 500,
    }],
    isAvailable: true,
    isRent: true,
    isSell: false,
    provider: 'fake',
    totalCost: [
      {
        "costId": "totalRent",
        "text": "Aluguel",
        "calc": ["rentValue", "condominiumValue", "iptuValue", "homeownersInsuranceValue", "tenantServiceFee"],
        "showInMainCard": {
          "views": ["isBoth", "isRent"]
        },
      },
      {
        "costId": "13556176146",
        "text": "Mudança",
        "calc": ["494669153367", "221214278880"],
        "showInMainCard": {
          "views": ["isBoth", "isSell", "isRent"]
        },
      }
    ],
    board: {
      id: null,
      index: 0
    }
  }, {
    color: 'blue.300',
    address: 'Rua Dario da Silva, 629, Vila São Paulo',
    images: [],
    information: {
      bathrooms: 1,
      bedrooms: 4,
      description: '',
      floor: 0,
      parkingSlots: 1,
      totalArea: 100,
      acceptPets: true,
      nearSubway: false,
      isFurnished: true,
    },
    contactInfo: {},
    costs: [
      {
        "costId": "condominiumValue",
        "text": "Condomínio",
        "value": 625,
      },
      {
        "costId": "296256663380",
        "text": "Compra",
        "value": 240000,
      }
    ],
    isAvailable: true,
    isRent: true,
    isSell: false,
    provider: 'fake',
    totalCost: [
      {
        "costId": "105178486562",
        "text": "Compra",
        "calc": ["296256663380"],
        "showInMainCard": {
          "views": ["isSell", "isBoth"]
        },
      }
    ],
    board: {
      id: null,
      index: 0
    }
  }];
  const parsedItems = items.map(item => {
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
  return parsedItems.map(item => {
    const costsElements = item.totalCost.map(totalCost => {
      return <Text key={totalCost.id} fontWeight="bold" color="green" fontSize={"xs"}>{totalCost.text} {totalCost.value}</Text>
    })
    return <Box
      w={"100%"}
      boxShadow='lg'
      borderRadius="sm"
      key={item._id}
      display="flex"
      flexDirection="column"
    >
      <Box width="100%" height="3xs" position="relative">
        <Box bgColor={item.color} width="100%" height="100%" />
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
      </Box>
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
    </Box>
  })
})()

export default function Index() {
  return <Flex direction="column">
    <Flex
      direction="column"
      height="calc(100vh - 2rem)"
      bgGradient='linear-gradient(to-r, pink.400, pink.600)'
      justifyContent="center"
      p={8}
      gap={6}
    >
      <Flex direction='column' color="white">
        <Image h={20} w={"fit-content"} src="/logo.webp" alt="Logo" />
        <Text fontSize="2xl">Seu novo jeito de organizar a busca por imóveis!</Text>
      </Flex>
      <Flex direction="column" w="sm">
        <Link href="/login"><Button w="full">Entrar</Button></Link>
      </Flex>
    </Flex>
    <Flex
      direction="column"
      bgColor="pink.50"
      p={8}
      gap={6}
    >
      <Flex>
        <Icon as={FaCaretRight} h={12} w={12} color="purple" />
        <Heading>Sobre a ferramenta</Heading>
      </Flex>

      <Text lineHeight={2} color="gray.700" fontSize="lg">
        <Highlight query={['A dificuldade começa logo na busca.']} styles={{ px: '2', py: '1', rounded: 'full', bg: 'orange.100' }}>
          Sabemos que mudança é sempre uma questão complicada. A dificuldade começa logo na busca.
        </Highlight>
      </Text>
      <Text lineHeight={2} color="gray.700" fontSize="lg">Então, decidimos criar uma ferramenta para te ajudar nesse processo.</Text>
      <Text lineHeight={2} color="gray.700" fontSize="lg">
        <Highlight query={['salvar', "centralizar em um só lugar"]} styles={{ px: '2', py: '1', rounded: 'full', bg: 'orange.100' }}>
          Aqui você pode salvar os imóveis que encontrou e centralizar em um só lugar.
        </Highlight>
      </Text>

      <Text lineHeight={2} color="gray.700" fontSize="lg">Tenha a visualização de imóveis em cards com as principais informações em destaque.</Text>
      <Flex
        p={4}
        border="1px"
        borderColor="gray.100"
        justifyContent={"space-evenly"}
      >
        <SimpleGrid
          gap={4}
          alignItems="flex-start"
          columns={{
            base: 1,
            sm: 2,
            md: 3
          }}
        >
          {itemsElements}
        </SimpleGrid>
      </Flex>
    </Flex>
    <Flex
      direction="column"
      bgColor="pink.50"
      p={8}
      gap={6}
    >
      <Flex>
        <Icon as={FaCaretRight} h={12} w={12} color="purple" />
        <Heading>Recursos</Heading>
      </Flex>
      <Flex gap={4}
        direction={{
          base: 'column',
          md: 'row'
        }}
      >
        <Flex
          direction="column"
          gap={2}
          p={4}
          bgColor="whiteAlpha.800"
          boxShadow={"md"}
          w="xs"
        >
          <Flex alignItems="center" gap={2}>
            <IconBox icon={FaFilter} />
            <Heading fontSize="2xl" color="gray.800">Filtros</Heading>
          </Flex>
          <Text color="gray.600">
            Utilize filtros para encontrar o apartamento perfeito dentre vários que você salvou anteriormente.
          </Text>
          <Text color="gray.600">Alguns exemplos:</Text>
          <Filters />
          <Text color="gray.600" fontSize="xs">Há também filtros de endereço, preços e palavras-chaves.</Text>
        </Flex>
        <Flex
          direction="column"
          gap={2}
          p={4}
          bgColor="whiteAlpha.800"
          boxShadow={"md"}
          w="xs"
        >
          <Flex alignItems="center" gap={2}>
            <IconBox icon={FaRobot} />
            <Heading fontSize="2xl" color="gray.800">Import automático</Heading>
          </Flex>
          <Text color="gray.600">
            <Highlight query={['QuintoAndar', 'Zap Imóveis', 'Viva Real']} styles={{
              fontWeight: 'semibold',
              color: 'gray.600'
            }}>
              Você pode importar automaticamente imóveis dos sites QuintoAndar, Zap Imóveis e Viva Real.
            </Highlight>
          </Text>
          <Text color="gray.600">
            <Highlight query={["copiar", "colar a URL", "prosseguir"]} styles={{
              px: 2,
              rounded: 'full',
              bg: 'orange.100'
            }}>
              É só copiar e colar a URL do imóvel no nosso site, prosseguir e pronto! Ele importa as principais informações do imóvel, como cômodos, descrição e preços.
            </Highlight>
          </Text>
          <Text color="gray.600">
            Essa é uma funcionalidade <Badge colorScheme="green">BETA</Badge> e ainda está sendo desenvolvida.
          </Text>
        </Flex>
        <Flex direction="column" gap={4}>
          <Flex
            direction="column"
            gap={2}
            p={4}
            bgColor="whiteAlpha.800"
            boxShadow={"md"}
            w="xs"
            flex={1}
          >
            <Flex alignItems="center" gap={2}>
              <IconBox icon={FaUsers} />
              <Heading fontSize="2xl" color="gray.800">Chat integrado</Heading>
            </Flex>
            <Text color="gray.600">
              Compartilhe o imóvel com outras pessoas e tenha um chat integrado a página do imóvel.
            </Text>
          </Flex>
          <Flex
            direction="column"
            gap={2}
            p={4}
            bgColor="whiteAlpha.800"
            boxShadow={"md"}
            w="xs"
            flex={1}
          >
            <Flex alignItems="center" gap={2}>
              <IconBox icon={FaSearchLocation} />
              <Heading fontSize="2xl" color="gray.800">Por perto</Heading>
            </Flex>
            <Text color="gray.600">
              Veja escolas, hospitais e drogarias por perto da localização do imóvel.
            </Text>
          </Flex>
        </Flex>
        <Flex direction="column" gap={4}>
          <Flex
            direction="column"
            gap={2}
            p={4}
            bgColor="whiteAlpha.800"
            boxShadow={"md"}
            w="xs"
            flex={1}
          >
            <Flex alignItems="center" gap={2}>
              <IconBox icon={FaSearchDollar} />
              <Heading fontSize="2xl" color="gray.800">Custos personalizados</Heading>
            </Flex>
            <Text color="gray.600">
              Organize qualquer tipo de custo que você terá com o imóvel, como despesas com reforma, mudança e outros.
            </Text>
          </Flex>
          <Flex
            direction="column"
            gap={2}
            p={4}
            bgColor="whiteAlpha.800"
            boxShadow={"md"}
            w="xs"
            flex={1}
          >
            <Flex alignItems="center" gap={2}>
              <IconBox icon={FaPhotoVideo} />
              <Heading fontSize="2xl" color="gray.800">Upload de fotos</Heading>
            </Flex>
            <Text color="gray.600">
              Armazenamento de fotos no imóvel.
            </Text>
            <Text color="gray.600">
              Upload de vídeos será disponibilizado no futuro.
            </Text>
          </Flex>

        </Flex>
      </Flex>
    </Flex>
    <Flex
      direction="column"
      bgColor="pink.50"
      p={8}
      gap={6}
    >
      <Flex>
        <Icon as={FaCaretRight} h={12} w={12} color="purple" />
        <Heading>Teste alguns recursos</Heading>
      </Flex>
      <TestResources />
    </Flex>
  </Flex>
}


const supportedImportProviders = ImportProviders;



const IconBox = ({
  icon
}) => {
  return <Box
    h={14}
    w={14}
    rounded={"full"}
    bgColor="gray.200"
  >
    <Icon as={icon} h="full" w="full" p={4} color="gray.800" />
  </Box>
}

const Filters = () => {
  return <Flex direction="column" gap={2}>
    {[{
      name: 'bedrooms',
      text: 'Quartos',
      icon: FaBed,
      filterProp: 'minBedrooms'
    }, {
      name: 'bathrooms',
      text: 'Banheiros',
      icon: FaShower,
      filterProp: 'minBathrooms'
    }, {
      name: 'parkingSlots',
      text: 'Vagas',
      icon: FaCar,
      filterProp: 'minParkingSlots'
    }].map((option, i) => {
      return <Flex
        key={option.name}
        borderRadius={"md"}
        boxShadow={"xs"}
        p={2}
        gap={2}
        wrap="wrap"
        flexDir={"row"}
      >
        <Flex alignItems="center" gap={2} flex={1}>
          <Icon as={option.icon} />
          <Text>{option.text}</Text>
        </Flex>
        <Wrap>
          {["1+", "2+", "3+", "4+"].map((q, ii) => {
            return <Button
              key={q.concat(`-${option.name}-filter`)}
              size="xs"
              colorScheme='purple'
              variant={i === ii ? undefined : 'outline'}
            >
              {q}
            </Button>
          })}
        </Wrap>
      </Flex>
    })}
    <Wrap>
      {
        [{
          name: 'isNearSubway',
          text: 'Metro próximo'
        }, {
          name: 'isFurnished',
          text: 'Mobiliado'
        }].map((option, i) => {
          const value = i === 0;
          return <Tag key={option.name} size={'md'} variant='subtle' colorScheme={value ? 'purple' : 'gray'} cursor={"pointer"}>
            {!value && <TagLeftIcon boxSize='12px' as={AddIcon} />}
            <TagLabel>{option.text}</TagLabel>
            {value && <TagRightIcon boxSize='12px' as={DeleteIcon} />}
          </Tag>
        })
      }
    </Wrap>
  </Flex>
}

type ICostsForm = {
  costs: Array<{
    costId: string;
    text: string
    value: number;
  }>
  totalCost: Array<{
    costId: string
    text: string
    calc: string[]
    showInMainCard: {
      views: string[]
    }
    value?: number
  }>
}

const TestResources = () => {
  const formMethods = useForm<CustomProperty>({
    defaultValues: {
      costs: [{
        "costId": "rentValue",
        "text": "Aluguel",
        "value": 2000,
      },
      {
        "costId": "iptuValue",
        "text": "IPTU",
        "value": 100,
      },
      {
        "costId": "homeownersInsuranceValue",
        "text": "Seguro incêndio",
        "value": 26,
      },
      {
        "costId": "494669153367",
        "text": "Reforma",
        "value": 5000,
      },
      {
        "costId": "221214278880",
        "text": "Instalação de cameras",
        "value": 500,
      },
      ],
      totalCost: [{
        "costId": "totalRent",
        "text": "Aluguel",
        "calc": ["rentValue", "condominiumValue", "iptuValue", "homeownersInsuranceValue", "tenantServiceFee"],
        "showInMainCard": {
          "views": ["isBoth", "isRent"]
        },
      },
      {
        "costId": "13556176146",
        "text": "Mudança",
        "calc": ["494669153367", "221214278880", "255084876476"],
        "showInMainCard": {
          "views": ["isBoth", "isSell", "isRent"]
        },
      }]
    }
  });
  return <FormProvider {...formMethods}>
    <Flex
      bg="white"
      p={4}
      alignItems="center"
      gap={8}
      boxShadow="lg"
      borderRadius={"md"}
    >
      <AutoImport />
    </Flex>
    <Flex
      bg="white"
      p={4}
      alignItems="center"
      gap={8}
      boxShadow="lg"
      borderRadius={"md"}
    >
      <Flex
        direction={"column"}
        gap={4}
        flex={1}
      >
        <Heading fontSize="2xl" textAlign="center" p={4}>Você consegue organizar qualquer tipo de custo que você terá com o imóvel.</Heading>
        <Flex gap={4} direction={{
          base: 'column',
          md: 'row'
        }}
          justifyContent="space-evenly"
        >
          <Flex direction='column'>
            <Flex
              direction="column"
              bgColor="gray.100"
              p={2}
              borderRadius="md"
            >
              <Text fontWeight={"bold"}>Custos</Text>
              <Text fontSize="sm">Informe aqui todo e qualquer custo com o imóvel</Text>
            </Flex>
            <CostsTable />
          </Flex>
          <Flex direction="column">
            <Flex
              direction="column"
              bgColor="gray.100"
              p={2}
              borderRadius="md"
            >
              <Text fontWeight={"bold"}>Custos Totais</Text>
              <Text fontSize="sm">Agrupe custos para totalizar o valor. Eles podem ser exibidos no cartão do imóvel.</Text>
            </Flex>
            <TotalCosts />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  </FormProvider>
}

const AutoImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importErrorMessage, setImportErrorMessage] = useState('');
  const { reset } = useFormContext<ICostsForm>();

  const [imported, setImported] = useState<CustomProperty>();
  const handleImport = useCallback(async () => {
    try {
      setImported(null);
      setImportErrorMessage("");
      setIsLoading(true)
      const result = await ApiInstance.get(`/simple-views/properties-extractor?url=${importUrl}`);
      setImported(result.data.data)
      reset(result.data.data)
    } catch (error) {
      setImportErrorMessage('Infelizmente não conseguimos importar as informações desse site nesse momento. Você teria que criar manualmente o card para esse imóvel.')
    }
    setIsLoading(false)
  }, [importUrl, reset])

  return <Flex
    direction={{
      base: 'column',
      md: 'row'
    }}
    justify="space-evenly"
    flex={1}
    gap={4}
  >
    <Flex
      w={{
        base: 'full',
        md: "lg"
      }}
      direction="column"
      p={4}
      border="1px"
      borderColor="gray.100"
      shadow={"md"}
      borderRadius="lg"
    >
      <Heading fontSize="xl" m={4} textAlign="center">
        Importar de um site
      </Heading>
      <InputGroup>
        <InputLeftElement>
          <ExternalLinkIcon />
        </InputLeftElement>
        <Input placeholder='Link do imóvel' onChange={e => setImportUrl(e.target.value)} />
      </InputGroup>
      <Wrap mt={2}>
        {
          supportedImportProviders.map(provider => <Link key={provider.name} target="_blank" rel="noopener noreferrer" href={provider.url}><Tag>
            <TagLeftIcon boxSize='12px' as={ExternalLinkIcon} />
            <TagLabel>{provider.name}</TagLabel>
          </Tag></Link>)
        }
      </Wrap>
      {
        importErrorMessage && <Flex
          bgColor="red.200"
          w="full"
          p={4}
          borderRadius="md"
          mt={2}
        >
          {importErrorMessage}
        </Flex>
      }
      {!importErrorMessage && <Text m={4} textAlign="center" fontSize="xs">Esse é um recurso que ainda está sendo desenvolvido, mas você já pode tentar utilizá-lo.</Text>}
      <Flex py={2} alignItems={"center"} gap={2} alignSelf="end">
        <Button colorScheme="green" onClick={handleImport} isDisabled={!importUrl} isLoading={isLoading}>Importar</Button>
      </Flex>
    </Flex>
    {imported && <Fade in={!!imported}><Box
      w={{
        base: 'full',
        md: "sm"
      }}
      boxShadow='lg'
      borderRadius="sm"
      display="flex"
      flexDirection="column"
    >
      <Box width="100%" height="3xs" position="relative">
        <Box
          bgImage={imported.images[0]?.url || 'orange'}
          bgSize="contain"
          width="100%"
          height="100%"
        />
        <Flex position="absolute" bottom={1} left={1} gap={1}>
          {imported.information.nearSubway && <Tag size={"md"} variant='subtle' colorScheme='cyan' >
            <TagLeftIcon boxSize='12px' as={FaTrain} />
            <TagLabel>Metro próx.</TagLabel>
          </Tag>}
          {imported.information.isFurnished && <Tag size={"md"} variant='subtle' colorScheme='orange' >
            <TagLeftIcon boxSize='12px' as={FaCouch} />
            <TagLabel>Mobiliado</TagLabel>
          </Tag>}
          {!imported.isAvailable &&
            <Badge ml={1} textTransform={"none"} colorScheme="red">Indisponível</Badge>
          }
        </Flex>
      </Box>
      <Flex p={2}
        direction="column"
        flexGrow={1}
      >
        <Heading fontSize="md">{imported.address}</Heading>
        <Flex mt={1} alignItems="center">
          <Flex>
            {imported.information.totalArea &&
              <Badge textTransform={"none"}>{imported.information.totalArea}m²</Badge>
            }
            {imported.information.bedrooms &&
              <Badge ml={1} textTransform={"none"}>{imported.information.bedrooms} {imported.information.bedrooms > 1 ? "quartos" : "quarto"}</Badge>
            }
          </Flex>
          <Flex direction="column" flex={1} alignItems="end">
            <CardCostsElements />
          </Flex>
        </Flex>
      </Flex>
    </Box></Fade>}
  </Flex>
}

const CardCostsElements = () => {
  const { watch } = useFormContext<ICostsForm>();

  const [watchTotalCost, watchCosts] = watch(['totalCost', 'costs'])

  const totalCost = watchTotalCost.map(cost => {
    const value = watchCosts?.filter(c => cost.calc?.includes(c.costId)).reduce((a, c) => a + c.value, 0);
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
  return <>
    {totalCost.map(totalCost => {
      return <Text key={totalCost.id} fontWeight="bold" color="green" fontSize={"xs"}>{totalCost.text} {totalCost.value}</Text>
    })}
  </>
}

const uniqueID = () => Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))

const CostsTable = () => {
  const { register, control, formState: { errors } } = useFormContext<ICostsForm>();
  const { fields: fieldsCosts, append: appendCost, remove: removeCost } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "costs", // unique name for your Field Array.
  });

  return <>
    <TableContainer w="full">
      <Table>
        <Thead>
          <Tr>
            <Th p={1}>Id</Th>
            <Th p={1}>Nome</Th>
            <Th p={1}>Valor</Th>
            <Th p={1}></Th>
          </Tr>
        </Thead>
        <Tbody>
          {
            fieldsCosts.map((cost, i) => {
              return <Tr key={cost.id}>
                <Td
                  padding={1}
                >{i + 1}</Td>
                <Td
                  padding={1}
                >
                  <FormControl isInvalid={errors?.costs && !!errors.costs[i]?.text}>
                    <Input defaultValue={cost.text} {...register(`costs.${i}.text`, {
                      required: true,
                    })} />
                  </FormControl>
                </Td>
                <Td p={1} display="flex" alignItems="center" gap={2}>
                  <FormControl isInvalid={errors?.costs && !!errors.costs[i]?.value}>
                    <InputGroup>
                      <InputLeftAddon>R$</InputLeftAddon>
                      <Input defaultValue={cost.value} type="number" {...register(`costs.${i}.value`, {
                        setValueAs: e => Number(e),
                        required: true,
                      })} />
                    </InputGroup>
                  </FormControl>
                </Td>
                <Td padding={1} >
                  <IconButton icon={<DeleteIcon />} onClick={() => removeCost(i)} aria-label="Deletar" />
                </Td>
              </Tr>
            })
          }
        </Tbody>
      </Table>
    </TableContainer>
    <Button onClick={() => {
      appendCost({
        costId: uniqueID().toString(),
        text: '',
        value: 0
      })
    }}>Adicionar custo</Button>
  </>
}

const TotalCosts = () => {
  const { register, control, formState: { errors } } = useFormContext<CustomProperty>();
  const { fields: fieldsCostsTotal, append: appendCostTotal, remove: removeCostTotal } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "totalCost", // unique name for your Field Array.
  });
  const elements = useMemo(() => fieldsCostsTotal.map((cost, i) => {
    return <Flex
      key={cost.id}
      boxShadow="md"
      p={4}
      direction="column"
      gap={2}
    >
      <Flex alignItems="center" gap={2}>
        <Box h={6} w={6} textAlign="center" backgroundColor="gray.100" borderRadius={'full'}>
          <Text>{(i + 1).toString().padStart(2, '0')}</Text>
        </Box>
        <FormControl isInvalid={errors?.totalCost && !!errors.totalCost[i]?.text}>
          <Input defaultValue={cost.text} {...register(`totalCost.${i}.text`, {
            required: true,
          })} />
        </FormControl>
      </Flex>
      <Box p={2} boxShadow="xs">
        <Text fontSize="sm">Custos</Text>
        <TotalCostCheckboxes i={i} />
      </Box>
      <Flex alignItems="center" justifyContent={"space-around"} direction={{
        base: 'column',
        md: 'row'
      }} gap={{
        base: 2,
        md: 0
      }}>
        <TotalCostCalculatedValue i={i} />
        <IconButton icon={<DeleteIcon />} onClick={() => removeCostTotal(i)} aria-label="Deletar" />
      </Flex>
    </Flex>
  }), [errors?.totalCost, fieldsCostsTotal, register, removeCostTotal])
  return <>
    {elements}
    <Button onClick={() => {
      appendCostTotal({
        costId: uniqueID().toString(),
        text: '',
        calc: [],
        showInMainCard: {
          views: []
        }
      })
    }}>Adicionar total</Button>
  </>
}

const TotalCostCheckbox = ({
  costId,
  text,
  i,
  onChange,
}) => {
  const { watch } = useFormContext();
  const totalCost = watch(`totalCost.${i}`);
  const calc = totalCost.calc;
  const isPresentInCalc = calc.includes(costId);
  return <Checkbox defaultChecked={isPresentInCalc} onChange={(e) => {
    let newCalc: string[];
    if (!isPresentInCalc && e.target.checked) {
      newCalc = [...calc, costId]
    } else {
      newCalc = calc.filter(id => id !== costId)
    }
    onChange({
      target: {
        value: newCalc
      }
    })
  }}>{text}</Checkbox>
}

const TotalCostCheckboxes = ({
  i,
}) => {
  const { control, watch } = useFormContext();
  const [costs] = watch(['costs']);
  return <Controller
    control={control}
    name={`totalCost.${i}.calc`}
    render={({
      field: { onChange },
    }) => {
      return <>
        <Wrap gap={1}>
          {
            costs.filter(c => c.text).map(c => <TotalCostCheckbox
              i={i}
              key={`totalCost-${i}-checkbox-${c.costId}`}
              costId={c.costId}
              text={c.text}
              onChange={onChange} />)
          }
        </Wrap>
      </>
    }}
  />
}

const TotalCostCalculatedValue = ({
  i,
}) => {
  const { watch } = useFormContext();
  const [costs, totalCost] = watch(['costs', `totalCost.${i}`]);
  const value: number = costs.filter(c => totalCost.calc.includes(c.costId)).reduce((a, c) => a + c.value, 0);

  const parsedValue = value.toLocaleString('pt', {
    style: 'currency',
    currency: "BRL"
  })
  return <Flex alignItems="center" gap={2}>
    <Text fontWeight={"bold"}>Valor: </Text>
    <Text>
      {parsedValue}
    </Text>
  </Flex>
}