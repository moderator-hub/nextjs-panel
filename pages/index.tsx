import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material"

import BasicPage from "../components/templates/page-template"
import { useWindowState } from "../components/utils/effects"
import { privileges } from "../data/static"


export default function Home() {
  const height = useWindowState()[1]

  // TODO scrollbar's showing up on vertical resize

  return <BasicPage style={{ overflow: "hidden" }}>
    <Box sx={{ display: "flex", alignContent: "center", justifyContent: "center", height: height }}>
      <Stack sx={{ maxWidth: 900, width: "100%", m: "auto", textAlign: "center" }} direction="column">
        <Typography variant="h1">
          Welcome!
        </Typography>
        <Typography variant="h3">
          What's next?
        </Typography>
        <Container sx={{ justifyContent: "space-between", mt: 1 }}>
          {privileges.map((item, key) => <Button key={key} variant="contained" sx={{ width: 170, mx: 2, my: 1 }}>{item}</Button>)}
        </Container>
      </Stack>
    </Box>
  </BasicPage>
}
