import { AttachmentIcon, ChevronLeftIcon, DeleteIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Button, Center, Checkbox, Flex, FormControl, FormErrorMessage, FormLabel, Grid, Heading, Icon, IconButton, Image, Input, InputGroup, InputLeftAddon, InputLeftElement, InputRightAddon, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Select, Table, TableContainer, Tag, TagLabel, TagLeftIcon, Tbody, Td, Text, Textarea, Th, Thead, Tr, Wrap } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useMemo, useReducer, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { FaBed, FaCar, FaCouch, FaDog, FaDollarSign, FaHome, FaRuler, FaShower, FaSubway } from "react-icons/fa";
import Header from "../components/Header";
import { ImportProviders } from "../importProviders";
import useUser from "../lib/useUser";
import { ApiInstance } from "../services/api";

const supportedImportProviders = ImportProviders;
const formSteps = [
  'import',
  'form',
  'description',
  'pricing',
  'photos',
  'contactInfo'
]

const allCostsTypes = [{
  "name": "rentValue",
  "text": "Aluguel",
  availableIn: ['aluguel', 'both'],
  isRequired: true,
}, {
  "name": "sellPrice",
  "text": "Compra",
  availableIn: ['compra', 'both'],
  isRequired: true,
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

type IForm = {
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
      checked: boolean
      views: string[]
    }
  }>
  contactInfo: {
    description?: string
  }
  url?: string
  [key: string]: any
}

const uniqueID = () => Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))

