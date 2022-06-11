import { useState } from "react"
import { AppBar, Button, Grid, Stack, SwipeableDrawer, Toolbar } from "@mui/material"
import { useTranslation } from "next-i18next"
import { Settings as SettingsIcon, ContactSupport as SupportIcon, Logout as LogoutIcon } from "@mui/icons-material"

import { useAppSelector } from "../../data/hooks"
import { signOut } from "../../data/slices/moderator"
import { authorizedFetch } from "../../utils/fetcher"
import { useRequestorBase } from "../../utils/requestor"
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

export default function Header() {
  const { t } = useTranslation("common")

  const authorized = useAppSelector(state => state.moderator.authorized)
  const permissions = useAppSelector(state => state.moderator.permissions)

  const { router, dispatch } = useRequestorBase()
  const path: string = router.asPath

  function doSignOut() {
    authorizedFetch("/sign-out/", { method: "post" })
    dispatch(signOut())
    router.push("/signin")
  }

  const [open, setOpen] = useState<boolean>(true)

  return <AppBar position="fixed" enableColorOnDark>
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      hi
    </SwipeableDrawer>
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
              <HeaderItem text="sign in" href="/signin" path={path} />
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
