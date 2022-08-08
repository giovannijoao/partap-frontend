import { AddIcon, ChevronLeftIcon, DeleteIcon, EditIcon, EmailIcon, ExternalLinkIcon, LinkIcon, LockIcon, StarIcon, UnlockIcon } from "@chakra-ui/icons";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Center, CircularProgress, Container, Divider, Flex, Grid, Heading, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Textarea, Tooltip, useDisclosure, useToast, Wrap, WrapItem } from "@chakra-ui/react"
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { Fragment, TextareaHTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaBed, FaCar, FaCouch, FaDog, FaHospital, FaRuler, FaSchool, FaShower, FaStore, FaSubway } from "react-icons/fa";
import { mutate } from "swr";
import Header from "../../components/Header"
import MoneyIconSVG from "../../components/js-icons/Money";
import SendIconSVG from "../../components/js-icons/Send";
import ShareIconSVG from "../../components/js-icons/Share";
import { sessionOptions } from "../../lib/session";
import useNearbyData from "../../lib/useNearby";
import useProperty from "../../lib/useProperty";
import useUser from "../../lib/useUser";
import { ApiInstance } from "../../services/api";
import { IPropertySaved } from "../interfaces/IProperty";
import { ApiURL } from '../../config'
const formatNumber = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 })

type DisplayInfo = {
  key: string;
  value: (property: IPropertySaved) => (string | JSX.Element)
  filter: (property: IPropertySaved) => boolean
  icon: string | (() => JSX.Element);
  borderColor?: string;
  color?: string;
}

const displayInfo: DisplayInfo[] = [{
  key: 'availability',
  icon: () => <LockIcon color="red.500" />,
  value: property => "Não disponível",
  filter: property => !property?.isAvailable,
  borderColor: "red.500",
  color: "red.500"
}, {
  key: 'totalArea',
  icon: () => <Icon as={FaRuler} color="purple.500" />,
  value: property => `${property?.information.totalArea}m²`,
  filter: property => !!property?.information.totalArea,
}, {
  key: 'bedrooms',
  icon: () => <Icon as={FaBed} color="purple.500" />,
  value: property => `${property?.information.bedrooms} quarto${property?.information.bedrooms > 1 ? 's' : ''}`,
  filter: property => !!property?.information.bedrooms,
}, {
  key: 'bathrooms',
  icon: () => <Icon as={FaShower} color="purple.500" />,
  value: property => `${property?.information.bathrooms} banheiro${property?.information.bathrooms > 1 ? 's' : ''}`,
  filter: property => !!property?.information.bathrooms,
}, {
  key: 'parkingSlots',
  icon: () => <Icon as={FaCar} color="purple.500" />,
  value: property => `${property?.information.parkingSlots} vaga${property?.information.parkingSlots > 1 ? 's' : ''}`,
  filter: property => !!property?.information.parkingSlots,
}, {
  key: 'acceptPets',
  icon: () => <Icon as={FaDog} color="purple.500" />,
  value: property => `Aceita pets`,
  filter: property => property?.information.acceptPets,
}, {
  key: 'nearSubway',
  icon: () => <Icon as={FaSubway} color="purple.500" />,
  value: property => <Text textAlign="center">Metrô<br/>próximo</Text>,
  filter: property => property?.information.nearSubway,
}, {
  key: 'isFurnished',
  icon: () => <Icon as={FaCouch} color="purple.500" />,
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
  "text": (property: IPropertySaved) => property.modo === "both" ? "Total Aluguel" : "Total",
  "bgColor": "linear-gradient(to-r, pink.400, pink.600)",
  "fontColor": "white",
  "filter": (property: IPropertySaved) => ['both', 'aluguel'].includes(property.modo)
}]

