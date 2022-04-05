import { Box, Button, FormGroup, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material"

import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import BasicPage from "../components/templates/page-template"
import { useWindowState } from "../components/utils/effects"

const schema = yup
  .object({
    username: yup.string().max(100).required(),
    password: yup.string().max(100).required(),
  })
  .required()

export default function SignInPage() {
  const height = useWindowState()[1]
  const { control, handleSubmit, formState: { errors }, } = useForm({ resolver: yupResolver(schema), })

  return <BasicPage shift={false} style={{ overflow: "hidden" }}>
    <Box sx={{ display: "flex", alignContent: "center", justifyContent: "center", height: height }}>
      <Stack component="form" sx={{ maxWidth: 500, width: "100%", m: "auto", textAlign: "center" }} direction="column">
        <Typography variant="h4">
          Sign In
        </Typography>
        <Controller
          name="username"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              sx={{ width: "100%", }}
              label="Username"
              error={errors?.username?.type === "max" || errors?.username?.type === "required"}
              fullWidth
              margin="normal"
              {...field}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              sx={{ width: "100%", }}
              label="Password"
              type="password"
              error={errors?.password?.type === "min" || errors?.password?.type === "max" || errors?.password?.type === "required"}
              fullWidth
              margin="normal"
              {...field}
            />
          )}
        />
        <Button
          variant="contained"
          sx={{ mx: "35%", mt: 2 }}
          onClick={handleSubmit((data: any) => console.log(data))}
        >
          SIGN IN
        </Button>
      </Stack>
    </Box>
  </BasicPage>
}