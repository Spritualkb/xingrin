"use client"

import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FingerPrintHubFingerprint } from "@/types/fingerprint.types"

interface ColumnOptions {
  formatDate: (date: string) => string
}

/**
 * Severity badge with color coding
 */
function SeverityBadge({ severity }: { severity: string }) {
  const colorMap: Record<string, string> = {
    critical: "bg-red-500 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-black",
    low: "bg-blue-500 text-white",
    info: "bg-gray-500 text-white",
  }
  
  const color = colorMap[severity?.toLowerCase()] || colorMap.info
  
  return (
    <Badge className={`${color} text-xs`}>
      {severity || "info"}
    </Badge>
  )
}

/**
 * Tags list cell - displays tags with expand/collapse
 */
function TagListCell({ tags }: { tags: string }) {
  const t = useTranslations("tooltips")
  const [expanded, setExpanded] = React.useState(false)
  
  if (!tags) return <span className="text-muted-foreground">-</span>
  
  const tagArray = tags.split(",").map(t => t.trim())
  const displayTags = expanded ? tagArray : tagArray.slice(0, 3)
  const hasMore = tagArray.length > 3
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1">
        {displayTags.map((tag, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary hover:underline self-start flex items-center gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              {t("collapse")}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              {t("expand")}
            </>
          )}
        </button>
      )}
    </div>
  )
}

/**
 * HTTP matchers count cell
 */
function HttpMatchersCell({ http }: { http: any[] }) {
  if (!http || http.length === 0) return <span className="text-muted-foreground">-</span>
  return (
    <Badge variant="outline" className="font-mono text-xs">
      {http.length} matchers
    </Badge>
  )
}

/**
 * Create FingerPrintHub fingerprint table column definitions
 */
export function createFingerPrintHubFingerprintColumns({
  formatDate,
}: ColumnOptions): ColumnDef<FingerPrintHubFingerprint>[] {
  return [
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
      enableResizing: false,
      size: 40,
    },
    {
      accessorKey: "fpId",
      meta: { title: "FP ID" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="FP ID" />
      ),
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-1 py-0.5 rounded">
          {row.getValue("fpId")}
        </code>
      ),
      enableResizing: true,
      size: 200,
    },
    {
      accessorKey: "name",
      meta: { title: "Name" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
      enableResizing: true,
      size: 200,
    },
    {
      accessorKey: "author",
      meta: { title: "Author" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Author" />
      ),
      cell: ({ row }) => {
        const author = row.getValue("author") as string
        if (!author) return <span className="text-muted-foreground">-</span>
        return <span className="text-sm">{author}</span>
      },
      enableResizing: true,
      size: 120,
    },
    {
      accessorKey: "severity",
      meta: { title: "Severity" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Severity" />
      ),
      cell: ({ row }) => <SeverityBadge severity={row.getValue("severity")} />,
      enableResizing: false,
      size: 100,
    },
    {
      accessorKey: "tags",
      meta: { title: "Tags" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ row }) => <TagListCell tags={row.getValue("tags") || ""} />,
      enableResizing: true,
      size: 200,
    },
    {
      accessorKey: "http",
      meta: { title: "HTTP" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HTTP" />
      ),
      cell: ({ row }) => <HttpMatchersCell http={row.getValue("http") || []} />,
      enableResizing: false,
      size: 100,
    },
    {
      accessorKey: "createdAt",
      meta: { title: "Created" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string
        return (
          <div className="text-sm text-muted-foreground">
            {formatDate(date)}
          </div>
        )
      },
      enableResizing: false,
      size: 160,
    },
  ]
}
