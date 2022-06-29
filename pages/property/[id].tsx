import { ChevronLeftIcon } from "@chakra-ui/icons";
import { Box, Flex, Grid, Heading, IconButton } from "@chakra-ui/react"
import { useRouter } from "next/router";
import Header from "../../components/Header"

export default function PropertyPage() {
  const { query, push } = useRouter();
  console.log(8, query)
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