export default function PropertyPage({
  userServerData,
  propertyServerData,
}) {
  const { query, push } = useRouter();
  const { user } = useUser({
    redirectTo: `/login`,
    fallback: userServerData
  })

  const { isOpen: isOpenAdminInvite, onOpen: onOpenAdminInvite, onClose: onCloseAdminInvite } = useDisclosure()
  const { isOpen: isOpenSelfInvite, onOpen: onOpenSelfInvite, onClose: onCloseSelfInvite } = useDisclosure()

  const descriptionRef = useRef<any>();
  const contactInfoRef = useRef<any>();
  const imagesRef = useRef<HTMLDivElement | undefined>();

  const propertyId = query.id as string;
  const token = query.token as string;
  const { property, mutateProperty } = useProperty({
    propertyId,
    token,
    fallback: propertyServerData,
  });

  const isAdminUser = user && user.id === property?.user._id;
  const isInvitedUser = !!token && user.id !== property?.user._id && !property?.share?.users.find(u => u._id === user.id);


  useEffect(() => {
    if (isInvitedUser) onOpenSelfInvite()
  }, [isInvitedUser, onOpenSelfInvite])

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight + 5}px`
    }
  }, [descriptionRef])

  useEffect(() => {
    if (contactInfoRef.current) {
      contactInfoRef.current.style.height = `${contactInfoRef.current.scrollHeight + 5}px`
    }
  }, [contactInfoRef])

  useEffect(() => {
    if (imagesRef.current) {
      imagesRef.current.scrollTo({
        left: 0,
        behavior: 'smooth'
      })
    }
  }, [property?.images, imagesRef])


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
        <Text fontWeight={"semibold"} flex={1}>{typeof costType.text === "function" ? costType.text(property) : costType.text}</Text>
        <Text
          color={costType.fontColor || "purple.500"}
          fontWeight={"bold"}
          fontSize="lg"
        >{cost}</Text>
      </Flex>
    })
    , [property])

  const toggleAvailability = useCallback(async () => {
    try {
      await ApiInstance.put(`/properties/${propertyId}`, {
        isAvailable: !property?.isAvailable
      }, {
        headers: {
          Authorization: user.token
        }
      });
      mutateProperty(propertyId);
    } catch (error) {
      console.log("error")
    }
  }, [mutateProperty, property?.isAvailable, propertyId, user?.token])

  if (!property) {
    return <Flex w="100vw" h="100vh" alignItems="center" justifyContent="center">
      <Box textAlign="center">
        <Spinner size="xl" />
        <Text>Um momento, por favor...</Text>
      </Box>
    </Flex>
  }

  return <>
    <Flex direction="column" height={"100vh"} mb={16}>
      <Header />
      <Flex alignItems="center"
        gap={2}
        p={4}
        bgGradient='linear-gradient(to-r, pink.400, pink.600)'
        position="sticky"
        top={0}
      >
        <IconButton aria-label="Go back home" onClick={() => push(`/home`)} icon={<ChevronLeftIcon h={8} w={8} />} />
        <Heading fontSize={"2xl"} color='white'>{property.address}</Heading>
      </Flex>
      <Flex direction="column">
        {property.images.length > 0 && <Flex
          bgGradient='linear-gradient(to-r, pink.400, pink.600)'
          ref={imagesRef}
          gap={2}
          p={2}
          overflowX="scroll"
          scrollSnapType={"x mandatory"}
          scrollPadding={4}
        >
          {property.images.map((image, i) => <Image
            key={image.url}
            maxH={"sm"}
            src={image.url}
            alt={image.description}
            boxShadow="md"
            borderRadius="md"
            scrollSnapAlign={"start"}
            border={"2px"}
            borderColor="white"
          />)}
        </Flex>}
        <Grid
          px={4}
          my={4}
          gap={6}
          gridTemplateAreas={{
            base: `
              "info"
              "sidePanel"
              "more"
            `,
            md: `
              "info sidePanel"
              "more sidePanel"
            `
          }}
          gridTemplateColumns={{
            base: "1fr",
            md: "3fr 1fr"
          }}
        >
          <Box gridArea="info">
            <Wrap mb={4}>
              {displayInformationGroups.map(d => {
                const Icon = d.icon;
                const Value = d.value;
                return <WrapItem
                  display={"flex"}
                  flexDirection="column"
                  p={4}
                  key={d.key}
                  gap={1}
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="sm"
                  border="1px"
                  borderColor={d.borderColor || "gray.100"}
                  borderRadius="lg"
                >
                  {typeof (Icon) === "string" ? <Image src={d.icon as string} alt="Icon" /> : <Icon />}
                  {typeof (Value) === "string" ? <Text color={d.color}>{Value}</Text> : Value}
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
              {property.information.description && <Textarea ref={descriptionRef} resize="none" defaultValue={property.information.description} isReadOnly={true} />}
              {!property.information.description && <Text fontStyle={"italic"}>Sem descrição</Text>}
            </Box>
          </Box>
          <Tabs gridArea="more">
            <TabList>
              <Tab>Chat</Tab>
              <Tab>Informações de Contato</Tab>
              <Tab>Por perto</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Chat gridArea="chat" property={property} />
              </TabPanel>
              <TabPanel>
                {property.contactInfo?.description && <Textarea ref={contactInfoRef} resize="none" defaultValue={property.contactInfo.description} isReadOnly={true} />}
                {!property.contactInfo?.description && <Text fontStyle={"italic"}>Sem descrição</Text>}
              </TabPanel>
              <TabPanel>
                <Nearby propertyId={propertyId} token={token} />
              </TabPanel>
            </TabPanels>
          </Tabs>
          <Flex gridArea="sidePanel" maxW={{
          }} flex={1} direction="column" gap={2}>
            {costsElements}
            <Divider my={2} />
            <Flex direction="column" gap={2}>
              {isAdminUser && <>
                <Button colorScheme='purple' leftIcon={<ShareIconSVG />} onClick={onOpenAdminInvite}>Compartilhar com alguém</Button>
                <Button leftIcon={<EditIcon />} onClick={() => push(`/edit/${propertyId}`)}>Editar imóvel</Button>
              </>}
              <Button colorScheme={property?.isAvailable ? "red" : "green"} variant="outline" leftIcon={property?.isAvailable ? <LockIcon color="red.500" /> : <UnlockIcon color="green.500" />} onClick={toggleAvailability}>Marcar como {property?.isAvailable ? "indisponível" : "disponível"}</Button>
              {property.url && <Button as="a" leftIcon={<ExternalLinkIcon />} href={property.url} target="_blank" rel="noopener noreferrer">Abrir site do imóvel</Button>}
              {!isAdminUser && <Tooltip label='Você foi convidado pelo responsável'><Box p={4} border="1px" borderColor={"gray.300"} borderRadius="md">
                <Text>Responsável: {property?.user.name}</Text>
              </Box></Tooltip>}
            </Flex>
          </Flex>
        </Grid>
      </Flex>
    </Flex>
    {isAdminUser && <ShareModal isOpenInvite={isOpenAdminInvite} onCloseInvite={onCloseAdminInvite} property={property} />}
    {isInvitedUser && <SelfInviteModal isOpenSelfInvite={isOpenSelfInvite} onCloseSelfInvite={onCloseSelfInvite} property={property} token={token} />}
  </>;
}

export const getServerSideProps = withIronSessionSsr(async ({
  req,
  res
}) => {
  const [, id] = req.url.match(/property\/(.*)/)
  const result = await fetch(`${ApiURL}/properties/${id}`, {
    headers: {
      Authorization: req.session.user.token,
    },
  })
  const data = await result.json()
  return {
    props: {
      userServerData: {
        ...req.session.user
      },
      propertyServerData: data
    }, // will be passed to the page component as props
  }
}, sessionOptions)

function Nearby({
  propertyId,
  token,
}) {
  const { nearbyData } = useNearbyData({
    propertyId,
    token,
  })
  const nearbyPlaces = useMemo(() => [{
    placeId: 'hospital',
    icon: FaHospital,
    text: 'Hospitais'
  }, {
    placeId: 'school',
    icon: FaSchool,
    text: 'Escolas'
  }, {
    placeId: 'drugstore',
    icon: FaStore,
    text: 'Drogarias'
  }].map(place => {
    const list = nearbyData?.places
      .filter((p) => p.types.includes(place.placeId))
      .filter((_, i) => i < 3)
    if (list?.length === 0) return <></>
    return <Box
      flex={1}
      key={place.placeId}
      p={4}
      boxShadow="xs"
    >
      <Flex alignItems="center" gap={2}>
        <Icon as={place.icon} w={8} h={8} />
        <Heading fontSize="lg">{place.text}</Heading>
      </Flex>
      <Accordion mt={2} allowMultiple>
        {list?.map(item => {
          return <AccordionItem key={item.place_id}>
            <h2>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  {item.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {item.address}
            </AccordionPanel>
          </AccordionItem>
        })}
      </Accordion>
    </Box>
  }), [nearbyData])

  return <Box gridArea="nearby" p={4} borderRadius="md" boxShadow='md'>
    {
      !nearbyData && <Center h="full" w="full">
        <CircularProgress isIndeterminate color='green.300' />
      </Center>
    }
    {
      nearbyData && <Flex gap={2} direction={{
        base: 'column',
        md: 'row'
      }}>
        {nearbyPlaces}
      </Flex>
    }
  </Box>
}

function Chat({
  property: _property,
  gridArea,
}) {
  const property = _property as IPropertySaved;
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await ApiInstance.post(`/messages/${property._id}`, {
        message,
      }, {
        headers: {
          Authorization: user?.token
        }
      });
      setMessage("")
      mutate(`/properties/${property._id}`)
    } catch (error) {
      console.log("error")
    }
    setIsLoading(false)
  }, [message, property._id, user?.token])


  const messageElements = useMemo(() => property?.messages.map(message => {
    const isFromMe = message.user._id === user?.id;
    return <Box
      key={message._id}
      w={{
        base: "90%",
        md: "80%",
        lg: "70%"
      }}
      h='fit-content'
      border="1px"
      borderColor="gray.300"
      borderRadius="lg"
      backgroundColor={"gray.100"}
      p={4}
      {...isFromMe ? ({
        ml: "auto"
      }) : ({
        mr: "auto"
      })}
    >
      <Text>{message.message}</Text>
      <Flex alignItems="center" gap={2} mt={2}>
        <Image
          borderRadius='full'
          boxSize='6'
          src={`https://ui-avatars.com/api/?name=${message.user.name}`}
          alt='Profile'
        />
        <Text flex={1} fontWeight={"bold"}>{message.user.name}</Text>
        <Text color="gray.500">{new Date(message.date).toLocaleString()}</Text>
      </Flex>
    </Box>
  }), [property?.messages, user?.id])

  return <Flex gridArea={gridArea} h="full" minH="lg" direction="column">
    <Flex
      direction="column"
      mt={2}
      border="1px"
      borderColor="gray.300"
      borderRadius="lg"
      w={{
        base: "full",
      }}
      h="full"
      flex={1}
    >
      <Flex
        direction="column"
        p={4}
        gap={2}
        flex={1}
        overflowY="auto"
      >
        {messageElements}
      </Flex>
      <Divider />
      <Flex as="form" m={2} gap={2} onSubmit={handleSendMessage}>
        <Input isDisabled={isLoading} type='text' placeholder='Envie uma mensagem' onChange={e => setMessage(e.target.value)} value={message || ""} />
        <IconButton isLoading={isLoading} aria-label="Enviar mensagem" icon={<SendIconSVG />} type="submit" />
      </Flex>
    </Flex>
  </Flex>
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
    if (!loggedUser) return;
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
  }, [email, loggedUser, mutateProperty, property._id])

  const handleRemove = useCallback(async (userId) => {
    if (!loggedUser) return;
    await ApiInstance.delete(`/share/${property._id}`, {
      params: {
        user: userId,
      },
      headers: {
        Authorization: loggedUser.token,
      },
    }).then(res => res.data);
    mutateProperty()
  }, [loggedUser, mutateProperty, property._id])

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
  }, [loggedUser, property._id, property.share])



  return <Modal isOpen={isOpenInvite} onClose={onCloseInvite}>
    <ModalOverlay />
    <ModalContent mx={2}>
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
        <Button isLoading={isLoading} leftIcon={<LinkIcon />} colorScheme='purple' onClick={handleCopyLink}>
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
    <ModalContent mx={2}>
      <ModalHeader>Você recebeu um convite</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text><span style={{ fontWeight: 500 }}>{property.user.name}</span> te enviou esse imóvel.</Text>
        <Text>Deseja adicionar aos seus imóveis para fácil acesso na tela inicial?</Text>
      </ModalBody>

      <ModalFooter>
        <Button isLoading={isLoading} colorScheme='purple' leftIcon={<StarIcon />} onClick={handleAdd}>Adicionar</Button>
        <Button isLoading={isLoading} variant='ghost' onClick={onCloseSelfInvite}>Apenas visualizar</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
}