import { AttachmentIcon, ChevronLeftIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Flex, FormControl, FormErrorMessage, Grid, Heading, Icon, IconButton, Image, Input, InputGroup, InputLeftAddon, InputLeftElement, InputRightAddon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text, Textarea, Wrap } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { FaAlignJustify, FaBed, FaCamera, FaCar, FaClock, FaCouch, FaDog, FaDollarSign, FaHome, FaInfo, FaParagraph, FaRuler, FaShower, FaSubway } from "react-icons/fa";
import useProperty from "../../lib/useProperty";
import Header from "../../components/Header";
import useUser from "../../lib/useUser";
import { ApiInstance } from "../../services/api";

const formSteps = [
  'options',
  'form',
  'description',
  'pricing',
  'photos'
]

const allCostsTypes = [{
  "name": "rentValue",
  "text": "Aluguel",
  availableIn: ['aluguel', 'both'],
  isRequired: true,
}, {
  "name": "sellPrice",
  "text": "Compra",
  availableIn: ['compra', 'both']
}, {
  "name": "condominiumValue",
  "text": "Condomínio",
  availableIn: ['aluguel', 'compra', 'both'],
  isRequired: false,
}, {
  "name": "iptuValue",
  "text": "IPTU",
  availableIn: ['aluguel', 'compra', 'both'],
  isRequired: false,
}]

type IImage = {
  url: string,
  description?: string
}

