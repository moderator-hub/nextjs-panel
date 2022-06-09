import { useEffect } from "react"
import { Provider } from "react-redux"
import { ThemeProvider, CssBaseline, createTheme, ThemeOptions, useMediaQuery } from "@mui/material"
import { deepPurple, teal } from "@mui/material/colors"
import type { AppProps } from "next/app"

import { DefaultLoading } from "../components/templates/default-pages"
import Header from "../components/common/header"
import { fail, signIn } from "../data/slices/moderator"
import { store } from "../data/store"
import { useAppSelector } from "../data/hooks"
import { authorizedFetch } from "../utils/fetcher"
import { useRequestorBase } from "../utils/requestor"

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

function AppInner({ Component, pageProps }: AppProps) {
  const { router, dispatch } = useRequestorBase()
  const authorized = useAppSelector(state => state.moderator.authorized)

  useEffect(() => {
    if (authorized === undefined) {
      authorizedFetch("/my-permissions/", { method: "get", })
        .then(response => {
          if (response.status === 200) {
            response.json().then(permissions => dispatch(signIn(permissions)))
          } else if (response.status === 401 || response.status === 403 || response.status === 422) {
            dispatch(fail())
          } else console.log("Got code", response.status, "for /my-permissions/")
        })
    }
  }, [router, dispatch, authorized])

  if (authorized === undefined) return <DefaultLoading />

  return <>
    <Header />
    <Component {...pageProps} />
  </>
}

export default function App(props: AppProps) {
  return <ThemeProvider theme={useMediaQuery("(prefers-color-scheme: dark)") ? darkTheme : lightTheme}>
    <Provider store={store}>
      <CssBaseline />
      <AppInner {...props} />
    </Provider>
  </ThemeProvider>
}
