import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Highlight, Badge, Box, Button, Center, Colors, Flex, Heading, Icon, ResponsiveValue, SimpleGrid, Tag, TagLabel, TagLeftIcon, Text, Link, Wrap, TagRightIcon } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { FaBed, FaCar, FaCaretRight, FaCouch, FaFilter, FaHome, FaPhotoVideo, FaRobot, FaSearchDollar, FaSearchLocation, FaShower, FaStickyNote, FaTrain, FaUsers } from "react-icons/fa";
import useUser from "../lib/useUser";
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
        <Icon as={FaHome} h={14} w={14} />
        <Heading fontSize="6xl">PartAp</Heading>
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

  </Flex>
}

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