export default function NewV2() {
  const { user } = useUser({
    redirectTo: '/login'
  });
  const router = useRouter()
  const [importUrl, setImportUrl] = useState("");
  const [step, dispatchStep] = useReducer((state, action) => {
    let nextInd;
    if (action === 'next') {
      nextInd = formSteps.indexOf(state) + 1
    } else if (action === "back") {
      nextInd = formSteps.indexOf(state) - 1
    } else if (action === "start") {
      nextInd = 0;
    } else if (action.next) {
      nextInd = formSteps.indexOf(action.next)
    }
    return formSteps[nextInd]
  }, 'options')
  const [images, setImages] = useState<IImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const propertyId = router.query.id as string;
  const { property, mutateProperty } = useProperty({
    propertyId,
  })
  const { register, handleSubmit: handleFormSubmit, reset, getValues, setValue, watch, trigger, formState: { errors } } = useForm<{
    modo: string;
    address: string;
    information: {
      bedrooms: number;
      bathrooms: number;
      parkingSlots: number;
      nearSubway: boolean;
      isFurnished: boolean;
      acceptPets: boolean;
      totalArea: number;
      description: string;
    }
    costs: {
      rentValue: number
      condominiumValue: number
      iptuValue: number
      sellPrice: number
    }
    [key: string]: any
  }>({
    defaultValues: {
      modo: 'aluguel',
      address: '',
      information: {
        bedrooms: null,
        bathrooms: null,
        parkingSlots: 0,
        nearSubway: false,
        isFurnished: false,
        acceptPets: false,
        totalArea: null,
        description: null,
      },
      costs: {
        rentValue: null,
        condominiumValue: null,
        iptuValue: null,
        sellPrice: null,
      }
    }
  })
  const modoSelecionado = watch('modo', 'aluguel');

  useEffect(() => {
    reset(property)
    setImages(property.images)
  }, [property, reset])

  const handleSubmit = useCallback(async (values) => {
    const newValues = {
      ...values,
      provider: values.provider || "own",
      images,
      isSell: ['compra', 'both'].includes(values.modo),
      isRent: ['aluguel', 'both'].includes(values.modo)
    }
    setIsLoading(true)
    try {
      await ApiInstance.put(`/properties/${propertyId}`, newValues, {
        headers: {
          Authorization: user?.token
        }
      });
      mutateProperty(propertyId);
      router.replace('/property/'.concat(propertyId))
    } catch (error) {
      console.log("error")
    }
    setIsLoading(false)
  }, [images, propertyId, user?.token, mutateProperty, router]);

  const onDrop = useCallback(async acceptedFiles => {
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('photos', file)
    })
    const result = await ApiInstance.post('/file-upload', formData, {
      headers: {
        Authorization: user.token,
      },
    });
    console.log(result.data.map(x => ({
      url: x.location
    })))
    setImages(state => [...state, ...result.data.map(x => ({
      url: x.location
    }))])
  }, [user?.token])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const formValues = getValues();
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
      <Header />
      <Center
        flexDirection="column"
        gridArea="body"
        p={4}
        gap={4}
      >
        <ShowIf value={step === "options"}>
          <Center>
            <Flex
              direction={"column"}
              w={{
                base: 'full',
                md: 'xl'
              }}
              boxShadow={"lg"}
              borderRadius="md"
            >
              <Flex
                w="full"
                bgGradient="linear-gradient(to-r, pink.400, pink.600)"
                p={4}
                borderTopRadius="lg"
                alignItems={"center"}
              >
                <IconButton icon={<ChevronLeftIcon />} aria-label="Voltar" onClick={() => router.replace('/property/'.concat(propertyId))} />
                <Heading flex={1} textAlign="center" fontSize="lg" color="white">Editar imóvel</Heading>
              </Flex>
              <Flex direction="column" p={4} my={4} gap={2}>
                <Text textAlign="center">O que você deseja editar?</Text>
                <Flex gap={2} justifyContent="space-evenly" wrap='wrap'>
                  {
                    [
                      {
                        icon: FaInfo,
                        text: 'Informações básicas',
                        next: 'form',
                      },
                      {
                        icon: FaAlignJustify,
                        text: 'Descrição',
                        next: 'description',
                      },
                      {
                        icon: FaCamera,
                        text: 'Fotos',
                        next: 'photos',
                      },
                      {
                        icon: FaDollarSign,
                        text: 'Editar preços',
                        next: 'pricing',
                      }
                    ].map(item => {
                      return <Center
                        key={item.text}
                        flexDirection="column"
                        boxShadow={"md"}
                        borderRadius="md"
                        p={4}
                        border={'2px'}
                        borderColor={'gray'}
                        cursor="pointer"
                        boxSizing="border-box"
                        onClick={() => dispatchStep({ next: item.next })}
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        w="3xs"
                      >
                        <Icon as={item.icon} h={4} w={4} />
                        <Text textAlign="center">{item.text}</Text>
                      </Center>
                    })
                  }
                </Flex>
              </Flex>
            </Flex>
          </Center>
        </ShowIf>
        <Box as="form" w={"full"} onSubmit={handleFormSubmit(handleSubmit)}>
          <ShowIf value={step === "form"}>
            <Center>
              <Flex
                w={{
                  base: 'full',
                  md: '2xl'
                }}
                boxShadow={"lg"}
                gap={4}
                borderRadius="md"
                direction="column"
              >
                <Flex
                  w="full"
                  bgGradient="linear-gradient(to-r, pink.400, pink.600)"
                  p={4}
                  borderTopRadius="lg"
                  alignItems={"center"}
                >
                  <IconButton icon={<ChevronLeftIcon />} aria-label="Voltar" onClick={() => dispatchStep({ next: 'options' })} isDisabled={isLoading} />
                  <Heading flex={1} textAlign="center" fontSize="lg" color="white">Editar imóvel</Heading>
                </Flex>
                <Flex p={4} direction="column" w="full">
                  <Flex direction="column" gap={2}>
                    <Flex direction="column" gap={2}>
                      <Text>Informações básicas</Text>
                      <FormControl isInvalid={!!errors.address}>
                        <InputGroup>
                          <InputLeftElement>
                            <FaHome />
                          </InputLeftElement>
                          <Input id="endereco" type='text' placeholder='Endereço' {...register('address', {
                            required: true
                          })} />
                          <FormErrorMessage>
                            <Text>
                              {errors.address && errors.address.message}
                            </Text>
                          </FormErrorMessage>
                        </InputGroup>
                      </FormControl>
                      <Flex gap={2}>
                        <FormControl isInvalid={!!errors.modo}>
                          <Select gridArea="modo" defaultValue="false" {...register('modo', {
                            required: true
                          })} required>
                            <option value='aluguel'>Aluguel</option>
                            <option value='compra'>Compra</option>
                            <option value='both'>Ambos</option>
                          </Select>
                          <FormErrorMessage>
                            <Text>
                              {errors.modo && errors.modo.message}
                            </Text>
                          </FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={!!errors.information?.totalArea}>
                          <InputGroup w="fit-content">
                            <InputLeftElement
                              pointerEvents='none'
                            >
                              <FaRuler />
                            </InputLeftElement>
                            <Input textAlign="left" id="metragem" type='number' placeholder='0' {...register('information.totalArea', {
                              required: true,
                              setValueAs: v => v === null ? null : Number(v),
                            })} />
                            <InputRightAddon>m²</InputRightAddon>
                          </InputGroup>
                          <FormErrorMessage>
                            <Text>
                              {errors.information?.totalArea && errors.information?.totalArea?.message}
                            </Text>
                          </FormErrorMessage>
                        </FormControl>
                      </Flex>
                      <Flex justifyContent="space-around" gap={4} wrap={{
                        base: 'wrap',
                        md: 'nowrap'
                      }}>
                        {
                          [{
                            icon: FaBed,
                            text: 'Quartos',
                            id: 'bedrooms'
                          }, {
                            icon: FaShower,
                            text: 'Banheiros',
                            id: 'bathrooms'
                          }, {
                            icon: FaCar,
                            text: 'Vagas',
                            id: 'parkingSlots'
                          }].map(item => {
                            const Icon = item.icon;
                            return <FormControl isInvalid={!!errors.information?.[item.id]} key={item.id}><Center
                              flexDirection="column"
                              gap={1}
                              boxShadow={"md"}
                              p={4}
                              borderRadius="md"
                            >
                              <Flex alignItems="center" gap={2}>
                                <Icon />
                                <Text>{item.text}</Text>
                              </Flex>
                              <Input placeholder="0" {...register('information.'.concat(item.id), {
                                required: true
                              })} textAlign="center" />
                            </Center></FormControl>
                          })
                        }
                      </Flex>
                    </Flex>
                    <Flex direction="column" gap={2}>
                      <Text>Outras informações</Text>
                      <Flex justifyContent={"space-around"} wrap={{
                        base: 'wrap',
                        md: 'nowrap'
                      }} rowGap={4}>
                        {
                          [
                            {
                              icon: FaSubway,
                              label: 'Metro próximo',
                              id: 'information.nearSubway',
                              defaultValue: formValues.information?.nearSubway
                            },
                            {
                              icon: FaDog,
                              label: 'Aceita pets',
                              id: 'information.acceptPets',
                              defaultValue: formValues.information?.acceptPets
                            },
                            {
                              icon: FaCouch,
                              label: 'Mobiliado',
                              id: 'information.isFurnished',
                              defaultValue: formValues.information?.isFurnished
                            },
                          ].map(item => {
                            return <ActivateSecondaryInfoComponent
                              key={item.id}
                              icon={item.icon}
                              label={item.label}
                              defaultValue={item.defaultValue}
                              onChange={value => setValue(item.id, value)}
                            />
                          })
                        }
                      </Flex>
                    </Flex>
                  </Flex>
                  <Button mt={2} colorScheme={"green"} type="submit" isLoading={isLoading} >Salvar</Button>
                  <Flex gap={2}>
                    <Button isDisabled={isLoading} flex={1} mt={2} onClick={() => dispatchStep({ next: 'options' })}>Voltar</Button>
                    <Button isDisabled={isLoading} flex={1} mt={2} colorScheme="purple" variant="outline" onClick={() => dispatchStep({ next: 'description' })}>Editar descrição</Button>
                  </Flex>
                </Flex>
              </Flex>
            </Center>
          </ShowIf>
          <ShowIf value={step === "description"}>
            <Center>
              <Flex
                w={{
                  base: 'full',
                  md: '2xl'
                }}
                boxShadow={"lg"}
                borderRadius="md"
                direction="column"
              >
                <Flex
                  w="full"
                  bgGradient="linear-gradient(to-r, pink.400, pink.600)"
                  p={4}
                  borderTopRadius="lg"
                  alignItems={"center"}
                >
                  <IconButton icon={<ChevronLeftIcon />} aria-label="Voltar" onClick={() => dispatchStep({ next: 'options' })} isDisabled={isLoading} />
                  <Heading flex={1} textAlign="center" fontSize="lg" color="white">Editar imóvel</Heading>
                </Flex>
                <Flex p={4} direction="column" w="full">
                  <Flex direction="column" gap={2}>
                    <Flex direction="column" gap={2}>
                      <Text>Descrição</Text>
                      <FormControl isInvalid={!!errors.information?.description}>
                        <Textarea placeholder='Descrição' w="full" h="sm" {...register(`information.description`)} />
                      </FormControl>
                    </Flex>
                  </Flex>
                  <Button mt={2} colorScheme={"green"} type="submit" isLoading={isLoading} >Salvar</Button>
                  <Flex gap={2}>
                    <Button isDisabled={isLoading} flex={1} mt={2} onClick={() => dispatchStep({ next: 'options' })}>Voltar</Button>
                    <Button isDisabled={isLoading} flex={1} mt={2} colorScheme="purple" variant="outline" onClick={() => dispatchStep({ next: 'photos' })}>Editar fotos</Button>
                  </Flex>
                </Flex>
              </Flex>
            </Center>
          </ShowIf>
          <ShowIf value={step === "pricing"}>
            <Center>
              <Flex
                w={{
                  base: 'full',
                  md: '2xl'
                }}
                boxShadow={"lg"}
                gap={4}
                borderRadius="md"
                direction="column"
              >
                <Flex
                  w="full"
                  bgGradient="linear-gradient(to-r, pink.400, pink.600)"
                  p={4}
                  borderTopRadius="lg"
                  alignItems={"center"}
                >
                  <IconButton icon={<ChevronLeftIcon />} aria-label="Voltar" onClick={() => dispatchStep({ next: 'options' })} isDisabled={isLoading} />
                  <Heading flex={1} textAlign="center" fontSize="lg" color="white">Editar imóvel</Heading>
                </Flex>
                <Flex p={4} direction="column">
                  <Flex direction="column" gap={2}>
                    <Flex direction="column" gap={2}>
                      <Text>Modo</Text>
                      <FormControl isInvalid={!!errors.modo}>
                        <Select gridArea="modo" defaultValue="false" {...register('modo', {
                          required: true
                        })} required>
                          <option value='aluguel'>Aluguel</option>
                          <option value='compra'>Compra</option>
                          <option value='both'>Ambos</option>
                        </Select>
                        <FormErrorMessage>
                          <Text>
                            {errors.modo && errors.modo.message}
                          </Text>
                        </FormErrorMessage>
                      </FormControl>
                      <Text>Informe os custos principais</Text>
                      <Wrap p={{
                        base: 1,
                        md: 4
                      }} rowGap={{
                        base: 1,
                        md: 4
                      }} justify="center">
                        {
                          allCostsTypes.filter(cost => cost.availableIn.includes(modoSelecionado)).map(cost => {
                            return <Center
                              key={cost.name}
                              flexDirection="column"
                              gap={1}
                              boxShadow={"md"}
                              borderRadius="md"
                              p={4}
                            >
                              <Flex alignItems={"center"} gap={2}>
                                <Icon as={FaDollarSign} />
                                <Text>{cost.text}</Text>
                              </Flex>
                              <FormControl isInvalid={!!errors.costs?.[cost.name]}>
                                <InputGroup w={36}>
                                  <InputLeftAddon>R$</InputLeftAddon>
                                  <Input type='number' placeholder='0.00' {...register('costs.'.concat(cost.name), {
                                    setValueAs: v => v === null ? null : Number(v),
                                    required: cost.isRequired
                                  })} />
                                </InputGroup>
                              </FormControl>
                            </Center>
                          })
                        }
                      </Wrap>
                    </Flex>
                  </Flex>
                  <Button mt={2} colorScheme={"green"} type="submit" isLoading={isLoading} >Salvar</Button>
                  <Flex gap={2}>
                    <Button isDisabled={isLoading} flex={1} mt={2} onClick={() => dispatchStep({ next: 'options' })}>Voltar</Button>
                  </Flex>
                </Flex>
              </Flex>
            </Center>
          </ShowIf>
          <ShowIf value={step === "photos"}>
            <Center>
              <Flex
                direction={"column"}
                w={{
                  base: 'full',
                  md: '2xl'
                }}
                boxShadow={"lg"}
                gap={4}
                borderRadius="md"
              >
                <Flex
                  w="full"
                  bgGradient="linear-gradient(to-r, pink.400, pink.600)"
                  p={4}
                  borderTopRadius="lg"
                  alignItems={"center"}
                >
                  <IconButton icon={<ChevronLeftIcon />} aria-label="Voltar" onClick={() => dispatchStep({ next: 'options' })} isDisabled={isLoading} />
                  <Heading flex={1} textAlign="center" fontSize="lg" color="white">Editar imóvel</Heading>
                </Flex>
                <Flex
                  direction="column"
                  p={4}
                >
                  <Flex {...getRootProps()} flex={1} width={"full"}>
                    <input {...getInputProps()} />
                    <Center
                      width={"full"}
                      border="1px"
                      borderColor={"gray.300"}
                      borderStyle="dashed"
                      borderRadius={"md"}
                      padding={"2"}
                      textAlign="center"
                      flexDirection={"column"}
                    >
                      <AttachmentIcon w={6} h={6} />
                      {
                        isDragActive ?
                          <Text>Coloque os arquivos arqui</Text> :
                          <Text>Arraste e solte aqui arquivos<br />ou clique para selecionar</Text>
                      }
                    </Center>
                  </Flex>
                  <Flex
                    maxW="100%"
                    h="2xs"
                    gap={2}
                    p={2}
                    overflowX="scroll"
                    scrollSnapType={"x mandatory"}
                    scrollPadding={4}
                  >
                    {images.map(image => {
                      return <Image
                        key={image.url}
                        alt={image.description || 'Imagem'}
                        src={image.url}
                        boxShadow="md"
                        borderRadius="md"
                        scrollSnapAlign={"start"}
                      />
                    })}
                  </Flex>
                  <Button mt={2} colorScheme={"green"} type="submit" w="full" isLoading={isLoading}>Salvar</Button>
                  <Flex gap={2}>
                    <Button isDisabled={isLoading} flex={1} mt={2} onClick={() => dispatchStep({ next: 'options' })}>Voltar</Button>
                    <Button isDisabled={isLoading} flex={1} mt={2} colorScheme="purple" variant="outline" onClick={() => dispatchStep({ next: 'pricing' })}>Editar preços</Button>
                  </Flex>
                </Flex>
              </Flex>
            </Center>
          </ShowIf>
        </Box>
      </Center>
    </Grid>
  </>
}

const ActivateSecondaryInfoComponent = ({
  onChange,
  defaultValue = false,
  label,
  icon,
}) => {
  const [isActive, setIsActive] = useState(defaultValue);
  const handleChange = useCallback(() => {
    const newState = !isActive;
    setIsActive(newState);
    onChange(newState)
  }, [isActive, onChange])
  return <Center
    flexDirection="column"
    gap={1}
    boxShadow={"md"}
    borderRadius="md"
    p={4}
    border={isActive ? '2px' : '2px'}
    borderColor={isActive ? "green" : 'gray'}
    cursor="pointer"
    onClick={handleChange}
    boxSizing="border-box"
  >
    <Icon as={icon} w={6} h={6} color={isActive ? 'green' : "gray"} />
    <Text userSelect={"none"} color={isActive ? 'green' : "gray"}>{label}</Text>
  </Center>
}

const ShowIf = ({
  value,
  children,
}) => {
  if (value) return <>{children}</>;
  return <></>
}