export default function NewV2() {
  const { user } = useUser({
    redirectTo: '/login'
  });
  const router = useRouter()
  const [importUrl, setImportUrl] = useState("");
  const [importErrorMessage, setImportErrorMessage] = useState('');
  const [step, dispatchStep] = useReducer((state, action: 'next' | 'back' | 'start') => {
    let nextInd;
    if (action === 'next') {
      nextInd = formSteps.indexOf(state) + 1
    } else if (action === "back") {
      nextInd = formSteps.indexOf(state) - 1
    } else if (action === "start") {
      nextInd = 0;
    }
    return formSteps[nextInd]
  }, 'import')
  const [images, setImages] = useState<IImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const formMethods = useForm<IForm>({
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
      costs: [],
      totalCost: []
    }
  })
  const { register, handleSubmit: handleFormSubmit, reset, getValues, setValue, watch, trigger, formState: { errors } } = formMethods;
  const modoSelecionado = watch('modo', 'aluguel');

  const handleImport = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await ApiInstance.get(`/properties-extractor?url=${importUrl}`, {
        headers: {
          Authorization: user.token,
        },
      })
      const propertyData = result.data.data
      let modo;
      if (propertyData.isRent && propertyData.isSell) modo = "both";
      else if (propertyData.isRent) modo = "aluguel";
      else if (propertyData.isSell) modo = "compra";
      propertyData.modo = modo;
      reset(propertyData)
      setImages(propertyData.images)
      dispatchStep('next')
    } catch (error) {
      setImportErrorMessage('Infelizmente não conseguimos importar as informações desse site nesse momento. Por gentileza, crie manualmente.')
    }
    setIsLoading(false)
  }, [importUrl, reset, user?.token])

  const handleSubmit = useCallback(async (values) => {
    const newValues = {
      ...values,
      provider: values.provider || "own",
      images,
      isSell: ['compra', 'both'].includes(values.modo),
      isRent: ['aluguel', 'both'].includes(values.modo),
    }
    setIsLoading(true)
    try {
      await ApiInstance.post(`/properties`, newValues, {
        headers: {
          Authorization: user?.token
        }
      });
      router.replace('/home')
    } catch (error) {
      console.log("error")
    }
    setIsLoading(false)
  }, [images, router, user?.token]);

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

  const handleFormNextButton = useCallback(async () => {
    const formFieldsByStep = {
      form: ['address', 'modo', 'information.totalArea', 'information.bedrooms', 'information.bathrooms', 'information.parkingSlots'],
      pricing: ['costs.rentValue', 'costs.sellPrice']
    }
    const validField = formFieldsByStep[step];
    if (validField) {
      const result = await trigger(formFieldsByStep[step]);
      if (result) dispatchStep('next')
    } else {
      dispatchStep('next')
    }
  }, [step, trigger])

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
        <ShowIf value={step === "import"}>
          <Center>
            <Flex
              direction={"column"}
              w={{
                base: 'full',
                md: 'xl'
              }}
              boxShadow={"lg"}
              gap={4}
              borderRadius="md"
            >
              <Center
                w="full"
                bgGradient="linear-gradient(to-r, pink.400, pink.600)"
                p={4}
                borderTopRadius="lg"
                gap={4}
              >
                <Heading fontSize="lg" color="white">Importar imóvel</Heading>
                <Tag colorScheme={"green"}>BETA</Tag>
              </Center>
              <Flex direction="column" p={4}>
                <Text m={4} textAlign="center">Você pode importar de um site ou, se preferir, criar manualmente.</Text>
                <InputGroup>
                  <InputLeftElement>
                    <ExternalLinkIcon />
                  </InputLeftElement>
                  <Input placeholder='Importar de site' onChange={e => setImportUrl(e.target.value)} />
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
                <Text m={4} textAlign="center" fontSize="xs">Esse é um recurso que ainda está sendo desenvolvido, mas você já pode tentar utilizá-lo.</Text>
                <Flex py={2} alignItems={"center"} gap={2} alignSelf="end">
                  <Button size="xs" onClick={() => dispatchStep('next')} isDisabled={isLoading}>Criar manualmente</Button>
                  <Button colorScheme="green" onClick={handleImport} isDisabled={!importUrl} isLoading={isLoading}>Importar</Button>
                </Flex>
              </Flex>
            </Flex>
          </Center>
        </ShowIf>
        <FormProvider {...formMethods}>
          <Box as="form" w="full" onSubmit={handleFormSubmit(handleSubmit)}>
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
                    <Heading flex={1} textAlign="center" fontSize="lg" color="white">Adicionar imóvel</Heading>
                  </Flex>
                  <Flex p={4} direction="column">
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
                    <Button mt={2} colorScheme={"green"} onClick={handleFormNextButton}>Próximo</Button>
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
                    <IconButton icon={<ChevronLeftIcon />} aria-label="Voltar" onClick={() => dispatchStep('back')} isDisabled={isLoading} />
                    <Heading flex={1} textAlign="center" fontSize="lg" color="white">Adicionar imóvel</Heading>
                  </Flex>
                  <Flex p={4} direction="column">
                    <Flex direction="column" gap={2}>
                      <Flex direction="column" gap={2}>
                        <Text>Descrição</Text>
                        <FormControl isInvalid={!!errors.information?.description}>
                          <Textarea placeholder='Descrição' w="full" h="sm" {...register(`information.description`)} />
                        </FormControl>
                      </Flex>
                    </Flex>
                    <Button mt={2} colorScheme={"green"} onClick={handleFormNextButton}>Próximo</Button>
                    <Flex gap={2}>
                      <Button isDisabled={isLoading} flex={1} mt={2} onClick={() => dispatchStep('back')}>Voltar</Button>
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
                    <IconButton icon={<ChevronLeftIcon />} aria-label="Voltar" onClick={() => dispatchStep('back')} isDisabled={isLoading} />
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
                    <Button mt={2} colorScheme={"green"} onClick={handleFormNextButton}>Próximo</Button>
                    <Flex gap={2}>
                      <Button isDisabled={isLoading} flex={1} mt={2} onClick={() => dispatchStep('back')}>Voltar</Button>
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
                    <IconButton icon={<ChevronLeftIcon />} aria-label="Voltar" onClick={() => dispatchStep('back')} isDisabled={isLoading} />
                    <Heading flex={1} textAlign="center" fontSize="lg" color="white">Adicionar imóvel</Heading>
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
                      {images?.map(image => {
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
                    <Button mt={2} colorScheme={"green"} onClick={handleFormNextButton}>Próximo</Button>
                    <Button mt={2} w="full" onClick={() => dispatchStep('back')} isDisabled={isLoading}>Voltar</Button>
                  </Flex>
                </Flex>
              </Center>
            </ShowIf>
            <ShowIf value={step === "contactInfo"}>
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
                    <Heading flex={1} textAlign="center" fontSize="lg" color="white">Adicionar imóvel</Heading>
                  </Flex>
                  <Flex p={4} direction="column">
                    <Flex direction="column" gap={2}>
                      <Flex direction="column" gap={2}>
                        <Text>Informações de contato/site</Text>
                        <FormControl isInvalid={!!errors.url}>
                          <FormLabel>URL</FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <ExternalLinkIcon />
                            </InputLeftElement>
                            <Input id="url" type='url' placeholder='URL do site' {...register('url')} />
                            <FormErrorMessage>
                              <Text>
                                {errors.url && errors.url.message}
                              </Text>
                            </FormErrorMessage>
                          </InputGroup>
                        </FormControl>
                        <FormControl isInvalid={!!errors.information?.description}>
                          <FormLabel>Informações de contato</FormLabel>
                          <Textarea placeholder='Ex.: números de telefone, endereço imobiliaria, nome corretor e outras informações.' w="full" h={36} {...register(`contactInfo.description`)} />
                        </FormControl>
                      </Flex>
                    </Flex>
                    <Button mt={2} colorScheme={"green"} type="submit" w="full" isLoading={isLoading}>Salvar</Button>
                    <Flex gap={2}>
                      <Button isDisabled={isLoading} flex={1} mt={2} onClick={() => dispatchStep('back')}>Voltar</Button>
                    </Flex>
                  </Flex>
                </Flex>
              </Center>
            </ShowIf>
          </Box>
        </FormProvider>
      </Center>
    </Grid>
  </>
}

const CostsTable = () => {
  const { register, control, formState: { errors } } = useFormContext<IForm>();
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
        value: 0
      })
    }}>Adicionar custo</Button>
  </>
}

