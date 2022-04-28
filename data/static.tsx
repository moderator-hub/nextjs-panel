export const privileges: string[] = ["CATEGORY", "CATEGORY", "CATEGORY", "CATEGORY", "CATEGORY", "CATEGORY", "CATEGORY"]

export const serverURL = "http://localhost:5000"
export const basePath = "/mub/"

export function defaultFetchArgs(): RequestInit {
  return { credentials: "include" }
}

export function authorizedFetchArgs(): RequestInit {
  return defaultFetchArgs()
}
