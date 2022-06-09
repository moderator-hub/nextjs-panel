import { NextRouter, useRouter } from "next/router"
import { useEffect, useState } from "react"

import { useAppDispatch, useAppSelector } from "../data/hooks"
import { fail } from "../data/slices/moderator"
import { AppDispatch } from "../data/store"
import { authorizedFetch } from "./fetcher"

export interface RequestState {
  code: number,
  error?: any,
  data?: any
}

export interface RequestorBase {
  dispatch: AppDispatch
  router: NextRouter
}

export interface Authorized extends RequestorBase {
  authorized?: boolean
}

export function requireSignIn(router: NextRouter, dispatch: AppDispatch) {
  if (router.asPath !== "/signin") {
    dispatch(fail(router.asPath))
    router.push("/signin")
  } else dispatch(fail("/"))
}

export function useRequestorBase(): RequestorBase {
  return { router: useRouter(), dispatch: useAppDispatch() }
}

export function useAuthorized(): Authorized {
  const { router, dispatch } = useRequestorBase()
  const authorized = useAppSelector(state => state.moderator.authorized)

  useEffect(() => {
    if (!authorized) requireSignIn(router, dispatch)
  }, [router, dispatch, authorized])

  return { authorized, dispatch, router }
}

export interface RequestorPrams {
  path: string
  request?: RequestInit
  body?: any
  setState: (state: RequestState) => void
}

export interface Requestor extends Authorized {
  protectedRequest: (params: RequestorPrams) => void
}

export function useRequestor(): Requestor {
  const { router, dispatch } = useRequestorBase()
  const authorized = useAppSelector(state => state.moderator.authorized)

  function protectedRequest({ path, request, body, setState }: RequestorPrams) {
    if (authorized) {
      if (body !== undefined) {
        request = {
          body: JSON.stringify(body),
          ...request,
          headers: { "Content-Type": "application/json", ...request?.headers }
        }
      }
      authorizedFetch(path, request).then(response => {
        switch (response.status) {
          case 200:
            response.json().then(data => setState({ code: response.status, data }))
            break
          case 401:
          case 422:
            requireSignIn(router, dispatch)
            break
          default:
            response.json().then(error => setState({ code: response.status, error }))
        }
      })
    } else {
      setState({ code: 401 })
      requireSignIn(router, dispatch)
    }
  }

  return { dispatch, router, authorized, protectedRequest }
}

export interface RequestAndRequestor extends RequestState, Requestor {

}

export function useRequest(path: string, request?: RequestInit): RequestAndRequestor {
  const [state, setState] = useState<RequestState>({ code: 0 })
  const requestor = useRequestor()
  const { protectedRequest } = requestor
  useEffect(() => protectedRequest({ path, request, setState }), [setState])
  return { ...requestor, ...state }
}
