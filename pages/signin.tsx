import { useState } from "react"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import { BasicPage } from "../components/templates/page-template"
import { PasswordField } from "../components/common/library"
import { ErrorDescription, ErrorFormText, TextFieldController } from "../components/common/forms"
import { signIn } from "../data/slices/moderator"
import { AppDispatch } from "../data/store"
import { useAppDispatch, useAppSelector } from "../data/hooks"
import { useWindowState } from "../utils/effects"
import { outsiderJSONFetch } from "../utils/fetcher"

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
  const { t } = useTranslation("signin")
  const { t: tCommon } = useTranslation("common")

  const height = useWindowState()[1]

  const router = useRouter()
  const dispatch: AppDispatch = useAppDispatch()
  const retryPath = useAppSelector(state => state.moderator.retryPath)

  const [fetchErrors, setErrors] = useState<SignInErrors>({})
  const { control, handleSubmit, formState: { errors }, } = useForm({ resolver: yupResolver(schema), })

  const usernameError = !!errors?.username?.type || fetchErrors.moderatorNotFound
  const passwordError = !!errors?.password?.type || fetchErrors.wrongPassword
  const anyError = usernameError || passwordError || fetchErrors.clientError || fetchErrors.serverError

  const errorDescription: ErrorDescription[] = []
  if (anyError) {
    if (usernameError) {
      if (errors?.username?.type === "max") errorDescription.push({ field: "username", type: "too-long" })
      if (errors?.username?.type === "required") errorDescription.push({ field: "username", type: "required" })
      if (fetchErrors.moderatorNotFound) errorDescription.push({ type: "fetch", description: t("mod-not-found") })
    }
    if (passwordError) {
      if (errors?.password?.type === "max") errorDescription.push({ field: "password", type: "too-long" })
      if (errors?.password?.type === "required") errorDescription.push({ field: "password", type: "required" })
      if (fetchErrors.wrongPassword) errorDescription.push({ type: "fetch", description: t("wrong-password") })
    }
    if (fetchErrors.clientError) errorDescription.push({ type: "fetch", descriptionKey: "client-error" })
    if (fetchErrors.serverError) errorDescription.push({ type: "fetch", descriptionKey: "server-error" })
  }

  return <BasicPage title={tCommon("app-name")} shift={false} style={{ overflow: "hidden" }}>
    <Box sx={{ display: "flex", alignContent: "center", justifyContent: "center", height: height }}>
      <Stack component="form" sx={{ maxWidth: 500, width: "100%", m: "auto", textAlign: "center" }} direction="column">
        <Typography variant="h4">
          {t("signin-title")}
        </Typography>
        <TextFieldController
          name="username"
          control={control}
          error={usernameError}
        />
        <TextFieldController
          name="password"
          control={control}
          error={passwordError}
          Field={PasswordField}
        />
        <ErrorFormText
          errors={errorDescription}
        />
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
                    } else if (data) {
                      dispatch(signIn(data))
                      if (retryPath) router.push(retryPath, retryPath, { locale: data.locale })
                      else router.push("/", "/", { locale: data.locale })
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
          {t("signin-action")}
        </Button>
      </Stack>
    </Box>
  </BasicPage>
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...await serverSideTranslations(locale, ["common", "forms", "signin"]),
  },
})
