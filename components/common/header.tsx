import { ReactNode, useEffect, useState } from "react"
import { AppBar, Button, ButtonGroup, Divider, Grid, ListItemIcon, ListItemText, MenuItem, MenuItemProps, Stack, SwipeableDrawer, Toolbar, Typography } from "@mui/material"
import { useTranslation } from "next-i18next"
import { Settings as SettingsIcon, ContactSupport as SupportIcon, Logout as LogoutIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon, SvgIconComponent } from "@mui/icons-material"

import { useAppSelector } from "../../data/hooks"
import { signOut, settings } from "../../data/slices/moderator"
import { languages } from "../../data/static"
import { authorizedFetch } from "../../utils/fetcher"
import { useRequestor, useRequestorBase } from "../../utils/requestor"
import { Link } from "./navigation"
import { TooltipIconButton } from "./library"

interface HeaderButtonProps {
  text: string
  selected?: boolean
  onClick?: any
}

interface HeaderItemProps {
  href: string
  text: string
  path?: string
  selected?: boolean
}

function HeaderButton({ text, selected, onClick }: HeaderButtonProps) {
  return <Button sx={{ color: selected ? "secondary.main" : "common.white" }} onClick={onClick}>{text.toUpperCase()}</Button>
}

function HeaderItem({ href, text, path, selected }: HeaderItemProps) {
  const { t } = useTranslation("common")
  return <Link href={href}>
    <HeaderButton
      text={t(text)}
      selected={selected === undefined ? href === path : selected}
    />
  </Link>
}

interface DrawerItemProps extends MenuItemProps {
  text: string
  Icon: SvgIconComponent
}

function DrawerItem({ text, Icon, ...other }: DrawerItemProps) {
  return <MenuItem {...other}>
    <ListItemIcon>
      <Icon fontSize="small" />
    </ListItemIcon>
    <ListItemText>
      {text}
    </ListItemText>
  </MenuItem>
}

interface SettingsBlockProps {
  title: string
  children: ReactNode
}

function SettingsBlock({ title, children }: SettingsBlockProps) {
  return <>
    <Divider sx={{ mx: -2, mt: 3 }} />
    <Typography variant="button" sx={{ pb: 1, pt: 2 }}>
      {title}
    </Typography>
    {children}
  </>
}

interface SettingsDrawerProps {
  open: boolean
  setOpen: (v: boolean) => void
}

