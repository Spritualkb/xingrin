"use client"

import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header"
import { ChevronDown, ChevronUp, Star } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FingersFingerprint } from "@/types/fingerprint.types"

interface ColumnOptions {
  formatDate: (date: string) => string
}

/**
 * Tag list cell - displays tags as badges
 */
function TagListCell({ tags }: { tags: string[] }) {
  const t = useTranslations("tooltips")
  const [expanded, setExpanded] = React.useState(false)
  
  if (!tags || tags.length === 0) return <span className="text-muted-foreground">-</span>
  
  const displayTags = expanded ? tags : tags.slice(0, 3)
  const hasMore = tags.length > 3
  
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
 * Rule count cell - displays rule count
 */
function RuleCountCell({ rules }: { rules: any[] }) {
  if (!rules || rules.length === 0) return <span className="text-muted-foreground">-</span>
  return (
    <Badge variant="outline" className="font-mono text-xs">
      {rules.length} rules
    </Badge>
  )
}

/**
 * Port list cell - displays ports
 */
function PortListCell({ ports }: { ports: number[] }) {
  if (!ports || ports.length === 0) return <span className="text-muted-foreground">-</span>
  return (
    <div className="flex flex-wrap gap-1">
      {ports.slice(0, 5).map((port, idx) => (
        <Badge key={idx} variant="outline" className="font-mono text-xs">
          {port}
        </Badge>
      ))}
      {ports.length > 5 && (
        <Badge variant="secondary" className="text-xs">
          +{ports.length - 5}
        </Badge>
      )}
    </div>
  )
}

/**
 * Create Fingers fingerprint table column definitions
 */
export function createFingersFingerprintColumns({
  formatDate,
}: ColumnOptions): ColumnDef<FingersFingerprint>[] {
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
      accessorKey: "name",
      meta: { title: "Name" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const focus = row.original.focus
        return (
          <div className="flex items-center gap-2">
            {focus && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
            <span className="font-medium">{row.getValue("name")}</span>
          </div>
        )
      },
      enableResizing: true,
      size: 200,
    },
    {
      accessorKey: "link",
      meta: { title: "Link" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Link" />
      ),
      cell: ({ row }) => {
        const link = row.getValue("link") as string
        if (!link) return <span className="text-muted-foreground">-</span>
        return (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate block max-w-[200px]"
          >
            {link}
          </a>
        )
      },
      enableResizing: true,
      size: 200,
    },
    {
      accessorKey: "rule",
      meta: { title: "Rule" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rule" />
      ),
      cell: ({ row }) => <RuleCountCell rules={row.getValue("rule") || []} />,
      enableResizing: false,
      size: 100,
    },
    {
      accessorKey: "tag",
      meta: { title: "Tag" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tag" />
      ),
      cell: ({ row }) => <TagListCell tags={row.getValue("tag") || []} />,
      enableResizing: true,
      size: 200,
    },
    {
      accessorKey: "defaultPort",
      meta: { title: "Default Port" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Default Port" />
      ),
      cell: ({ row }) => <PortListCell ports={row.getValue("defaultPort") || []} />,
      enableResizing: true,
      size: 150,
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
