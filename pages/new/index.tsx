import { Box, Button, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, InputRightAddon, Select, SimpleGrid, Spinner, Text, Textarea, Wrap } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiInstance } from "../../services/api";
import { CustomSelectField } from "./styles";
import useSWRImmutable from 'swr/immutable';
import { useDropzone } from "react-dropzone";
import { AttachmentIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

type IImage = {
  url: string,
  description?: string
}
export default function NewPropertyPage(props) {
  const { query } = useRouter()

  const { data: importData, error } = useSWRImmutable(query.url ? ['/properties-extractor', query.url] : null, url => ApiInstance.get(url, { params: { url: query.url } }));
  const [images, setImages] = useState<IImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>();
  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: importData?.data.data
  })

  const isLoadingImportData = query.url && !importData && !error;

  useEffect(() => {
    const data = importData?.data?.data;
    if (data) {
      reset(data);
    }
  }, [reset, importData])

  async function handleAdd(info) {
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
        if (c + 1 >= images.length - 1) return 0;
        return c + 1;
      })
    } else {
      setSelectedImage(c => {
        console.log(52, c, c - 1, images.length)
        if (c - 1 < 0) return images.length - 1;
        return c - 1;
      })
    }
  }, [images])

  const formValues = getValues();
  return <>
    <Grid
      templateAreas={`"header"
                  "main"`}
      gridTemplateRows={'4em 1fr'}
      gridTemplateColumns={'1fr'}
      gap='1'
    >
      <GridItem
        pl='4'
        bgGradient='linear-gradient(to-r, pink.400, pink.600)'
        area={'header'}
        display="flex"
        alignItems="center"
      >
        <Image src="/bx_home.svg" alt="Home" w={8} h={8} />
        <Heading pl='4' fontSize={"2xl"} color="whiteAlpha.900">Partap</Heading>
      </GridItem>
      <GridItem px={4} gridArea="main">
        <Heading fontSize="lg">Acompanhar novo imóvel</Heading>
        { isLoadingImportData && <Box mt={2}>
          <Spinner size="xl" />
          <Text>Importando dados...</Text>
          </Box>}
        { !isLoadingImportData && <Box mt={2} gap={2}>
          <Flex as="form" direction="column" gap={2} onSubmit={handleSubmit(handleAdd)}>
            <Flex direction={"row"} gap={2}>
              <FormControl w={{ base: "70%", md: "sm" }}>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/bx_home.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="endereco" type='text' placeholder='Endereço' {...register('address')} />
                </InputGroup>
              </FormControl>
              <FormControl w={{ base: "30%", md: "40" }}>
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
            </Flex>
            <Flex gap={2} direction={{ base: 'row', md: "row" }} >
              <FormControl w={"44"}>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/cil_bed.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="bedrooms" type='number' placeholder='0' {...register('information.bedrooms')} />
                  <InputRightAddon>quartos</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl w={"44"}>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/cil_shower.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="bedrooms" type='number' placeholder='0' {...register('information.bathrooms')} />
                  <InputRightAddon>banheiros</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl w={"36"}>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/bxs_car-garage.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="bedrooms" max="9" type='number' placeholder='0' {...register('information.parkingSlots')} />
                  <InputRightAddon>vagas</InputRightAddon>
                </InputGroup>
              </FormControl>
            </Flex>
            <Wrap gap={2} w="2xl">
              <CustomSelectField gap={1}>
                <Image mx={1} src="/ic_baseline-subway.svg" alt="Field" />
                <Text fontSize={"xs"}>Metro próximo</Text>
                <Select m={0.5} width={"24"} height="8" fontSize={"xs"}  {...register('information.nearSubway', { setValueAs: (v) => Boolean(v) })}>
                  <option value='true'>Sim</option>
                  <option value='false'>Não</option>
                </Select>
              </CustomSelectField>
              <CustomSelectField gap={1}>
                <Image mx={1} src="/cil_sofa.svg" alt="Field" />
                <Text fontSize={"xs"}>Mobiliado</Text>
                <Select m={0.5} width={"24"} height="8" fontSize={"xs"}  {...register('information.isFurnished', { setValueAs: (v) => Boolean(v) })}>
                  <option value='true'>Sim</option>
                  <option value='false'>Não</option>
                </Select>
              </CustomSelectField>
              <CustomSelectField gap={1}>
                <Image mx={1} src="/dashicons_pets.svg" alt="Field" />
                <Text fontSize={"xs"}>Aceita pets</Text>
                <Select m={0.5} width={"24"} height="8" fontSize={"xs"}  {...register('information.acceptPets', { setValueAs: (v) => Boolean(v) })}>
                  <option value='true'>Sim</option>
                  <option value='false'>Não</option>
                </Select>
              </CustomSelectField>
              {formValues?.information?.floor && <FormControl>
                <InputGroup w={40}>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/bi_door-open.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="floor" type='number' placeholder='0' {...register('information.floor')} />
                  <InputRightAddon>andar</InputRightAddon>
                </InputGroup>
              </FormControl>}
            </Wrap>
            <Flex>
              <Textarea placeholder='Descrição' w="lg" />
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
                      <Image h={64} src={images[selectedImage] ? images[selectedImage].url : ""} alt="Image" />
                    </Box>
                    <IconButton aria-label="Next Image" onClick={() => handleImageSelection(`right`)} icon={<ChevronRightIcon h={8} w={8} />} />
                  </Flex>
                  <Flex
                    mt={2}
                    overflowX={"auto"}
                    gap={1}
                  >
                    {images.map(image => <Box key={image.url}>
                      <Image w={32} src={image.url} alt={image.description} />
                    </Box>)}
                  </Flex>
                </Box>
              }
            </Box>
            <Button w={"min-content"} mx="auto" type="submit">
              Adicionar
            </Button>
          </Flex>
        </Box>}
      </GridItem>
    </Grid>
  </>
}