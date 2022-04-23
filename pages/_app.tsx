import type { AppProps } from "next/app"
import { ThemeProvider, CssBaseline, createTheme, ThemeOptions, useMediaQuery } from "@mui/material"
import { deepPurple, teal } from "@mui/material/colors"
import Header from "../components/common/header"
import { Provider } from "react-redux"
import { store } from "../data/store"

const common = {
  typography: {
    htmlFontSize: 18,
  },
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: teal,
    secondary: deepPurple,
  },
  ...common
} as ThemeOptions)

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
  ...common
} as ThemeOptions)

export default function App({ Component, pageProps }: AppProps) {
  return <ThemeProvider theme={useMediaQuery("(prefers-color-scheme: dark)") ? darkTheme : lightTheme}>
    <Provider store={store}>
      <CssBaseline />
      <Header />
      <Component {...pageProps} />
    </Provider>
  </ThemeProvider>
}
