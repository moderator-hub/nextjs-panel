import { useEffect } from "react"
import { Provider } from "react-redux"
import { ThemeProvider, CssBaseline, createTheme, ThemeOptions, useMediaQuery } from "@mui/material"
import { deepPurple, teal } from "@mui/material/colors"
import type { AppProps } from "next/app"
import { appWithTranslation, useTranslation } from "next-i18next"

import { DefaultLoading } from "../components/templates/default-pages"
import Header from "../components/common/header"
import { fail, settings, signIn } from "../data/slices/moderator"
import { store } from "../data/store"
import { useAppSelector } from "../data/hooks"
import { authorizedFetch } from "../utils/fetcher"
import { useRequestorBase } from "../utils/requestor"
import { ModeratorData } from "../utils/other"

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
  const { i18n } = useTranslation()
  const browserThemeDark = useMediaQuery("(prefers-color-scheme: dark)")
  const browserThemeLight = useMediaQuery("(prefers-color-scheme: light)")

  const { router, dispatch } = useRequestorBase()
  const authorized = useAppSelector(state => state.moderator.authorized)
  const mode = useAppSelector(state => state.moderator.mode)

  useEffect(() => {
    if (authorized !== undefined && mode === undefined && browserThemeDark != browserThemeLight) {
      dispatch(settings({ mode: browserThemeDark ? "dark" : "light" }))
    }
  }, [dispatch, authorized, browserThemeDark, browserThemeLight])

  useEffect(() => {
    if (authorized === undefined) {
      authorizedFetch("/my-settings/", { method: "get", })
        .then(response => {
          if (response.status === 200) {
            return response.json().then((data: ModeratorData) => {
              dispatch(signIn(data))
              i18n.changeLanguage(data.locale)
            })
          } else if (response.status === 401 || response.status === 403 || response.status === 422) {
            dispatch(fail())
          } else console.log("Got code", response.status, "for /my-settings/")
        })
    }
  }, [router, dispatch])

  return <ThemeProvider theme={mode === "light" ? lightTheme : darkTheme}>
    <CssBaseline />
    <Header />
    {authorized === undefined
      ? <DefaultLoading />
      : <Component {...pageProps} />
    }
  </ThemeProvider>
}

export default appWithTranslation((props: AppProps) => {
  return <Provider store={store}>
    <AppInner {...props} />
  </Provider>
})
