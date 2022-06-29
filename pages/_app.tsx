import Head from "next/head"
import ThemeProvider from "../contexts/themes/ThemeProvider"

function MyApp({ Component, pageProps }) {
  return <>
    <Head>
    </Head>
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  </>
}

export default MyApp
