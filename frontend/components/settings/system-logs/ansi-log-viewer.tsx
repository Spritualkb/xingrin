"use client"

import { useMemo, useRef, useEffect } from "react"
import AnsiToHtml from "ansi-to-html"

interface AnsiLogViewerProps {
  content: string
  className?: string
}

// 创建 ANSI 转换器实例
const converter = new AnsiToHtml({
  fg: "#d4d4d4",
  bg: "#1e1e1e",
  newline: true,
  escapeXML: true,
  colors: {
    0: "#1e1e1e",   // black
    1: "#f44747",   // red
    2: "#6a9955",   // green
    3: "#dcdcaa",   // yellow
    4: "#569cd6",   // blue
    5: "#c586c0",   // magenta
    6: "#4ec9b0",   // cyan
    7: "#d4d4d4",   // white
    8: "#808080",   // bright black
    9: "#f44747",   // bright red
    10: "#6a9955",  // bright green
    11: "#dcdcaa",  // bright yellow
    12: "#569cd6",  // bright blue
    13: "#c586c0",  // bright magenta
    14: "#4ec9b0",  // bright cyan
    15: "#ffffff",  // bright white
  },
})

export function AnsiLogViewer({ content, className }: AnsiLogViewerProps) {
  const containerRef = useRef<HTMLPreElement>(null)

  // 将 ANSI 转换为 HTML
  const htmlContent = useMemo(() => {
    if (!content) return ""
    return converter.toHtml(content)
  }, [content])

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [htmlContent])

  return (
    <pre
      ref={containerRef}
      className={className}
      style={{
        height: "100%",
        width: "100%",
        margin: 0,
        padding: "12px",
        overflow: "auto",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        fontSize: "12px",
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
