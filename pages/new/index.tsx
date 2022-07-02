import { Box, Button, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Icon, IconButton, Image, Input, InputGroup, InputLeftAddon, InputLeftElement, InputRightAddon, Menu, MenuButton, MenuItem, MenuList, Select, SimpleGrid, Spinner, Text, Textarea, Wrap } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiInstance } from "../../services/api";
import { CustomSelectField } from "./styles";
import useSWRImmutable from 'swr/immutable';
import { useDropzone } from "react-dropzone";
import { AttachmentIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, DeleteIcon } from "@chakra-ui/icons";
import { IProperty } from "../interfaces/IProperty";
import { AxiosResponse } from "axios";
import Header from "../../components/Header";
import useProperty from "../../lib/useProperty";
import usePropertyExtractor from "../../lib/usePropertyExtractor";
import useUser from "../../lib/useUser";

type IImage = {
  url: string,
  description?: string
}
type ICostType = {
  name: string;
  text: string;
  isPresent?: boolean;
}

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
}]

const ignoreCostsInTotalCost = ["sellPrice"];

const selectFields = [
  {
    id: "information.nearSubway",
    filter: property => property.information.nearSubway,
    icon: "/ic_baseline-subway.svg",
    text: "Metro próximo",
    options: [{
      text: "Sim",
      value: "true"
    }, {
      text: "Não",
      value: "false"
    }],
    defaultValue: "false",
    setValueAs: v => v === "true",
    isPresentByDefault: true,
  },
  {
    id: "information.isFurnished",
    filter: property => property.information.isFurnished,
    icon: "/cil_sofa.svg",
    text: "Mobiliado",
    options: [{
      text: "Sim",
      value: "true"
    }, {
      text: "Não",
      value: "false"
    }],
    defaultValue: "false",
    setValueAs: v => v === "true",
    isPresentByDefault: true,
  },
  {
    id: "information.acceptPets",
    filter: property => property.information.acceptPets,
    icon: "/dashicons_pets.svg",
    text: "Aceita pets",
    options: [{
      text: "Sim",
      value: "true"
    }, {
      text: "Não",
      value: "false"
    }],
    defaultValue: "false",
    setValueAs: v => v === "true",
    isPresentByDefault: true,
  },
]

