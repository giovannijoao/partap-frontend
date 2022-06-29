import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Flex, Grid, Heading, IconButton } from "@chakra-ui/react"
import { useRouter } from "next/router";
import Header from "../../components/Header"
import useProperty from "../../lib/useProperty";
import useUser from "../../lib/useUser";

export default function PropertyPage() {
  const { query, push } = useRouter();
  const {logout} = useUser({
    redirectTo: `/login`
  })

  const propertyId = query.id as string;
  const property = useProperty({
    propertyId
  });

  if (Array.isArray(query.id)) {
    logout();
    return <></>
  }

  console.log(24, property)

  return <>
    <Flex gap={2} direction="column" height={"100vh"}>
      <Header />
      <Box px={4}>
        <Flex alignItems="center" gap={2} mb={4}>
          <IconButton aria-label="Go back home" onClick={() => push(`/home`)} icon={<ChevronLeftIcon h={8} w={8} />} />
          <Heading fontSize={"2xl"}>Acompanhar novo imóvel</Heading>
        </Flex>
      </Box>
    </Flex>
  </>;
}
