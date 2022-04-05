import { Link as MUILink } from "@mui/material"
import NextLink from "next/link"
import { CSSProperties, forwardRef, ReactChild } from "react"

interface LinkProps {
  href: string;
  style?: CSSProperties;
  children?: ReactChild | ReactChild[];
}

export function BaseLink({ href, style, children, ...props }: LinkProps) {
  return <MUILink
    href={href}
    underline="hover"
    style={{ cursor: "pointer", ...style }}
    {...props}
  >{children}</MUILink>
}

export function Link({ href, children, style, ...other }: LinkProps) {
  const LinkInner = forwardRef<any, any>(({ onClick, href }, ref) => {
    return <MUILink
      ref={ref}
      href={href}
      onClick={onClick}
      underline="hover"
      style={{ cursor: "pointer", ...style }}
      {...other}
    >{children}</MUILink>
  })
  LinkInner.displayName = "LinkInner"

  return <NextLink href={href} passHref>
    <LinkInner />
  </NextLink>
}
