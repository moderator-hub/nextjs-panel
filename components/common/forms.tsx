import { TextField, StandardTextFieldProps, Typography } from "@mui/material"
import { useTranslation } from "next-i18next"
import { FC } from "react"
import { Control, Controller, FieldValues } from "react-hook-form"

export interface TextFieldControllerProps extends StandardTextFieldProps {
  control: Control<FieldValues, any>
  defaultValue?: string
  name: string
  labelKey?: string
  Field?: FC
}

export function TextFieldController({ name, control, defaultValue = "", labelKey, Field = TextField, ...other }: TextFieldControllerProps) {
  const { t } = useTranslation("forms")

  return <Controller
    name={name}
    control={control}
    defaultValue={defaultValue}
    render={({ field }) => (
      <Field
        label={t(labelKey === undefined ? name : labelKey)}
        fullWidth
        margin="normal"
        {...field}
        ref={null}
        {...other}
      />
    )}
  />
}

export interface ErrorDescription {
  field?: string
  type: "required" | "too-long" | "fetch"
  description?: string
  descriptionKey?: string
}

export interface ErrorDescriptionProps {
  errors: ErrorDescription[]
}

export function ErrorFormText({ errors }: ErrorDescriptionProps) {
  const { t } = useTranslation("forms")

  if (errors.length === 0) return <></>

  function describeError(error: ErrorDescription): string {
    if (error.description !== undefined) return error.description
    if (error.descriptionKey !== undefined) return t(error.descriptionKey)
    if (error.field === undefined) return t(error.type + "-error")
    return t(error.type + "-error", { field: t(error.field) })
  }

  console.log(errors, describeError(errors[0]))

  return <>
    {errors.map((error, key) => (
      <Typography
        sx={{ mt: 1 }}
        variant="body1"
        color="error"
        key={key}
      >
        {describeError(error)}
      </Typography>
    ))}
  </>
}
