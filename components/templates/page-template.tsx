import Head from "next/head";
import { CSSProperties, ReactChild } from "react";

interface BasicPageProps {
  shift?: boolean;
  title?: string;
  style?: CSSProperties;
  favicon?: string;
  children?: ReactChild | ReactChild[];
}

export default function BasicPage({ title = "MUB", favicon = "/favicon.ico", style, shift = true, children }: BasicPageProps) {
  return <div style={{ marginTop: shift ? 50 : 0, ...style}}>
    <Head>
      <title>{title}</title>
      <link rel="icon" href={favicon} />
    </Head>
    {children}
  </div>
}
