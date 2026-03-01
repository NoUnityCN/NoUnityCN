import type { Metadata } from "next"
import "@/styles/globals.css"
import { Analytics } from "@vercel/analytics/react"
import ClientLayout from "./client-layout"
import React from "react";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";

export const metadata: Metadata = {
  title: "NoUnityCN | Unity国际版下载站 - 让游戏开发更加简单",
  description: "NoUnityCN - Unity国际版下载站 | NoUnityCN是一项开源项目，在为部分特殊地区的开发者提供国际版的Unity下载方式。支持通过直链和Unity Hub下载Unity，支持为Unity添加组件。",
  keywords: "Unity6国际版,Unity组件下载,国际版Unity下载,Unity Hub国际版,UnityHub海外版,Unity引擎下载站,Unity6下载,Unity6000,Unity海外版下载,Unity国际版下载"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="shortcut icon" href="./favicon.ico"/>
      </head>
      <body className="min-h-screen bg-gray-50">
        <ClientLayout>
            <SiteHeader />
                <main className="flex-grow">
                    {children}
                </main>
            <SiteFooter />
        </ClientLayout>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.CLARITY_PROJECT_ID}");
          `
        }} />
        <Analytics/>
      </body>
    </html>
  )
}
