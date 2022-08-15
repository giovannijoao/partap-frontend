import { Badge, Box, Flex, Heading, Image, Input, InputGroup, InputLeftElement, SimpleGrid, Skeleton, Tag, TagLabel, TagLeftIcon, Text } from '@chakra-ui/react';
import { withIronSessionSsr } from 'iron-session/next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaCouch, FaTrain } from 'react-icons/fa';
import HeaderV2 from '../../components/HeaderV2';
import { sessionOptions } from '../../lib/session';
import useProperty from '../../lib/useProperty';
import useUser from '../../lib/useUser';
import useBoards from '../../lib/useBoards';
import { ApiInstance } from '../../services/api';
import { useSWRConfig } from 'swr';
import { FormProvider, useForm } from 'react-hook-form';
import { SearchIcon } from '@chakra-ui/icons';

export const getServerSideProps = withIronSessionSsr(async ({
  req,
  res
}) => {
  if (!req.session.user) {
    return {
      redirect: {
        destination: '/login',
        statusCode: 302,
      }
    }
  }
  try {
    return {
      props: {
        userServerData: req.session.user,
      }, // will be passed to the page component as props
    }
  } catch (error) {
    req.session.destroy();
    return {
      redirect: {
        destination: '/login',
        statusCode: 302,
      }
    }
  }
}, sessionOptions)

export default function OrganizzePage({
  userServerData
}) {
  const { mutate } = useSWRConfig()
  const [filters, setFilters] = useState<any>({
    address: '',
    isAvailable: [true]
  });
  const { boards: boardsData } = useBoards({
    filters
  });

  useUser({
    redirectTo: '/login',
    fallback: userServerData
  })

  const boards = useMemo(() => [{
    name: 'Sem status'
  }, {
    name: 'Gostei'
  }, {
    name: 'Visita'
  }, {
    name: 'Pode ser esse'
  }], [])

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window) {
      setReady(true);
    }
  }, []);

  const filtersFormMethods = useForm({
    defaultValues: {
      address: '',
      isAvailable: [true]
    }
  })

  const watchFilters = filtersFormMethods.watch();
  useEffect(() => {
    const timeout = setTimeout(() => setFilters(watchFilters), 500)
    return () => clearTimeout(timeout)
  }, [watchFilters])

  const parsedBoards = useMemo(() => {
    return boards.map(board => {
      return {
        name: board.name,
        items: boardsData?.data.find(b => {
          return (b._id || 'Sem status') === board.name
        })?.cards || []
      }
    })
  }, [boards, boardsData]);

  const onDragEnd = useCallback(async (re) => {
    if (!re.destination) return;
    let newBoardData = parsedBoards;

    // const sourceBoard = parsedBoards[parseInt(re.source.droppableId)];
    const targetBoard = parsedBoards[parseInt(re.destination.droppableId)];
    const dragItem =
    newBoardData[parseInt(re.source.droppableId)].items[re.source.index];
    newBoardData[parseInt(re.source.droppableId)].items.splice(
      re.source.index,
      1
    );
    newBoardData[parseInt(re.destination.droppableId)].items.splice(
      re.destination.index,
      0,
      dragItem
      );
    await ApiInstance.put(`/properties/${dragItem.id}`, {
      board: {
        id: targetBoard.name,
        index: re.destination.index
      }
    })
    mutate(['/boards', {
      isAvailable: true,
      address: ''
    }], null, {
      populateCache: true
    })
  }, [parsedBoards, mutate]);

  return <Flex direction="column" h="100vh">
    <HeaderV2 />
    <Flex h={"calc(100vh - 80px)"} direction="column">
      <FormProvider {...filtersFormMethods}>
        <Flex w="xs" ml={4} mt={2}>
          <InputGroup>
            <InputLeftElement
              pointerEvents='none'
            >
              <SearchIcon color='gray.300' />
            </InputLeftElement>
            <Input type='endereco' placeholder='Endereço' {...filtersFormMethods.register('address')} />
          </InputGroup>
        </Flex>
      </FormProvider>
      {ready && <DragDropContext onDragEnd={onDragEnd}>
        <Flex
          p={4}
          gap={2}
          flex={1}
          h="100%"
          w='auto'
          overflowX="auto"
          scrollSnapType={"x mandatory"}
          scrollPadding={4}
        >
          {parsedBoards.map((board, bIndex) => {
            return <Box key={board.name} flex={1}>
              <Droppable droppableId={bIndex.toString()}>
                {(provided, snapshot) => (
                  <Flex
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    direction="column"
                    rounded="md"
                    shadow="md"
                    bg={snapshot.isDraggingOver ? 'green.100' : 'gray.100'}
                    p={3}
                    gap={2}
                    flex={1}
                    minW="xs"
                    height={"100%"}
                    scrollSnapAlign={"start"}
                  >
                    <Heading fontSize={'lg'}>{board.name}</Heading>
                    <Flex
                      direction="column"
                      overflowX="hidden"
                      overflowY="auto"
                      maxH="100%"
                      gap={3}
                    >
                      {board.items.length > 0 &&
                        board.items.map((item, iIndex) => {
                          return (
                            <CardItem
                              key={item.id}
                              data={item}
                              index={iIndex}
                            />
                          );
                        })}
                      {provided.placeholder}
                    </Flex>
                  </Flex>
                )}
              </Droppable>
            </Box>
          })}
        </Flex>
      </DragDropContext>}
    </Flex>
  </Flex>
}

