import type React from "react"

/**
 * 根布局组件
 * 这是最外层的布局，实际内容由 [locale]/layout.tsx 处理
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
