import { Box, Button, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Image, Input, InputGroup, InputLeftElement, InputRightAddon, Select, SimpleGrid, Text, Textarea, Wrap } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiInstance } from "../../services/api";
import { CustomSelectField } from "./styles";
import useSWRImmutable from 'swr/immutable';
import { useDropzone } from "react-dropzone";

export default function NewPropertyPage(props) {
  const { query } = useRouter()

  const { data: importData, error } = useSWRImmutable(query.url ? ['/properties-extractor', query.url] : null, url => ApiInstance.get(url, { params: { url: query.url }}));
  const [images, setImages] = useState<{
    url: string,
    description?: string
  }[]>([]);
  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: importData?.data.data
  })

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
    setImages((x) => [...x, ...result.data.map(x => ({
      url: x.location
    }))])
  }, [])

  console.log(44, images)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

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
        <Box mt={2} gap={2}>
          <Flex as="form" direction="column" gap={2} onSubmit={handleSubmit(handleAdd)}>
            <Flex direction={"row"} gap={2}>
              <FormControl w={{base: "70%", md: "sm"}}>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/bx_home.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="endereco" type='text' placeholder='Endereço' {...register('address')} />
                </InputGroup>
              </FormControl>
              <FormControl w={{base: "30%", md: "40"}}>
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
            <Flex gap={2} direction={{base: 'row', md: "row"}} >
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
                <Select m={0.5} width={"24"} height="8" fontSize={"xs"}  {...register('information.nearSubway', { setValueAs: (v) => Boolean(v)})}>
                  <option value='true'>Sim</option>
                  <option value='false'>Não</option>
                </Select>
              </CustomSelectField>
              <CustomSelectField gap={1}>
                <Image mx={1} src="/cil_sofa.svg" alt="Field" />
                <Text fontSize={"xs"}>Mobiliado</Text>
                <Select m={0.5} width={"24"} height="8" fontSize={"xs"}  {...register('information.isFurnished', { setValueAs: (v) => Boolean(v)})}>
                  <option value='true'>Sim</option>
                  <option value='false'>Não</option>
                </Select>
              </CustomSelectField>
              <CustomSelectField gap={1}>
                <Image mx={1} src="/dashicons_pets.svg" alt="Field" />
                <Text fontSize={"xs"}>Aceita pets</Text>
                <Select m={0.5} width={"24"} height="8" fontSize={"xs"}  {...register('information.acceptPets', { setValueAs: (v) => Boolean(v)})}>
                  <option value='true'>Sim</option>
                  <option value='false'>Não</option>
                </Select>
              </CustomSelectField>
              { formValues?.information?.floor && <FormControl>
                <InputGroup w={40}>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/bi_door-open.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="floor" type='number' placeholder='0' {...register('information.floor')} />
                  <InputRightAddon>andar</InputRightAddon>
                </InputGroup>
              </FormControl> }
            </Wrap>
            <Flex>
              <Textarea placeholder='Descrição' w="lg" />
            </Flex>
            <Box>
              <Heading fontSize={"md"}>Caixa de fotos</Heading>
              <Flex mt={1} height={40} >
                <Box w="32" {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Box
                    border="1px"
                    borderColor={"gray.300"}
                    borderRadius={"md"}
                    padding={"2"}
                    textAlign="center"
                  >
                    {
                      isDragActive ?
                        <Text>Coloque os arquivos arqui</Text> :
                        <Text>Arraste e solte aqui arquivos<br />ou clique para selecionar</Text>
                    }
                  </Box>
                </Box>
                <Flex w="md" border="1px"
                  borderColor={"gray.300"}
                  borderRadius={"md"}
                  padding={"2"}
                  width="full"
                  height={"100%"}
                  ml={2}
                  gap={2}
                  overflowX="auto"
                  >
                  {images.map(image => <Image borderRadius={4} key={image.url} src={image.url} alt={image.description} />)}
                </Flex>
              </Flex>

            </Box>
            <Button w={"min-content"} mx="auto" type="submit">
              Adicionar
            </Button>
          </Flex>
        </Box>
      </GridItem>
    </Grid>
  </>
}