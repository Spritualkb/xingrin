"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/**
 * 预设的截断长度配置（保留用于兼容）
 */
export const TRUNCATE_LENGTHS = {
  url: 50,
  title: 25,
  location: 20,
  webServer: 20,
  contentType: 20,
  bodyPreview: 25,
  subdomain: 35,
  ip: 35,
  host: 30,
  default: 30,
} as const

export type TruncateLengthKey = keyof typeof TRUNCATE_LENGTHS

interface TruncatedCellProps {
  /** 要显示的值 */
  value: string | null | undefined
  /** 最大显示长度（已废弃，不再使用） */
  maxLength?: number | TruncateLengthKey
  /** 额外的 CSS 类名 */
  className?: string
  /** 是否使用等宽字体 */
  mono?: boolean
  /** 空值时显示的占位符 */
  placeholder?: string
}

/**
 * 单元格组件 - 完整显示，支持点击复制
 */
export function TruncatedCell({
  value,
  className,
  mono = false,
  placeholder = "-",
}: TruncatedCellProps) {
  if (!value) {
    return <span className="text-muted-foreground text-sm">{placeholder}</span>
  }

  return (
    <div 
      className={cn(
        "text-sm break-all leading-relaxed whitespace-normal cursor-pointer hover:text-primary transition-colors",
        mono && "font-mono",
        className
      )}
      onClick={() => {
        navigator.clipboard.writeText(value)
        toast.success("已复制")
      }}
      title="点击复制"
    >
      {value}
    </div>
  )
}

/**
 * URL 专用的单元格 - 完整显示，支持点击复制
 */
export function TruncatedUrlCell({
  value,
  className,
}: Omit<TruncatedCellProps, "mono">) {
  if (!value) {
    return <span className="text-muted-foreground text-sm">-</span>
  }

  return (
    <div 
      className={cn(
        "text-sm text-blue-600 break-all leading-relaxed whitespace-normal cursor-pointer hover:underline",
        className
      )}
      onClick={() => {
        navigator.clipboard.writeText(value)
        toast.success("URL 已复制")
      }}
      title="点击复制"
    >
      {value}
    </div>
  )
}
