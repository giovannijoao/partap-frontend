import Head from "next/head"
import { SWRConfig } from "swr"
import ThemeProvider from "../contexts/themes/ThemeProvider"
function MyApp({ Component, pageProps }) {
  return <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>PartAp</title>
    </Head>
    <SWRConfig value={{ provider: () => new Map() }}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </SWRConfig>
  </>
}

export default MyApp
