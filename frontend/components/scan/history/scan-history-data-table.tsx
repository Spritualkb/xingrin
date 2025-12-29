"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import { IconSearch, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UnifiedDataTable } from "@/components/ui/data-table"
import type { ScanRecord } from "@/types/scan.types"
import type { PaginationInfo } from "@/types/common.types"

interface ScanHistoryDataTableProps {
  data: ScanRecord[]
  columns: ColumnDef<ScanRecord>[]
  onAddNew?: () => void
  onBulkDelete?: () => void
  onSelectionChange?: (selectedRows: ScanRecord[]) => void
  searchPlaceholder?: string
  searchValue?: string
  onSearch?: (value: string) => void
  isSearching?: boolean
  addButtonText?: string
  pagination?: { pageIndex: number; pageSize: number }
  setPagination?: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>
  paginationInfo?: PaginationInfo
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void
  hideToolbar?: boolean
  hidePagination?: boolean
}

/**
 * 扫描历史数据表格组件
 * 使用 UnifiedDataTable 统一组件
 */
export function ScanHistoryDataTable({
  data = [],
  columns,
  onAddNew,
  onBulkDelete,
  onSelectionChange,
  searchPlaceholder,
  searchValue,
  onSearch,
  isSearching = false,
  addButtonText,
  pagination: externalPagination,
  setPagination: setExternalPagination,
  paginationInfo,
  onPaginationChange,
  hideToolbar = false,
  hidePagination = false,
}: ScanHistoryDataTableProps) {
  const t = useTranslations("common.status")
  const tScan = useTranslations("scan.history")
  
  // 搜索本地状态
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue || "")

  React.useEffect(() => {
    setLocalSearchValue(searchValue || "")
  }, [searchValue])

  const handleSearchSubmit = () => {
    if (onSearch) {
      onSearch(localSearchValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit()
    }
  }

  return (
    <UnifiedDataTable
      data={data}
      columns={columns}
      getRowId={(row) => String(row.id)}
      // 分页
      pagination={externalPagination}
      setPagination={setExternalPagination}
      paginationInfo={paginationInfo}
      onPaginationChange={onPaginationChange}
      hidePagination={hidePagination}
      // 选择
      onSelectionChange={onSelectionChange}
      // 批量操作
      onBulkDelete={onBulkDelete}
      bulkDeleteLabel="Delete"
      onAddNew={onAddNew}
      addButtonLabel={addButtonText || tScan("title")}
      // 工具栏
      hideToolbar={hideToolbar}
      // 空状态
      emptyMessage={t("noData")}
      // 自定义搜索框
      toolbarLeft={
        <div className="flex items-center space-x-2">
          <Input
            placeholder={searchPlaceholder || tScan("searchPlaceholder")}
            value={localSearchValue}
            onChange={(e) => setLocalSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 max-w-sm"
          />
          <Button variant="outline" size="sm" onClick={handleSearchSubmit} disabled={isSearching}>
            {isSearching ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconSearch className="h-4 w-4" />
            )}
          </Button>
        </div>
      }
    />
  )
}
