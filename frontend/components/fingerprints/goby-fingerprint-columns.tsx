"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { GobyFingerprint } from "@/types/fingerprint.types"

interface ColumnOptions {
  formatDate: (date: string) => string
}

/**
 * 创建 Goby 指纹表格列定义
 */
export function createGobyFingerprintColumns({
  formatDate,
}: ColumnOptions): ColumnDef<GobyFingerprint>[] {
  return [
    // 选择列
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    // 产品名称
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      size: 200,
    },
    // 逻辑表达式
    {
      accessorKey: "logic",
      header: "Logic",
      cell: ({ row }) => {
        const logic = row.getValue("logic") as string
        return (
          <Badge variant="outline" className="font-mono text-xs">
            {logic}
          </Badge>
        )
      },
      size: 120,
    },
    // 规则数量
    {
      accessorKey: "rule",
      header: "Rules",
      cell: ({ row }) => {
        const rules = row.getValue("rule") as any[]
        return (
          <Badge variant="secondary">
            {rules?.length || 0} 条规则
          </Badge>
        )
      },
      size: 100,
    },
    // 规则详情
    {
      id: "ruleDetails",
      header: "Rule Details",
      cell: ({ row }) => {
        const rules = row.original.rule || []
        if (rules.length === 0) return "-"
        return (
          <div className="font-mono text-xs text-muted-foreground space-y-0.5 max-w-md">
            {rules.slice(0, 3).map((r, idx) => (
              <div key={idx} className="truncate">
                <span className="text-primary">{r.label}</span>: {r.feature}
              </div>
            ))}
            {rules.length > 3 && (
              <div className="text-muted-foreground">...还有 {rules.length - 3} 条</div>
            )}
          </div>
        )
      },
      size: 300,
    },
    // 创建时间
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string
        return (
          <div className="text-sm text-muted-foreground">
            {formatDate(date)}
          </div>
        )
      },
      size: 160,
    },
  ]
}
