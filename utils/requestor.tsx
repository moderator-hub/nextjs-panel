import { NextRouter, useRouter } from "next/router"
import { useEffect, useState } from "react"

import { useAppDispatch, useAppSelector } from "../data/hooks"
import { fail, signIn } from "../data/slices/moderator"
import { AppDispatch } from "../data/store"
import { authorizedFetch } from "./fetcher"

export interface RequestState {
  code: number,
  data?: any
}

export interface Authorized {
  authorized?: boolean
  dispatch: AppDispatch
  router: NextRouter
}

export interface Requestor extends Authorized, RequestState {
}

export function useAuthorized(): Authorized {
  const router = useRouter()

  const dispatch: AppDispatch = useAppDispatch()
  const authorized = useAppSelector(state => state.moderator.authorized)

  function requireSignIn() {
    dispatch(fail(router.asPath))
    router.push("/signin")
  }

  useEffect(() => {
    if (authorized === undefined) {
      authorizedFetch("/my-permissions/", { method: "get", })
        .then(response => {
          if (response.status === 200) {
            response.json().then(permissions => dispatch(signIn(permissions)))
          } else if (response.status === 401 || response.status === 403) {
            requireSignIn()
          } else console.log("Got code", response.status, "for /my-permissions/")
        })
    } else if (authorized === false) {
      requireSignIn()
    }
  })

  return { authorized, dispatch, router }
}

export function useRequestor(path: string, request?: RequestInit): Requestor {
  const { authorized, dispatch, router } = useAuthorized()

  const [state, setState] = useState<RequestState>({ code: 0 })

  function requireSignIn() {
    setState({ code: 401 })
    dispatch(fail(router.asPath))
    router.push("/signin")
  }

  useEffect(() => {
    if (authorized) {
      authorizedFetch(path, request)
        .then(response => {
          switch (response.status) {
            case 200:
              response.json().then(data => setState({ code: response.status, data }))
              break
            case 401:
              requireSignIn()
              break
            default:
              setState({ code: response.status })
          }
        })
    }
  }, [setState])

  return { dispatch, router, ...state }
}
