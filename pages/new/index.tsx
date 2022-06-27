import { Box, Button, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Image, Input, InputGroup, InputLeftElement, InputRightAddon, Select, Text, Textarea } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { ApiInstance } from "../../services/api";
import { CustomSelectField } from "./styles";
import useSWRImmutable from 'swr/immutable';
import { GetServerSideProps } from "next";

export default function NewPropertyPage(props) {
  const { query } = useRouter()

  console.log(14, query)
  const { data: importData, error } = useSWRImmutable(['/properties-extractor', query.url], url => ApiInstance.get(url, { params: { url: query.url }}));
  const { register, handleSubmit, reset } = useForm({
    defaultValues: importData?.data.data
  })

  async function handleAdd(info) {
    console.log(11, info)
  }

  useEffect(() => {
    console.log(25, importData, error)
    const data = importData?.data.data;
    if (data) {
      console.log('22 Reseting')
      // reset(data);
    }
  }, [reset, importData, error])

  return <>
    <Grid
      templateAreas={`"header"
                  "main"
                  "footer"`}
      gridTemplateRows={'50px min-content 1fr 30px'}
      gridTemplateColumns={'1fr'}
      gap='1'
    >
      <GridItem
        pl='2'
        bgGradient='linear-gradient(to-r, pink.400, pink.600)'
        area={'header'}
        display="flex"
        alignItems="center"
      >
        <Image src="/bx_home.svg" alt="Home" w={8} h={8} />
        <Heading pl='4' fontSize={"medium"} color="whiteAlpha.900">Partap</Heading>
      </GridItem>
      <GridItem px={4}>
        <Heading fontSize="lg">Acompanhar novo imóvel</Heading>
        <Box mt={2}>
          <Flex as="form" gap={2} direction="column" onSubmit={handleSubmit(handleAdd)}>
            <Flex gap={2}>
              <FormControl w={"sm"}>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents='none'
                  >
                    <Image src="/bx_home.svg" alt="Field" />
                  </InputLeftElement>
                  <Input id="endereco" type='text' placeholder='Endereço' {...register('address')} />
                </InputGroup>
              </FormControl>
              <FormControl w={"40"}>
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
            <Flex gap={2}>
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
            <Flex gap={2}>
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
            </Flex>
            <Flex>
              <Textarea placeholder='Descrição' w="lg" />
            </Flex>
            <Button w={"min-content"} mx="auto" type="submit">
              Adicionar
            </Button>
          </Flex>
        </Box>
      </GridItem>
    </Grid>
  </>
}