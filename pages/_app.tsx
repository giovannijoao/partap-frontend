import Head from "next/head"
import { AuthProvider } from "../contexts/AuthContext"
import ThemeProvider from "../contexts/themes/ThemeProvider"

function MyApp({ Component, pageProps }) {
  return <>
    <Head>
    </Head>
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  </>
}

export default MyApp
