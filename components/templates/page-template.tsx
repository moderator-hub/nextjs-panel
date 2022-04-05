import Head from "next/head";
import { CSSProperties, ReactChild } from "react";

interface BasicPageProps {
  title?: string;
  style?: CSSProperties;
  favicon?: string;
  children?: ReactChild | ReactChild[];
}

export default function BasicPage({ title = "MUB", favicon = "/favicon.ico", style, children }: BasicPageProps) {
  return <div style={style}>
    <Head>
      <title>{title}</title>
      <link rel="icon" href={favicon} />
    </Head>
    {children}
  </div>
}
