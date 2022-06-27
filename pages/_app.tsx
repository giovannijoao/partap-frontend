import ThemeProvider from "../contexts/themes/ThemeProvider"

function MyApp({ Component, pageProps }) {
  return <ThemeProvider>
    <Component {...pageProps} />
  </ThemeProvider>
}

export default MyApp
