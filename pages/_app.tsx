import { AuthProvider } from "../contexts/AuthContext"
import ThemeProvider from "../contexts/themes/ThemeProvider"

function MyApp({ Component, pageProps }) {
  return <ThemeProvider>
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  </ThemeProvider>
}

export default MyApp
