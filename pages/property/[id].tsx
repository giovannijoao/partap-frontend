import { AddIcon, ChevronLeftIcon, DeleteIcon, EmailIcon, LinkIcon, StarIcon } from "@chakra-ui/icons";
import { Box, Button, Container, Divider, Flex, Grid, Heading, IconButton, Image, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spinner, Text, useDisclosure, useToast, Wrap, WrapItem } from "@chakra-ui/react"
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mutate } from "swr";
import Header from "../../components/Header"
import MoneyIconSVG from "../../components/js-icons/Money";
import ShareIconSVG from "../../components/js-icons/Share";
import useProperty from "../../lib/useProperty";
import useUser from "../../lib/useUser";
import { ApiInstance } from "../../services/api";
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
  "fontColor": "white",
  "filter": (property: IPropertySaved) => property.modo === "aluguel"
}]

export default function PropertyPage() {
  const { query, push } = useRouter();
  const { user } = useUser({
    redirectTo: `/login`
  })
  const { isOpen: isOpenAdminInvite, onOpen: onOpenAdminInvite, onClose: onCloseAdminInvite } = useDisclosure()
  const { isOpen: isOpenSelfInvite, onOpen: onOpenSelfInvite, onClose: onCloseSelfInvite } = useDisclosure()

  const propertyId = query.id as string;
  const token = query.token as string;
  const { property } = useProperty({
    propertyId,
    token,
  });
  const isAdminUser = user && user.id === property?.user._id;
  const isInvitedUser = !!token && user.id !== property?.user._id && !property?.share?.users.find(u => u._id === user.id);


  useEffect(() => {
    if (isInvitedUser) onOpenSelfInvite()
  }, [isInvitedUser, onOpenSelfInvite])


  const displayInformationGroups = useMemo(() => displayInfo.filter(d => d.filter(property)).map(d => {
    const value = d.value(property)
    return {
      ...d,
      value,
    }
  }), [property])

  const costsElements = useMemo(() => allCostsTypes
    .filter(costType => property?.costs && (property.costs[costType.name] && property.costs[costType.name] !== 0) && (!costType.filter || costType.filter(property)))
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
          {property.images.map((image, i) => <Image maxH={"sm"} key={image.url} src={image.url} alt={image.description} />)}
        </Flex>
        <Flex my={4} gap={6} direction={{
          base: "column",
          md: "row",
          lg: "row"
        }}>
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
          <Flex maxW={{
            base: "full",
            sm: "xs",
          }} flex={1} direction="column" gap={2}>
            {costsElements}
            <Divider my={2} />
            <Flex direction="column" gap={2}>
              {isAdminUser  && <Button colorScheme='purple' leftIcon={<ShareIconSVG />} onClick={onOpenAdminInvite}>Compartilhar com alguém</Button>}
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Flex>
    {isAdminUser  && <ShareModal isOpenInvite={isOpenAdminInvite} onCloseInvite={onCloseAdminInvite} property={property} />}
    {isInvitedUser && <SelfInviteModal isOpenSelfInvite={isOpenSelfInvite} onCloseSelfInvite={onCloseSelfInvite} property={property} token={token} />}
  </>;
}


function ShareModal({
  isOpenInvite,
  onCloseInvite,
  property: _property,
 }) {
  const property = _property as IPropertySaved;
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("")
  const [email, setEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const { user: loggedUser } = useUser()

  const mutateProperty = useCallback(() => mutate(`/properties/${property._id}`), [property._id]);
  const handleAdd = useCallback(async (e) => {
    e.preventDefault()
    setErrorMsg("")
    setIsLoading(true)
    try {
      const user = await ApiInstance.get(`/users-invite`, {
        params: {
          email,
        },
        headers: {
          Authorization: loggedUser.token,
        }
      }).then(res => res.data);
      await ApiInstance.put(`/share/${property._id}`, {
        user: user.data._id,
      }, {
        headers: {
          Authorization: loggedUser.token,
        },
      }).then(res => res.data);
      setEmail("")
      mutateProperty()
    } catch (error) {
      const message = error.response?.data?.message;
      if (message === "User not found") setErrorMsg("Usuário não encontrado")
      else if (message === "User already invited") setErrorMsg("Usuário já convidado")
      else if (message === "You cannot invite yourself") setErrorMsg("Você não pode adicionar a si mesmo")
      else setErrorMsg("Ocorreu um erro")
    }
    setIsLoading(false)
  }, [email, loggedUser.token, mutateProperty, property._id])

  const handleRemove = useCallback(async (userId) => {
    await ApiInstance.delete(`/share/${property._id}`, {
      params: {
        user: userId,
      },
      headers: {
        Authorization: loggedUser.token,
      },
    }).then(res => res.data);
    mutateProperty()
  }, [loggedUser.token, mutateProperty, property._id])

  const handleCopyLink = useCallback(async () => {
    if (!property.share.token) {
      setIsLoading(true)
      const tokenResponse = await ApiInstance.get(`/share/${property._id}`, {
        headers: {
          Authorization: loggedUser.token,
        }
      }).then(res => res.data);
      property.share.token = tokenResponse.data.token;
      setIsLoading(false)
    }
    const link = `${window.location.origin}/property/${property._id}?token=${property.share.token}`
    navigator.clipboard.writeText(link)
    setLinkCopied(true)
  }, [loggedUser.token, property._id, property.share])



  return <Modal isOpen={isOpenInvite} onClose={onCloseInvite}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Compartilhar</ModalHeader>
      <ModalCloseButton />
      <ModalBody mb={4}>
        <Flex as="form" gap={2} onSubmit={handleAdd} >
          <InputGroup>
            <InputLeftElement
              pointerEvents='none'
            ><EmailIcon color='gray.300' /></InputLeftElement>
            <Input disabled={isLoading} type='email' placeholder='Email do convidado' onChange={e => setEmail(e.target.value)} value={email || ""} />
          </InputGroup>
          <Button leftIcon={<AddIcon />} isLoading={isLoading} colorScheme='teal' variant='solid' type={"submit"}>
            Convidar
          </Button>
        </Flex>
        {errorMsg && <Text fontSize="sm" color="red.500" textAlign="left">{errorMsg}</Text>}
        <Divider mt={2} />
        <Flex my={2} direction="column" gap={1}>
          {property.share.users.map((user, i) => {
            return <Fragment key={user._id}>
              <Flex flex={1} alignItems="center" gap={4}>
              <Image
                borderRadius='full'
                boxSize='8'
                src={`https://ui-avatars.com/api/?name=${user.name}`}
                alt='Profile'
              />
              <Text>{user.name}</Text>
              <IconButton ml="auto" aria-label={`Remover usuário ${user.name}`} icon={<DeleteIcon />} onClick={() => handleRemove(user._id)} />
            </Flex>
            {property.share.users.length !== i - 1 && <Divider my={0.5} />}
            </Fragment>
          })}
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button isLoading={isLoading} leftIcon={<LinkIcon />}  colorScheme='purple' onClick={handleCopyLink}>
          {linkCopied ? "Link copiado" : "Copiar link"}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
}

function SelfInviteModal({
  isOpenSelfInvite,
  onCloseSelfInvite,
  property: _property,
  token,
}) {
  const toast = useToast();
  const { user } = useUser();
  const property = _property as IPropertySaved;
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await ApiInstance.put(`/share/${property._id}`, {
        user: user.id,
        token,
      }, {
        headers: {
          Authorization: user.token,
        },
      }).then(res => res.data);
      mutate(`/properties/${property._id}?token=${token}`)
      mutate(`/properties`)
      toast({
        title: 'Adicionado ao seus imóveis',
        description: "Agora você pode ver esse imóvel na sua tela de acompanhamento",
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
      onCloseSelfInvite()
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }, [property._id, user.id, user.token, token, toast, onCloseSelfInvite])

  return <Modal isOpen={isOpenSelfInvite} onClose={onCloseSelfInvite}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Você recebeu um convite</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text><span style={{fontWeight: 500}}>{property.user.name}</span> te enviou esse imóvel.</Text>
        <Text>Deseja adicionar aos seus imóveis para fácil acesso na tela inicial?</Text>
      </ModalBody>

      <ModalFooter>
        <Button isLoading={isLoading} colorScheme='purple' leftIcon={<StarIcon />} onClick={handleAdd}>Adicionar</Button>
        <Button isLoading={isLoading} variant='ghost' onClick={onCloseSelfInvite}>Apenas visualizar</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
}