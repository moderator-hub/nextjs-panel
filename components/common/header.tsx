import { AppBar, Button, Stack, Toolbar } from "@mui/material"
import { useRouter } from "next/router"
import { privileges } from "../../data/static"
import { Link } from "./navigation"

interface HeaderItemProps {
  href: string;
  text: string;
  path?: string;
}

interface HeaderButtonProps {
  text: string;
  disabled?: boolean;
}

function HeaderButton({ text, disabled }: HeaderButtonProps) {
  return <Button disabled={disabled} sx={{ color: "common.white" }}>{text.toUpperCase()}</Button>
}

function HeaderItem({ href, text, path }: HeaderItemProps) {
  return <Link href={href}><HeaderButton text={text} disabled={href === path} /></Link>
}

function AuthorizedHeader() {
  const router = useRouter()
  const path: string = router.asPath

  return <AppBar position="fixed" enableColorOnDark>
    <Toolbar variant="dense">
      <Stack direction="row" sx={{ width: "25%" }}>
        <HeaderItem href="/" path={path} text="home" />
      </Stack>
      <Stack direction="row" sx={{ width: "50%", justifyContent: "center" }}>
        {router.asPath !== "/" && privileges.map((item, key) =>
          <HeaderItem text={item} key={key} href={`/category/${key}`} path={path} />
        )}
      </Stack>
      <Stack direction="row-reverse" sx={{ width: "25%" }}>
        <HeaderItem text="support" href="/support" path={path} />
        <HeaderButton text="log out" />
      </Stack>
    </Toolbar>
  </AppBar>
}

function OutsiderHeader() {
  const router = useRouter()
  const path: string = router.asPath

  return <AppBar position="fixed" enableColorOnDark>
    <Toolbar variant="dense">
      <Stack direction="row-reverse" sx={{ width: "100%" }}>
        <HeaderItem text="support" href="/support" path={path} />
        <HeaderItem text="sign in" href="/signin" path={path} />
      </Stack>
    </Toolbar>
  </AppBar>
}

export default function Header() {
  const loggedIn: boolean = true

  return loggedIn ? <AuthorizedHeader /> : <OutsiderHeader />
}