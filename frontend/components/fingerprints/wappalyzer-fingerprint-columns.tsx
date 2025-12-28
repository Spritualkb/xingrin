"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { WappalyzerFingerprint } from "@/types/fingerprint.types"

interface ColumnOptions {
  formatDate: (date: string) => string
}

/**
 * 创建 Wappalyzer 指纹表格列定义
 */
export function createWappalyzerFingerprintColumns({
  formatDate,
}: ColumnOptions): ColumnDef<WappalyzerFingerprint>[] {
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
    // 应用名称
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      size: 180,
    },
    // 分类
    {
      accessorKey: "cats",
      header: "Categories",
      cell: ({ row }) => {
        const cats = row.getValue("cats") as number[]
        if (!cats || cats.length === 0) return "-"
        return (
          <div className="flex flex-wrap gap-1">
            {cats.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
            {cats.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{cats.length - 3}
              </Badge>
            )}
          </div>
        )
      },
      size: 120,
    },
    // 描述
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue("description") as string
        if (!desc) return "-"
        return (
          <div className="text-sm text-muted-foreground truncate max-w-xs" title={desc}>
            {desc}
          </div>
        )
      },
      size: 250,
    },
    // 官网
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) => {
        const website = row.getValue("website") as string
        if (!website) return "-"
        return (
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline truncate block max-w-[200px]"
            title={website}
          >
            {website}
          </a>
        )
      },
      size: 200,
    },
    // 检测方式数量
    {
      id: "detectionMethods",
      header: "Detection",
      cell: ({ row }) => {
        const fp = row.original
        const methods: string[] = []
        if (fp.cookies && Object.keys(fp.cookies).length > 0) methods.push("cookies")
        if (fp.headers && Object.keys(fp.headers).length > 0) methods.push("headers")
        if (fp.scriptSrc && fp.scriptSrc.length > 0) methods.push("script")
        if (fp.js && fp.js.length > 0) methods.push("js")
        if (fp.meta && Object.keys(fp.meta).length > 0) methods.push("meta")
        if (fp.html && fp.html.length > 0) methods.push("html")
        
        if (methods.length === 0) return "-"
        return (
          <div className="flex flex-wrap gap-1">
            {methods.map((m) => (
              <Badge key={m} variant="outline" className="text-xs">
                {m}
              </Badge>
            ))}
          </div>
        )
      },
      size: 180,
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
