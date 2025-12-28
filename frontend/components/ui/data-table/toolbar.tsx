"use client"

import * as React from "react"
import { IconSearch, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SmartFilterInput } from "@/components/common/smart-filter-input"
import type { FilterField, ParsedFilter } from "@/components/common/smart-filter-input"
import { cn } from "@/lib/utils"

interface DataTableToolbarProps {
  // 搜索模式
  searchMode?: 'simple' | 'smart'
  searchPlaceholder?: string
  searchValue?: string
  onSearch?: (value: string) => void
  isSearching?: boolean
  filterFields?: FilterField[]
  filterExamples?: string[]
  
  // 左侧自定义内容
  leftContent?: React.ReactNode
  
  // 右侧操作
  children?: React.ReactNode
  
  // 样式
  className?: string
}

/**
 * 统一的工具栏组件
 * 
 * 特性：
 * - 支持简单搜索和智能过滤两种模式
 * - 左侧搜索/过滤，右侧操作按钮
 * - 支持自定义内容插槽
 */
export function DataTableToolbar({
  searchMode = 'simple',
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearch,
  isSearching = false,
  filterFields,
  filterExamples,
  leftContent,
  children,
  className,
}: DataTableToolbarProps) {
  // 本地搜索值状态（简单模式）
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue)

  // 同步外部搜索值
  React.useEffect(() => {
    setLocalSearchValue(searchValue)
  }, [searchValue])

  // 处理简单搜索提交
  const handleSimpleSearchSubmit = () => {
    onSearch?.(localSearchValue)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSimpleSearchSubmit()
    }
  }

  // 处理智能过滤搜索
  const handleSmartSearch = (_filters: ParsedFilter[], rawQuery: string) => {
    onSearch?.(rawQuery)
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* 左侧：搜索/过滤 */}
      <div className="flex items-center space-x-2 flex-1 max-w-xl">
        {leftContent ? (
          leftContent
        ) : searchMode === 'smart' ? (
          <SmartFilterInput
            fields={filterFields}
            examples={filterExamples}
            placeholder={searchPlaceholder}
            value={searchValue}
            onSearch={handleSmartSearch}
            className="flex-1"
          />
        ) : (
          <>
            <Input
              placeholder={searchPlaceholder}
              value={localSearchValue}
              onChange={(e) => setLocalSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 flex-1"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSimpleSearchSubmit} 
              disabled={isSearching}
            >
              {isSearching ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconSearch className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>

      {/* 右侧：操作按钮 */}
      {children && (
        <div className="flex items-center space-x-2">
          {children}
        </div>
      )}
    </div>
  )
}