const CardItem = ({
  data, index
}) => {
  const { property } = useProperty({
    propertyId: data.id,
  });
  const totalCost = property?.totalCost.map(cost => {
    const value = property?.costs?.filter(c => cost.calc?.includes(c.costId)).reduce((a, c) => a + c.value, 0);
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
  const costsElements = [];
  if (totalCost) costsElements.push(...totalCost.map(totalCost => {
    return <Text key={totalCost.id} fontWeight="bold" color="green" fontSize={"xs"}>{totalCost.text} {totalCost.value}</Text>
  }))
  // if (filtersRef.current?.exposedCostsFilter.length > 0) {
  //   const fields = Array.from(new Set(filtersRef.current.exposedCostsFilter.filter(f => f.field.includes('costs||')).map(x => x.field))).map((f: string) => {
  //     const [property, field] = f.split('||');
  //     const cost = item[property].find(x => x.text === field);
  //     return <Text key={item._id.concat(field)} color="green" fontSize={"xs"}>{field} {cost?.value}</Text>
  //   })
  //   costsElements.push(...fields);
  // }
  return <Draggable index={index} draggableId={data.id.toString()}>
    {(provided) => (
      <Box
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        bg="white"
        rounded="md"
        mt={0}
      >
        <Skeleton isLoaded={!!property}>
          {property?.images && property.images[0] && <Box width="100%" height={36} position="relative">
            <Image src={property.images[0].url}
              alt="Image"
              width="100%"
              height="100%"
              borderTopRadius="md"
              fit={"cover"}
            />
            <Flex position="absolute" bottom={1} left={1} gap={1}>
              {property.information.nearSubway && <Tag size={"md"} variant='subtle' colorScheme='cyan' >
                <TagLeftIcon boxSize='12px' as={FaTrain} />
                <TagLabel>Metro próx.</TagLabel>
              </Tag>}
              {property.information.isFurnished && <Tag size={"md"} variant='subtle' colorScheme='orange' >
                <TagLeftIcon boxSize='12px' as={FaCouch} />
                <TagLabel>Mobiliado</TagLabel>
              </Tag>}
              {!property.isAvailable &&
                <Badge ml={1} textTransform={"none"} colorScheme="red">Indisponível</Badge>
              }
            </Flex>
          </Box>}
          <Flex p={3} direction="column">
            <Heading fontSize="md">{property?.address}</Heading>
            <Flex mt={1} alignItems="center">
              <Flex>
                {property?.information.totalArea &&
                  <Badge textTransform={"none"}>{property?.information.totalArea}m²</Badge>
                }
                {property?.information.bedrooms &&
                  <Badge ml={1} textTransform={"none"}>{property?.information.bedrooms} {property?.information.bedrooms > 1 ? "quartos" : "quarto"}</Badge>
                }
              </Flex>
              <Flex direction="column" flex={1} alignItems="end">
                {
                  costsElements
                }
              </Flex>
            </Flex>
          </Flex>
        </Skeleton>
      </Box>
    )}
  </Draggable >
}