function SettingsDrawer({ open, setOpen }: SettingsDrawerProps) {
  const { t } = useTranslation("common")
  const { authorized, router, dispatch, protectedRequest } = useRequestor()
  const mode = useAppSelector(state => state.moderator.mode)

  const [serverMode, setServerMode] = useState(mode)
  const [serverLocale, setServerLocale] = useState(router.locale)

  function switchMode(mode: string): void {
    dispatch(settings({ mode }))
  }

  function saveLocalStorage() {
    setServerMode(mode)
    setServerLocale(router.locale)
    window.localStorage.setItem("mub-interface-mode", mode || "dark")
  }

  function saveAndClose(close: boolean, localeChanged: boolean) {
    return (onSuccess?: () => void) => {
      const changed = serverMode !== mode || localeChanged
      if (authorized && changed) {
        protectedRequest({
          path: "/my-settings/",
          body: {
            mode: mode === serverMode ? undefined : mode,
            locale: localeChanged ? router.locale : undefined
          },
          request: { method: "post" },
          setState: ({ code }) => {
            if (code === 200) {
              saveLocalStorage()
              if (close) setOpen(false)
              if (onSuccess) onSuccess()
            }
          }
        })
      } else {
        if (changed) saveLocalStorage()
        if (close) setOpen(false)
        if (onSuccess) onSuccess()
      }
    }
  }
  useEffect(() => saveAndClose(false, false))

  function switchLocale(locale: string): void {
    if (locale !== router.locale) {
      saveAndClose(false, true)(() => {
        dispatch(settings({ locale }))
        window.localStorage.setItem("mub-interface-locale", locale || "en")
        router.push(router.asPath, router.asPath, { locale })
      })
    }
  }

  return <SwipeableDrawer
    anchor="right"
    open={open}
    onClose={() => saveAndClose(true, false)()}
    onOpen={() => setOpen(true)}
  >
    <Stack
      sx={{ width: 300, px: 2 }}
      direction="column"
    >
      <Typography variant="h5" sx={{ pt: 2 }}>
        Settings
      </Typography>
      <SettingsBlock title={t("settings-block-mode")}>
        <ButtonGroup variant="outlined" fullWidth>
          {[
            { text: "light", Icon: LightModeIcon },
            { text: "dark", Icon: DarkModeIcon }
          ].map(({ text, Icon }, key) => (
            <Button
              key={key}
              startIcon={<Icon />}
              sx={{ textTransform: "none" }}
              onClick={() => switchMode(text)}
              variant={text === mode ? "contained" : "outlined"}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {t("settings-" + text + "-mode")}
              </Typography>
            </Button>
          ))}
        </ButtonGroup>
      </SettingsBlock>
      <SettingsBlock title={t("settings-block-language")}>
        <ButtonGroup variant="outlined" fullWidth orientation="vertical">
          {languages.map(({ name, locale }, key) => (
            <Button
              key={key}
              sx={{ textTransform: "none" }}
              onClick={() => switchLocale(locale)}
              variant={locale === router.locale ? "contained" : "outlined"}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {name}
              </Typography>
            </Button>
          ))}
        </ButtonGroup>
      </SettingsBlock>
    </Stack>
  </SwipeableDrawer>
}

export default function Header() {
  const { t } = useTranslation("common")

  const { router, dispatch } = useRequestorBase()
  const path: string = router.asPath

  const authorized = useAppSelector(state => state.moderator.authorized)
  const permissions = useAppSelector(state => state.moderator.permissions)

  function doSignOut() {
    authorizedFetch("/sign-out/", { method: "post" })
    dispatch(signOut())
    router.push("/signin")
  }

  const [open, setOpen] = useState<boolean>(false)

  return <AppBar position="fixed" enableColorOnDark>
    <SettingsDrawer open={open} setOpen={setOpen} />
    <Toolbar variant="dense">
      <Grid
        container
        direction="row"
        width="100%"
      >
        {authorized
          ? <>
            <Grid item xs={2}>
              <HeaderItem href="/" path={path} text="header-home" />
            </Grid>
            <Grid item xs>
              <Stack direction="row" sx={{ width: "100%", justifyContent: "center" }}>
                {router.asPath !== "/" && permissions?.map((item, key) =>
                  <HeaderItem
                    text={item.name}
                    key={key}
                    path={path}
                    href={`/categories/${item.name.replace(" ", "-")}`}
                    selected={path.startsWith(`/categories/${item.name.replace(" ", "-")}`)}
                  />
                )}
              </Stack>
            </Grid>
          </>
          : <Grid item xs>
            <Stack direction="row" sx={{ width: "100%" }}>
              <HeaderItem text="header-signin" href="/signin" path={path} />
            </Stack>
          </Grid>
        }
        <Grid item xs={2}>
          <Stack direction="row-reverse">
            <TooltipIconButton
              sx={{ ml: 0.5 }}
              Icon={SettingsIcon}
              title={t("header-tooltip-settings")}
              onClick={() => setOpen(!open)}
            />
            <Link href="/support">
              <TooltipIconButton
                sx={{ ml: 0.5, color: path === "/support" ? "secondary.main" : "common.white" }}
                Icon={SupportIcon}
                title={t("header-tooltip-support")}
              />
            </Link>
            {authorized && <TooltipIconButton
              Icon={LogoutIcon}
              title={t("header-tooltip-signout")}
              onClick={doSignOut}
            />}
          </Stack>
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
}