export default function NewPropertyPage() {
  const { query, push } = useRouter()
  const { user } = useUser({
    redirectTo: "/login"
  })

  const { property, error } = usePropertyExtractor({
    url: query.url as string,
  })
  const [isPosting, setIsPosting] = useState(false);
  const [images, setImages] = useState<IImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>();
  const [costsTypes, setCostsTypes] = useState<ICostType[]>(allCostsTypes);
  const { register, handleSubmit, reset, getValues: getFormValues, setValue: setFieldValue } = useForm({
    defaultValues: property
  })
  const [selectedCustomFields, setSelectedCustomFields] = useState(selectFields.map(selectField => ({
    ...selectField,
    isPresent: selectField.isPresentByDefault || false,
  })));

  const isLoadingImportData = query.url && !property && !error;

  useEffect(() => {
    const data = property;
    if (data) {
      reset(data);
      setCostsTypes(allCostsTypes.map(field => {
        let costs = data.costs || {};
        const isPresent = costs[field.name] || costs[field.name] === 0
        return {
          ...field,
          isPresent
        }
      }))
      if (data.images) {
        setImages(data.images)
        setSelectedImage(0)
      }
      setSelectedCustomFields(selectFields.map(selectField => {
        const isPresent = selectField.filter(property);
        return {
          ...selectField,
          isPresent,
        }
      }))
    }
  }, [reset, property])

  async function handleAdd(info: IProperty) {
    const { modo, ...restInfo } = info;
    const totalCost = allCostsTypes.filter(cost => !ignoreCostsInTotalCost.includes(cost.name)).reduce((a, c) => a + (info.costs && info.costs[c.name] || 0), 0);
    const parsedInfo = {
      ...restInfo,
      isRent: modo === "aluguel",
      isSell: modo === "compra",
      costs: {
        ...restInfo.costs,
        totalCost
      },
      provider: restInfo.provider || "own",
      images,
    }
    setIsPosting(true);
    try {
      await ApiInstance.post(`/properties`, parsedInfo, {
        headers: {
          Authorization: user.token
        }
      });
      push(`/home`);
    } catch (error) {
      console.log("error")
    }
    setIsPosting(false)
  }

  const onDrop = useCallback(async acceptedFiles => {
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('photos', file)
    })
    const result = await ApiInstance.post('/file-upload', formData);
    setImages([...images, ...result.data.map(x => ({
      url: x.location
    }))])
    if (!selectedImage && selectedImage !== 0) setSelectedImage(0)
  }, [selectedImage, images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleImageSelection = useCallback((dir: "left" | "right") => {
    if (dir === "right") {
      setSelectedImage(c => {
        if (c + 1 >= images.length) return 0;
        return c + 1;
      })
    } else {
      setSelectedImage(c => {
        if (c - 1 < 0) return images.length - 1;
        return c - 1;
      })
    }
  }, [images])

  const addCostType = useCallback((typeToAdd) => {
    setCostsTypes(types => types.map(type => {
      if (type.name !== typeToAdd) return type;
      type.isPresent = true;
      return type;
    }))
  }, [])

  const addCustomField = useCallback((id) => {
    setSelectedCustomFields(fields => fields.map(field => {
      if (field.id !== id) return field;
      field.isPresent = true;
      return field;
    }))
  }, [])

  const formValues = getFormValues();
  const presentCostsTypes = costsTypes.filter(field => field.isPresent);
  const missingCostsTypes = costsTypes.filter(field => !field.isPresent);

  const missingCustomFields = selectedCustomFields.filter(field => !field.isPresent);

  const shownCustomSelectFields = useMemo(() => selectedCustomFields.filter(field => field.isPresent).map((customSelectField, i) => <CustomSelectField key={customSelectField.id} gap={1} px={2} display={"flex"} w={{
    base: "full",
    md: "xs"
  }}>
    <Image mx={1} src={customSelectField.icon} alt="Field" />
    <Text flex={1} fontSize={"xs"}>{customSelectField.text}</Text>
    {/* @ts-ignore */}
    <Select defaultValue={customSelectField.defaultValue} m={0.5} width={"24"} height="8" fontSize={"xs"}  {...register(customSelectField.id, { setValueAs: customSelectField.setValueAs })}>
      {customSelectField.options.map(option => <option key={`${customSelectField.id}-${option.value}`} value={option.value}>{option.text}</option>)}
    </Select>
    <DeleteIcon onClick={() => {
      {/* @ts-ignore */ }
      setFieldValue(customSelectField.id, undefined);
      setSelectedCustomFields((fields) => fields.map((field, ii) => {
        if (i !== ii) return field;
        return {
          ...field,
          isPresent: false,
        }
      }))
    }} />
  </CustomSelectField>), [register, selectedCustomFields, setFieldValue])
  return <>
    <Flex
      direction="column"
      gap={2}
      mb={2}
    >
      <Header />
      <Box px={4} >
        <Flex alignItems="center" gap={2} mb={4}>
          <IconButton aria-label="Go back home" onClick={() => push(`/home`)} icon={<ChevronLeftIcon h={8} w={8} />} />
          <Heading fontSize={"2xl"}>Acompanhar novo imóvel</Heading>
        </Flex>
        {isLoadingImportData && <Box>
          <Spinner size="xl" />
          <Text>Importando dados...</Text>
        </Box>}
        {!isLoadingImportData && <Box gap={2}>
          <Flex as="form" direction="column" gap={2} onSubmit={handleSubmit(handleAdd)}>
            <Grid
              gridTemplateAreas={{
                base: `
                  "address address"
                  "modo metragem"
                `,
                md: `"modo address address metragem"`
              }}
              gridTemplateColumns={{
                base: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)"
              }}
              gap={2}
              w={{
                base: "full",
                lg: "2xl"
              }}
             >
              <Select gridArea="modo" defaultValue="false" {...register('modo')} required>
                <option value='aluguel'>Aluguel</option>
                <option value='compra'>Compra</option>
              </Select>
              <FormControl gridArea="address">
                <InputGroup>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/bx_home.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="endereco" type='text' placeholder='Endereço' {...register('address')} required />
                </InputGroup>
              </FormControl>
              <FormControl gridArea="metragem">
                <InputGroup>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/bx_ruler.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="metragem" type='number' placeholder='0' {...register('information.totalArea')} />
                  <InputRightAddon>m²</InputRightAddon>
                </InputGroup>
              </FormControl>
            </Grid>
            <Wrap gap={2} w={{
              base: `full`,
            }} >
              {
                [
                  {
                    icon: "/cil_bed.svg",
                    id: "information.bedrooms",
                    label: "quartos"
                  },
                  {
                    icon: "/cil_shower.svg",
                    id: "information.bathrooms",
                    label: "banheiros"
                  },
                  {
                    icon: "/bxs_car-garage.svg",
                    id: "information.parkingSlots",
                    label: "vagas"
                  },
                ].map(element => <FormControl key={element.id} w={{
                  base: "full",
                  sm: "48",
                }}>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents='none'
                    >
                      <Image src={element.icon} alt="Field" />
                    </InputLeftElement>
                    {/* @ts-ignore */}
                    <Input id={element.id} type='number' placeholder='0' {...register(element.id)} />
                    <InputRightAddon>{element.label}</InputRightAddon>
                  </InputGroup>
                </FormControl>)
              }
            </Wrap>
            <Wrap gap={2} w={{
              base: `full`,
            }} >
              {formValues?.information?.floor && <FormControl w={{
                base: "full",
                md: "xs"
              }}>
                <InputGroup display={"flex"}>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/bi_door-open.svg" alt="Field" />
                  </InputLeftElement>
                  <Input flex={1} id="floor" type='number' placeholder='0' {...register('information.floor')} />
                  <InputRightAddon>andar</InputRightAddon>
                </InputGroup>
              </FormControl>}
              {shownCustomSelectFields}
            </Wrap>
            <Wrap gap={2} w={{
              base: `full`,
              lg: "2xl"
            }}>
              {
                presentCostsTypes.map(costType => {
                  return <InputGroup key={costType.name} w={{
                    base: "full",
                    md: "xs",
                  }}>
                    <InputLeftAddon>R$</InputLeftAddon>
                    {/* @ts-ignore */}
                    <Input type='number' step={".01"} {...register(`costs.${costType.name}`, { setValueAs: (v) => parseFloat(v) })} />
                    <InputRightAddon>{costType.text}</InputRightAddon>
                  </InputGroup>
                })
              }
              <Flex gap={2}>
                {missingCustomFields.length > 0 && <Box>
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      Adicionar campo
                    </MenuButton>
                    <MenuList>
                      {missingCustomFields.map(field => <MenuItem onClick={() => addCustomField(field.id)} key={field.id}>{field.text}</MenuItem>)}
                    </MenuList>
                  </Menu>
                </Box>}
                {missingCostsTypes.length > 0 && <Box>
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      Adicionar custo
                    </MenuButton>
                    <MenuList>
                      {missingCostsTypes.map(field => <MenuItem onClick={() => addCostType(field.name)} key={field.text}>{field.text}</MenuItem>)}
                    </MenuList>
                  </Menu>
                </Box>}
              </Flex>
            </Wrap>
            <Flex>
              <Textarea placeholder='Descrição' w="lg" {...register(`information.description`)} />
            </Flex>
            <Box>
              <Flex gap={2} alignItems="center">
                <Heading fontSize={"md"}>Caixa de fotos</Heading>
                <Box {...getRootProps()} flexShrink={1}>
                  <input {...getInputProps()} />
                  <Box
                    border="1px"
                    borderColor={"gray.300"}
                    borderRadius={"md"}
                    padding={"2"}
                    textAlign="center"
                  >
                    <AttachmentIcon w={6} h={6} />
                    {
                      isDragActive ?
                        <Text>Coloque os arquivos arqui</Text> :
                        <Text>Arraste e solte aqui arquivos<br />ou clique para selecionar</Text>
                    }
                  </Box>
                </Box>
              </Flex>
              {images.length > 0 &&
                <Box
                  alignItems={"center"}
                  border="1px"
                  borderColor={"gray.300"}
                  borderRadius={"md"}
                  padding={"2"}
                  mt={2}
                  maxW={"lg"}
                >
                  <Flex
                    flex={1}
                    alignItems="center"
                    gap={1}
                  >
                    <IconButton aria-label="Previous Image" onClick={() => handleImageSelection(`left`)} icon={<ChevronLeftIcon h={8} w={8} />} />
                    <Box flex={1}>
                      <Image h={64} mx="auto" src={images[selectedImage] ? images[selectedImage].url : ""} alt="Image" />
                    </Box>
                    <IconButton aria-label="Next Image" onClick={() => handleImageSelection(`right`)} icon={<ChevronRightIcon h={8} w={8} />} />
                  </Flex>
                  <Flex
                    mt={2}
                    overflowX={"auto"}
                    gap={1}
                    w="100%"
                  >
                    {images.map((image, i) => <Image onClick={() => setSelectedImage(i)} key={image.url} boxSize="150px" src={image.url} alt={image.description} />)}
                  </Flex>
                </Box>
              }
            </Box>
            <Button colorScheme="purple" isLoading={isPosting} w={"min-content"} mx="auto" type="submit">
              Adicionar
            </Button>
          </Flex>
        </Box>}
      </Box>
    </Flex>
  </>
}