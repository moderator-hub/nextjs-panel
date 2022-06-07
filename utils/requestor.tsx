import { NextRouter, useRouter } from "next/router"
import { useEffect, useState } from "react"

import { useAppDispatch, useAppSelector } from "../data/hooks"
import { fail, signIn } from "../data/slices/moderator"
import { AppDispatch } from "../data/store"
import { authorizedFetch } from "./fetcher"

export interface RequestState {
  code: number,
  error?: any,
  data?: any
}

export interface Authorized {
  authorized?: boolean
  dispatch: AppDispatch
  router: NextRouter
}

export function useAuthorized(): Authorized {
  const router = useRouter()

  const dispatch: AppDispatch = useAppDispatch()
  const authorized = useAppSelector(state => state.moderator.authorized)

  function requireSignIn() {
    if (router.asPath !== "/signin") {
      dispatch(fail(router.asPath))
      router.push("/signin")
    } else dispatch(fail("/"))
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
  const router = useRouter()

  const dispatch: AppDispatch = useAppDispatch()
  const authorized = useAppSelector(state => state.moderator.authorized)

  function requireSignIn(setState: (state: RequestState) => void) {
    setState({ code: 401 })
    if (router.asPath !== "/signin") {
      dispatch(fail(router.asPath))
      router.push("/signin")
    } else dispatch(fail("/"))
  }

  function requestData({ path, request, body, setState }: RequestorPrams) {
    if (body !== undefined) {
      request = {
        body: JSON.stringify(body),
        ...request,
        headers: { "Content-Type": "application/json", ...request?.headers }
      }
    }
    authorizedFetch(path, request)
      .then(response => {
        switch (response.status) {
          case 200:
            response.json().then(data => setState({ code: response.status, data }))
            break
          case 401:
            requireSignIn(setState)
            break
          default:
            response.json().then(error => setState({ code: response.status, error }))
        }
      })
  }

  function protectedRequest(params: RequestorPrams) {
    if (authorized === true) {
      requestData(params)
    } else if (authorized === undefined) {
      authorizedFetch("/my-permissions/", { method: "get", })
        .then(response => {
          if (response.status === 200) {
            response.json().then(permissions => {
              dispatch(signIn(permissions))
              requestData(params)
            })
          } else if (response.status === 401 || response.status === 403 || response.status === 422) {
            requireSignIn(params.setState)
          } else console.log("Got code", response.status, "for /my-permissions/")
        })
    } else if (authorized === false) {
      requireSignIn(params.setState)
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
