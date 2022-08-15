import { ChevronRightIcon, HamburgerIcon, SearchIcon } from '@chakra-ui/icons';
import { Badge, Box, Button, Divider, Flex, Heading, IconButton, Image, Input, InputGroup, InputLeftElement, Link, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Skeleton, Tag, TagLabel, TagLeftIcon, Text, useToast } from '@chakra-ui/react';
import { withIronSessionSsr } from 'iron-session/next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FormProvider, useForm } from 'react-hook-form';
import { FaCouch, FaTrain } from 'react-icons/fa';
import { useSWRConfig } from 'swr';
import HeaderV2 from '../../components/HeaderV2';
import { sessionOptions } from '../../lib/session';
import useBoards from '../../lib/useBoards';
import useProperty from '../../lib/useProperty';
import useUser from '../../lib/useUser';
import { ApiInstance } from '../../services/api';

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
          console.log(98, b);
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
        id: targetBoard.name === "Sem status" ? null : targetBoard.name,
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

  const mutateBoard = useCallback(() => {
    mutate(['/boards', filters])
  }, [mutate, filters]);

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
                              mutateBoard={mutateBoard}
                              boards={boards}
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
  data, index,
  mutateBoard, boards
}) => {
  const toast = useToast();
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

  const markAsUnavailable = useCallback(async () => {
    try {
      await ApiInstance.put(`/properties/${property?._id}`, {
        isAvailable: false
      });
      toast({
        title: 'Imóvel marcado como indisponível',
        description: 'Agora você poderá ver ele apenas na página de dashboard'
      })
      mutateBoard()
    } catch (error) {
      console.log("error")
    }
  }, [mutateBoard, property?._id, toast])

  const updateBoard = useCallback(async (board) => {
    try {
      await ApiInstance.put(`/properties/${property?._id}`, {
        board: {
          id: board,
          index: property?.board.index
        }
      });
      mutateBoard()
    } catch (error) {
      console.log("error")
    }
  }, [mutateBoard, property?._id, property?.board.index])

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
            <Popover
              variant="responsive"
              strategy="fixed"
            >
              <PopoverTrigger>
                <Flex position="absolute" top={1} right={1}>
                  <IconButton
                    size={"xs"}
                    aria-label='Ações'
                    icon={<HamburgerIcon />}
                    opacity={0.5}
                    _hover={{
                      opacity: 1
                    }}
                  />
                </Flex>
              </PopoverTrigger>
              <PopoverContent w="fit-content">
                <PopoverArrow />
                <PopoverBody>
                  <Flex direction="column" gap={2}>
                    {boards.filter(board => board.name !== (property?.board?.id || 'Sem status')).map(board => {
                      return <Button
                        key={`${property?._id}-${board.name}-action-button`}
                        size="xs"
                        leftIcon={<ChevronRightIcon />}
                        onClick={() => updateBoard(board.name)}
                      >{board.name}</Button>
                    })}
                    <Divider />
                    <Button size="xs" onClick={markAsUnavailable} colorScheme="red" variant="outline">Marcar como indisponível</Button>
                  </Flex>
                </PopoverBody>
              </PopoverContent>
            </Popover>
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
            <Link href={`/property/${property?._id}`}><Heading fontSize="md">{property?.address}</Heading></Link>
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