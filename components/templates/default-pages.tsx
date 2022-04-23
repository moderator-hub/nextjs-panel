import { CircularProgress } from "@mui/material"

export function DefaultError() {
  return <h1>Error</h1>
}

export function Default404() {
  return <h1>Not Found</h1>
}

export function DefaultLoading() {
  return <CircularProgress size={80} />
}