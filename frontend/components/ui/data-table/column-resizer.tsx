"use client"

import type { Header } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

interface ColumnResizerProps<TData> {
  header: Header<TData, unknown>
  className?: string
}

/**
 * 统一的列宽调整手柄组件
 * 
 * 特性：
 * - 统一的样式
 * - 支持 mouse 和 touch 事件
 * - 双击重置列宽
 * - hover 时显示指示线
 */
export function ColumnResizer<TData>({ header, className }: ColumnResizerProps<TData>) {
  if (!header.column.getCanResize()) {
    return null
  }

  const resizeHandler = header.getResizeHandler()

  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        resizeHandler(e)
      }}
      onTouchStart={(e) => {
        e.stopPropagation()
        resizeHandler(e)
      }}
      onDoubleClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        header.column.resetSize()
      }}
      className={cn(
        "absolute right-0 top-0 h-full w-4 cursor-col-resize select-none touch-none z-10",
        "flex items-center justify-center",
        header.column.getIsResizing() ? "bg-primary/20" : "hover:bg-muted/50",
        className
      )}
    >
      <div 
        className={cn(
          "w-0.5 h-4/5 rounded-full transition-colors",
          header.column.getIsResizing() ? "bg-primary" : "bg-border group-hover:bg-primary/50"
        )} 
      />
    </div>
  )
}
