import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import {
  Avatar, Box, Button, Flex, Heading, HStack, Icon, IconButton, Link, Menu,
  MenuButton, MenuItem, MenuList, Stack, useDisclosure
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ReactNode, useMemo } from 'react';
import { FaHome } from 'react-icons/fa';
import usePlanLimits from '../lib/usePlanLimits';
import useUser from '../lib/useUser';
import Notifications from './Notifications';


const NavLink = ({ children, link }: { children: ReactNode, link: {
  href: string,
  title: string,
} }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: 'gray.700',
    }}
    href={link.href}
    color="white"
    >
    {children}
  </Link>
);

export default function HeaderV2() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useUser()
  const { limitsData } = usePlanLimits({});
  const router = useRouter();

  const Links = useMemo(() => {
    const links = [{
      title: 'Dashboard',
      href: '/home'
    }]
    if (limitsData?.data.plan === "free_plan" && !router.pathname.includes('/plans')) {
      links.push({
        href: '/plans/choose',
        title: 'Atualizar plano'
      })
    }
    return links;
  }, [limitsData?.data.plan, router.pathname]);

  return (
    <>
      <Box bgGradient='linear-gradient(to-r, pink.400, pink.600)' px={4} gridArea="header">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Flex  alignItems="center" gap={4}>
              <Icon as={FaHome} color='white' h={6} w={6} />
              <Heading fontSize={"2xl"} color="whiteAlpha.900">PartAp</Heading>
            </Flex>
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link.href} link={link}>{link.title}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
             <Stack direction={'row'} spacing={7}>
              <Notifications />
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    src={
                      `https://ui-avatars.com/api/?name=${user?.name}`
                    }
                  />
                </MenuButton>
                <MenuList>
                  <Link href="/user"><MenuItem>Perfil</MenuItem></Link>
                  {/* <MenuItem>Link 2</MenuItem> */}
                  {/* <MenuDivider /> */}
                  <MenuItem onClick={logout}>Sair</MenuItem>
                </MenuList>
              </Menu>
             </Stack>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.href} link={link}>{link.title}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}