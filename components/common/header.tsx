import { AppBar, Button, Stack, Toolbar } from "@mui/material"
import { useRouter } from "next/router"
import { useAppSelector } from "../../data/hooks";
import { privileges } from "../../data/static"
import { Link } from "./navigation"

interface HeaderButtonProps {
  text: string;
  selected?: boolean;
}

interface HeaderItemProps {
  href: string;
  text: string;
  path?: string;
  selected?: boolean;
}

function HeaderButton({ text, selected }: HeaderButtonProps) {
  return <Button sx={{ color: selected ? "secondary.main" : "common.white" }}>{text.toUpperCase()}</Button>
}

function HeaderItem({ href, text, path, selected }: HeaderItemProps) {
  return <Link href={href}>
    <HeaderButton
      text={text}
      selected={selected === undefined ? href === path : selected}
    />
  </Link>
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
          <HeaderItem
            text={item}
            key={key}
            path={path}
            href={`/categories/${key}`}
            selected={path.startsWith(`/categories/${key}`)}
          />
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
  const authorized = useAppSelector(state => state.moderator.authorized)

  return authorized ? <AuthorizedHeader /> : <OutsiderHeader />
}
