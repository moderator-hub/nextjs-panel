import { Box, Button, Stack, TextField, Typography } from "@mui/material"

import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { BasicPage } from "../components/templates/page-template"
import { useWindowState } from "../utils/effects"
import { outsiderJSONFetch } from "../utils/fetcher"
import { useState } from "react"
import { signIn } from "../data/slices/moderator"
import { AppDispatch } from "../data/store"
import { useAppDispatch, useAppSelector } from "../data/hooks"
import { useRouter } from "next/router"
import { PasswordField } from "../components/common/library"

const schema = yup
  .object({
    username: yup.string().max(100).required(),
    password: yup.string().max(100).required(),
  })
  .required()

interface SignInErrors {
  moderatorNotFound?: boolean
  wrongPassword?: boolean
  clientError?: boolean
  serverError?: boolean
}

export default function SignInPage() {
  const height = useWindowState()[1]

  const router = useRouter()
  const dispatch: AppDispatch = useAppDispatch()
  const retryPath = useAppSelector(state => state.moderator.retryPath)

  const [fetchErrors, setErrors] = useState<SignInErrors>({})
  const { control, handleSubmit, formState: { errors }, } = useForm({ resolver: yupResolver(schema), })

  const usernameError = !!errors?.username?.type || fetchErrors.moderatorNotFound
  const passwordError = !!errors?.password?.type || fetchErrors.wrongPassword
  const anyError = usernameError || passwordError || fetchErrors.clientError || fetchErrors.serverError

  const errorDescription: string[] = []
  if (anyError) {
    if (usernameError) {
      if (errors?.username?.type === "max") errorDescription.push("Username is too long")
      if (errors?.username?.type === "required") errorDescription.push("Username is required")
      if (fetchErrors.moderatorNotFound) errorDescription.push("Moderator not found")
    }
    if (passwordError) {
      if (errors?.password?.type === "max") errorDescription.push("Password is too long")
      if (errors?.password?.type === "required") errorDescription.push("Password is required")
      if (fetchErrors.wrongPassword) errorDescription.push("Wrong password")
    }
    if (fetchErrors.clientError) errorDescription.push("Client error")
    if (fetchErrors.serverError) errorDescription.push("Server error")
  }

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
              error={usernameError}
              fullWidth
              margin="normal"
              {...field}
              ref={null}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <PasswordField
              sx={{ width: "100%", }}
              label="Password"
              error={passwordError}
              fullWidth
              margin="normal"
              {...field}
              ref={null}
            />
          )}
        />
        {anyError && errorDescription
          .map((item, key) => <Typography
            sx={{ mt: 1 }}
            variant="body1"
            color="error"
            key={key}
          >
            {item}
          </Typography>)
        }
        <Button
          variant="contained"
          sx={{ mx: "37%", mt: anyError ? 1 : 2 }}
          onClick={handleSubmit((data: any) => {
            setErrors({})
            outsiderJSONFetch("/sign-in/", data, { method: "post" })
              .then(response => {
                if (response.status === 200) {
                  return response.json().then(data => {
                    console.log(data)
                    if (data === "Moderator does not exist") {
                      setErrors({ moderatorNotFound: true })
                    } else if (data === "Wrong password") {
                      setErrors({ wrongPassword: true })
                    } else if (Array.isArray(data)) {
                      dispatch(signIn(data))
                      if (retryPath) router.push(retryPath)
                      else router.push("/")
                    } else {
                      setErrors({ serverError: true })
                    }
                  })
                } else if (response.status >= 500) {
                  setErrors({ serverError: true })
                } else {
                  setErrors({ clientError: true })
                }
              })
          })}
        >
          SIGN IN
        </Button>
      </Stack>
    </Box>
  </BasicPage>
}