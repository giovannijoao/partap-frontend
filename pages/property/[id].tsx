import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Container, Flex, Grid, Heading, IconButton, Image, SimpleGrid, Spinner, Text, Wrap, WrapItem } from "@chakra-ui/react"
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Header from "../../components/Header"
import MoneyIconSVG from "../../components/js-icons/Money";
import useProperty from "../../lib/useProperty";
import useUser from "../../lib/useUser";
import { IPropertySaved } from "../interfaces/IProperty";
const formatNumber = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 })

type DisplayInfo = {
  key: string;
  value: (property: IPropertySaved) => string
  filter: (property: IPropertySaved) => boolean
  icon: string;
}

const displayInfo: DisplayInfo[] = [{
  key: 'totalArea',
  icon: '/bx_ruler.svg',
  value: property => `${property?.information.totalArea}m²`,
  filter: property => !!property?.information.totalArea,
}, {
  key: 'bedrooms',
  icon: '/cil_bed.svg',
  value: property => `${property?.information.bedrooms} quarto${property?.information.bedrooms > 1 ? 's' : ''}`,
  filter: property => !!property?.information.bedrooms,
}, {
  key: 'bathrooms',
  icon: '/cil_shower.svg',
  value: property => `${property?.information.bathrooms} banheiro${property?.information.bathrooms > 1 ? 's' : ''}`,
  filter: property => !!property?.information.bathrooms,
}, {
  key: 'parkingSlots',
  icon: '/bxs_car-garage.svg',
  value: property => `${property?.information.parkingSlots} vagas${property?.information.parkingSlots > 1 ? 's' : ''}`,
  filter: property => !!property?.information.parkingSlots,
}, {
  key: 'acceptPets',
  icon: '/dashicons_pets.svg',
  value: property => `Aceita pets`,
  filter: property => property?.information.acceptPets,
}, {
  key: 'nearSubway',
  icon: '/ic_baseline-subway.svg',
  value: property => `Metrô próximo`,
  filter: property => property?.information.nearSubway,
}, {
  key: 'isFurnished',
  icon: '/cil_sofa.svg',
  value: property => `Mobiliado`,
  filter: property => property?.information.isFurnished,
}]

const allCostsTypes = [{
  "name": "rentValue",
  "text": "Aluguel"
}, {
  "name": "condominiumValue",
  "text": "Condomínio"
}, {
  "name": "iptuValue",
  "text": "IPTU"
}, {
  "name": "sellPrice",
  "text": "Compra"
}, {
  "name": "totalCost",
  "text": "Total",
  "bgColor": "linear-gradient(to-r, pink.400, pink.600)",
  "fontColor": "white"
}]

export default function PropertyPage() {
  const { query, push } = useRouter();
  const { logout } = useUser({
    redirectTo: `/login`
  })

  const propertyId = query.id as string;
  const { property } = useProperty({
    propertyId
  });

  const displayInformationGroups = useMemo(() => displayInfo.filter(d => d.filter(property)).map(d => {
    const value = d.value(property)
    return {
      ...d,
      value,
    }
  }), [property])

  const costsElements = useMemo(() => allCostsTypes
    .filter(costType => property?.costs && (property.costs[costType.name] || property.costs[costType.name] === 0))
    .map(costType => {
      const cost = formatNumber.format(property.costs[costType.name]);
      return <Flex
        key={costType.name}
        gap={2}
        alignItems="center"
        p={2}
        border="1px"
        borderColor="gray.300"
        borderRadius="lg"
        bgGradient={costType.bgColor}
        color={costType.fontColor || "black"}
      >
        <MoneyIconSVG fill={costType.fontColor} />
        <Text fontWeight={"semibold"} flex={1}>{costType.text}</Text>
        <Text
          color={costType.fontColor || "purple.500"}
          fontWeight={"bold"}
          fontSize="lg"
        >{cost}</Text>
      </Flex>
    })
  , [property])

  if (Array.isArray(query.id)) {
    logout();
    return <></>
  }


  if (!property) {
    return <Flex w="100vw" h="100vh" alignItems="center" justifyContent="center">
      <Box textAlign="center">
        <Spinner size="xl" />
        <Text>Um momento, por favor...</Text>
      </Box>
    </Flex>
  }

  return <>
    <Flex gap={2} direction="column" height={"100vh"} mb={16}>
      <Header />
      <Box px={4}>
        <Flex alignItems="center" gap={2} mb={4}>
          <IconButton aria-label="Go back home" onClick={() => push(`/home`)} icon={<ChevronLeftIcon h={8} w={8} />} />
          <Heading fontSize={"2xl"}>{property.address}</Heading>
        </Flex>
        <Flex
          gap={1}
          overflowX="auto"
        >
          {property.images.map((image, i) => <Image key={image.url} src={image.url} alt={image.description} />)}
        </Flex>
        <Flex my={4} gap={6}>
          <Box flex={2}>
            <Wrap mb={4}>
              {displayInformationGroups.map(d => {
                return <WrapItem
                  display={"flex"}
                  flexDirection="column"
                  p={4}
                  key={d.key}
                  gap={1}
                  alignItems="center"
                  boxShadow="sm"
                  border="1px"
                  borderColor="gray.300"
                  borderRadius="lg"
                >
                  <Image src={d.icon} alt="Icon" />
                  <Text>{d.value}</Text>
                </WrapItem>
              })}
            </Wrap>
            <Box
              textAlign="left"
              w={{
                xs: "xs",
                sm: "sm",
              }}
              mr="auto"
            >
              <Text fontWeight="bold">Descrição</Text>
              {property.information.description}
            </Box>
          </Box>
          <Flex flex={1} direction="column" gap={2}>
            {costsElements}
          </Flex>
        </Flex>
      </Box>
    </Flex>
  </>;
}
