import { AppBar, Button, Stack, Toolbar } from "@mui/material"
import { useRouter } from "next/router"
import { privileges } from "../../data/static"

export default function Header() {
  const router = useRouter()
  console.log(router.asPath)
  
  return <AppBar position="fixed" enableColorOnDark>
  <Toolbar variant="dense">
    <Stack direction="row" sx={{ width: "25%" }}>
      <Button color="inherit">HOME</Button>
    </Stack>
    <Stack direction="row" sx={{ width: "50%", justifyContent: "center" }}>
      {privileges.map((item, key) => <Button key={key} color="inherit">{item}</Button>)}
    </Stack>
    <Stack direction="row-reverse" sx={{ width: "25%" }}>
      <Button color="inherit">SUPPORT</Button>
      <Button color="inherit">LOG OUT</Button>
    </Stack>
  </Toolbar>
</AppBar>
}