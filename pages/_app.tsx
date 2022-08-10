import Head from "next/head"
import ThemeProvider from "../contexts/themes/ThemeProvider"
function MyApp({ Component, pageProps }) {
  return <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>PartAp</title>
    </Head>
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  </>
}

export default MyApp
