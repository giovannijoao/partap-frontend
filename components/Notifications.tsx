import { BellIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { chakra, Box, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, Highlight, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, StackDivider, Text, useDisclosure, useHighlight, VStack, Button, Link } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { mutate } from "swr";
import useNotifications from "../lib/useNotifications";
import { ApiInstance } from "../services/api";

const CustomHighlight = ({
  text,
  query,
}) => {
  const chunks = useHighlight({
    text,
    query,
  })
  return <Text>
    {
      chunks.map(({ match, text }) => {
        if (!match) return text;
        return <chakra.span key={Math.random().toString()}
          fontWeight="semibold"
        >{text}</chakra.span>
      })
    }
  </Text>
}
export default function Notifications() {
  const { notifications } = useNotifications({});
  const { isOpen, onOpen, onClose } = useDisclosure()

  const unread = useMemo(() => notifications?.data.filter(n => !n.isRead).length, [notifications]);
  const onClickMarkAllAsRead = useCallback(async () => {
    const read = notifications?.data.map(x => {
      return {
        ...x,
        isRead: true,
        __previous: x.isRead,
      }
    })
    await ApiInstance.put('notifications', {
      notifications: read.filter(x => !x.__previous).map(x => ({
        id: x._id,
        isRead: x.isRead,
      }))
    })
    mutate('/notifications', {
      data: read
    })
  }, [notifications?.data])

  const notificationsElements = useMemo(() => {
    return notifications?.data.map(notification => {
      return <Flex key={notification._id} p={2} w="full" gap={4} alignItems="center">
        <Box w={'12px'} h={'12px'} rounded="full" bg={notification.isRead ? "gray.500" : 'green.500'} />
        <Flex direction='column' flex={1}>
          <CustomHighlight query={notification.metadata.highlight} text={notification.text} />
          <Flex alignItems="center">
            <Text fontSize="xs" flex={1}>{`${new Date(notification.createdAt).toLocaleString()}`}</Text>
            {notification.metadata.propertyId && <Link href={`/property/${notification.metadata.propertyId}`}><Button size="xs" colorScheme="purple">Ver imóvel</Button></Link>}
          </Flex>
        </Flex>
      </Flex>
    });
  }, [notifications])

  return notifications?.data.length > 0 && <>
    <Button
      onClick={onOpen}
      aria-label="Notificações"
      leftIcon={<BellIcon />}
      size="sm"
      colorScheme="purple"
      whiteSpace="break-spaces"
    >
      {unread > 0 && unread}
      {unread > 0 && <chakra.span display={{
        base: 'none',
        md: 'inline',
      }}>{unread === 1 ? ' notificação' : ' notificações'}</chakra.span>}
      {unread === 0 && <chakra.span display={{
        base: 'none',
        md: 'inline',
      }}>Notificações</chakra.span>}
    </Button>
    <Drawer
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      size="sm"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <Flex direction="column">
            <Text>
              Notificações
            </Text>
            <Text color="gray.600" fontSize="sm">
              {
                unread === 0 && 'Todas mensagens lidas'
              }
              {
                unread > 0 && `${unread} não lida${unread > 1 ? 's' : ''}`
              }
            </Text>
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          {unread > 0 && <Flex>
            <Button
              leftIcon={<ViewIcon />}
              size="sm"
              color="gray.500"
              onClick={() => onClickMarkAllAsRead()}
            >
              Marcar como lidas
            </Button>
          </Flex>
          }
          <VStack
            w="full"
            divider={<StackDivider borderColor='gray.200' />}
            spacing={4}
            align='stretch'
            maxH="100%"
            overflow="auto"
          >
            {notificationsElements}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  </>
}