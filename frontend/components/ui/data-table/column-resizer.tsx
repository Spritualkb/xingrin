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
 * 设计规范：
 * - 可点击区域宽度：8px (w-2)
 * - 定位在列右边缘内部
 * - TableHead 需要添加 pr-2 为 resizer 预留空间
 * - 视觉指示线宽度：2px (w-0.5)
 * - 高度：100% 填满表头
 * - 支持 mouse 和 touch 事件
 * - 双击重置列宽
 * - hover 时显示高亮指示线
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
        // 可点击区域：8px 宽，定位在列右边缘
        "group absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none z-10",
        "flex items-center justify-center",
        className
      )}
    >
      {/* 视觉指示线：2px 宽，80% 高，仅在 hover 或拖动时显示 */}
      <div 
        className={cn(
          "w-0.5 h-4/5 rounded-full transition-all",
          header.column.getIsResizing() 
            ? "bg-primary opacity-100" 
            : "bg-primary/50 opacity-0 group-hover:opacity-100"
        )} 
      />
    </div>
  )
}
