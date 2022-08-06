import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Center, Flex, Grid, Heading, Link, Tag, TagLabel, TagLeftIcon, Text, Wrap, Button, Highlight } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import Header from "../../components/Header";
import { ImportProviders } from "../../importProviders";
import useLocalStorage from "../../lib/useLocalStorage";

export default function StartPage() {
  const router = useRouter();
  const [, setHasCompletedStart] = useLocalStorage('partap-has-completed-start', false);

  const handleNext = useCallback(() => {
    router.push('/home')
    setHasCompletedStart(true)
  }, [router, setHasCompletedStart])

  return <Grid
    h="100vh"
    w="100vw"
    gap={2}
    templateAreas={`
      "header"
      "body"
    `}
    templateRows="auto 1fr"
    templateColumns="1fr"
  >
    <Header />
    <Center
      h="100%"
      gridArea="body"
      p={4}
    >
      <Flex
        direction="column"
        boxShadow={"lg"}
        maxW="lg"
        textAlign={'center'}
        borderRadius="md"
      >
        <Center
          bgGradient="linear-gradient(to-r, pink.400, pink.600)"
          p={4}
          borderTopRadius="lg"
          color="white"
        >
          <Heading w="lg">Vamos começar!</Heading>
        </Center>
        <Flex direction="column"
          gap={4}
          p={4}>
          <Text lineHeight={2}>
            <Highlight query="organização" styles={{ px: '1', py: '1', bg: 'orange.100' }}>Essa é uma ferramenta de organização. Não é possível anunciar ou buscar imóveis diretamente por aqui.</Highlight>
          </Text>
          <Text lineHeight={2}>
            <Highlight query={["organizar", 'ferramenta centralizadora']} styles={{ px: '1', py: '1', bg: 'orange.100' }}>
              Por aqui você consegue organizar os imóveis que você busca em sites externos, como uma ferramenta centralizadora, uma versão evoluida do seu bloco de notas.
            </Highlight>
          </Text>
          <Flex direction="column" alignItems="center" gap={2}>
            <Text>Atualmente possuimos integração com:</Text>
            <Wrap mt={2}>
              {
                ImportProviders.map(provider => <Link key={provider.name} target="_blank" rel="noopener noreferrer" href={provider.url}>
                  <Tag>
                    <TagLeftIcon boxSize='12px' as={ExternalLinkIcon} />
                    <TagLabel>{provider.name}</TagLabel>
                  </Tag>
                </Link>)
              }
            </Wrap>
            <Text>A integração permite que você importe automaticamente os imóveis desses sites atráves da URL</Text>
          </Flex>
          <Button onClick={handleNext}>Prosseguir</Button>
        </Flex>
      </Flex>
    </Center>
  </Grid>
}