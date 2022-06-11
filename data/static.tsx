export const serverURL = "http://localhost:5000"
export const basePath = "/mub/"

export function defaultFetchArgs(): RequestInit {
  return { credentials: "include" }
}

export function authorizedFetchArgs(): RequestInit {
  return defaultFetchArgs()
}

export const languages: { locale: string, name: string }[] = [
  { locale: "en", name: "English" },
  { locale: "ru", name: "Русский" },
]