const TotalCosts = () => {
  const { register, control, formState: { errors } } = useFormContext<IForm>();
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
        <TotalCostViews i={i} />
        <IconButton icon={<DeleteIcon />} onClick={() => removeCostTotal(i)} aria-label="Deletar" />
      </Flex>
    </Flex>
  }), [errors?.totalCost, fieldsCostsTotal, register, removeCostTotal])
  return <>
    {elements}
    <Button onClick={() => {
      appendCostTotal({
        costId: uniqueID().toString(),
        calc: [],
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

const TotalCostViews = ({
  i,
}) => {
  const { control, watch } = useFormContext();
  const totalCost = watch(`totalCost.${i}`);
  return <Popover>
    <PopoverTrigger>
      <Button size="sm">Mostrar na tela principal</Button>
    </PopoverTrigger>
    <PopoverContent>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader>Visualização</PopoverHeader>
      <PopoverBody>
        <Controller
          control={control}
          name={`totalCost.${i}.showInMainCard.views`}
          render={({
            field: { onChange },
          }) => {
            return <>
              <Flex direction="column">
                {
                  [
                    {
                      modo: 'isRent',
                      text: 'Aluguel'
                    },
                    {
                      modo: 'isSell',
                      text: 'Compra'
                    },
                    {
                      modo: 'isBoth',
                      text: 'Ambos'
                    }
                  ].map(item => {
                    const views = totalCost?.showInMainCard?.views || [];
                    const isSelected = views.includes(item.modo);
                    return <Checkbox key={`view-${i}-${item.modo}`} defaultChecked={isSelected} onChange={(e) => {
                      let newViews: string[];
                      if (!isSelected && e.target.checked) {
                        newViews = [...views, item.modo]
                      } else {
                        newViews = views.filter(id => id !== item.modo)
                      }
                      onChange({
                        target: {
                          value: newViews
                        }
                      })
                    }}>{item.text}</Checkbox>
                  })
                }
              </Flex>
            </>
          }} />
      </PopoverBody>
    </PopoverContent>
  </Popover>
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