"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { UnifiedDataTable } from "@/components/ui/data-table"
import type { ScanEngine } from "@/types/engine.types"

// 组件属性类型定义
interface EngineDataTableProps {
  data: ScanEngine[]
  columns: ColumnDef<ScanEngine>[]
  onAddNew?: () => void
  searchPlaceholder?: string
  searchColumn?: string
  addButtonText?: string
}

/**
 * 扫描引擎数据表格组件
 * 使用 UnifiedDataTable 统一组件
 */
export function EngineDataTable({
  data = [],
  columns,
  onAddNew,
  searchPlaceholder = "搜索引擎名称...",
  addButtonText = "新建引擎",
}: EngineDataTableProps) {
  // 本地搜索状态
  const [searchValue, setSearchValue] = React.useState("")

  // 过滤数据（本地过滤）
  const filteredData = React.useMemo(() => {
    if (!searchValue) return data
    return data.filter((item) => {
      const name = item.name || ""
      return name.toLowerCase().includes(searchValue.toLowerCase())
    })
  }, [data, searchValue])

  // 列标签映射
  const columnLabels: Record<string, string> = {
    name: "引擎名称",
    type: "类型",
    description: "描述",
    tools: "关联工具",
    updated_at: "更新时间",
  }

  return (
    <UnifiedDataTable
      data={filteredData}
      columns={columns}
      getRowId={(row) => String(row.id)}
      enableRowSelection={false}
      onAddNew={onAddNew}
      addButtonLabel={addButtonText}
      showBulkDelete={false}
      columnLabels={columnLabels}
      emptyMessage="暂无数据"
      toolbarLeft={
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="max-w-sm h-8"
        />
      }
    />
  )
}

