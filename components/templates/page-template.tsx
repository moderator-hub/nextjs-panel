import Head from "next/head"
import { CSSProperties, ReactNode } from "react"
import { Default404, DefaultError, DefaultLoading } from "./default-pages"

interface BasicPageProps {
  shift?: boolean
  title?: string
  style?: CSSProperties
  favicon?: string
  children?: ReactNode
}

export function BasicPage({ title, favicon = "/favicon.ico", style, shift = true, children }: BasicPageProps) {
  return <div style={{ marginTop: shift ? 50 : 0, ...style }}>
    <Head>
      <title>{title}</title>
      <link rel="icon" href={favicon} />
    </Head>
    {children}
  </div>
}

interface ProtectedPageInnerProps {
  code: number
  children?: ReactNode
  PageError?: ReactNode
  Page400?: ReactNode
  Page403?: ReactNode
  Page404?: ReactNode
  Page422?: ReactNode
  Page500?: ReactNode
  PageOther?: ReactNode
  PageLoading?: ReactNode
}

interface ProtectedPageProps extends BasicPageProps, ProtectedPageInnerProps {
}

function ProtectedPageInner({
  code,
  PageError = <DefaultError />,
  Page400,
  Page403,
  Page404 = <Default404 />,
  Page422,
  Page500,
  PageOther,
  PageLoading = <DefaultLoading />,
}: ProtectedPageInnerProps, children: ReactNode) {
  switch (code) {
    case 0:
    case 401: return PageLoading
    case 400: return Page400 === undefined ? PageError : Page400
    case 403: return Page403 === undefined ? PageError : Page403
    case 404: return Page404
    case 422: return Page422 === undefined ? PageError : Page422
    case 500: return Page500 === undefined ? PageError : Page500
    case 200: return children
    default: return PageOther
  }
}

export function ProtectedPage({ children, ...props }: ProtectedPageProps) {
  return <BasicPage {...props}>
    {ProtectedPageInner(props, children)}
  </BasicPage>
}
