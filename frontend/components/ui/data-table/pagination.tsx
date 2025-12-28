"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { PaginationInfo } from "@/types/data-table.types"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  paginationInfo?: PaginationInfo
  pageSizeOptions?: number[]
  className?: string
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000]

/**
 * 统一的分页组件
 * 
 * 通过 table.setPageIndex/setPageSize 更新分页状态，
 * 由 useReactTable 的 onPaginationChange 统一处理状态同步。
 */
export function DataTablePagination<TData>({
  table,
  paginationInfo,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  
  // 服务端分页模式
  const isServerSide = !!paginationInfo
  
  // 计算总数和总页数
  const total = paginationInfo?.total ?? table.getFilteredRowModel().rows.length
  const totalPages = paginationInfo?.totalPages ?? table.getPageCount()
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  // 使用 useCallback 包装处理函数，避免不必要的重新渲染
  const handlePageSizeChange = React.useCallback((value: string) => {
    const newPageSize = Number(value)
    table.setPageSize(newPageSize)
  }, [table])

  const handleFirstPage = React.useCallback(() => {
    table.setPageIndex(0)
  }, [table])

  const handlePreviousPage = React.useCallback(() => {
    if (isServerSide) {
      table.setPageIndex(Math.max(0, pageIndex - 1))
    } else {
      table.previousPage()
    }
  }, [table, isServerSide, pageIndex])

  const handleNextPage = React.useCallback(() => {
    if (isServerSide) {
      table.setPageIndex(Math.min(totalPages - 1, pageIndex + 1))
    } else {
      table.nextPage()
    }
  }, [table, isServerSide, pageIndex, totalPages])

  const handleLastPage = React.useCallback(() => {
    table.setPageIndex(Math.max(0, totalPages - 1))
  }, [table, totalPages])

  // 服务端分页时使用自己计算的值，客户端分页使用 table 方法
  const canPreviousPage = isServerSide ? pageIndex > 0 : table.getCanPreviousPage()
  const canNextPage = isServerSide ? pageIndex < totalPages - 1 : table.getCanNextPage()

  return (
    <div className={cn("flex items-center justify-between px-2", className)}>
      {/* 选中行信息 */}
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedCount} of {total} row(s) selected
      </div>

      {/* 分页控制器 */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* 每页显示数量选择 */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            Rows per page
          </Label>
          <Select
            value={`${pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[90px]" id="rows-per-page">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 页码信息 */}
        <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
          Page {pageIndex + 1} of {totalPages || 1}
        </div>

        {/* 分页按钮 */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePreviousPage}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNextPage}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLastPage}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
