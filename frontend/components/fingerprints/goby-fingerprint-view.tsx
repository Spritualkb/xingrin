"use client"

import React, { useState, useMemo } from "react"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useTranslations, useLocale } from "next-intl"
import {
  useGobyFingerprints,
  useBulkDeleteGobyFingerprints,
  useDeleteAllGobyFingerprints,
} from "@/hooks/use-fingerprints"
import { FingerprintService } from "@/services/fingerprint.service"
import { GobyFingerprintDataTable } from "./goby-fingerprint-data-table"
import { createGobyFingerprintColumns } from "./goby-fingerprint-columns"
import { GobyFingerprintDialog } from "./goby-fingerprint-dialog"
import { ImportFingerprintDialog } from "./import-fingerprint-dialog"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { getDateLocale } from "@/lib/date-utils"
import type { GobyFingerprint } from "@/types/fingerprint.types"

export function GobyFingerprintView() {
  const [selectedFingerprints, setSelectedFingerprints] = useState<GobyFingerprint[]>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [filterQuery, setFilterQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  // 国际化
  const tColumns = useTranslations("columns")
  const tCommon = useTranslations("common")
  const tTooltips = useTranslations("tooltips")
  const tFingerprints = useTranslations("tools.fingerprints")
  const locale = useLocale()

  // 构建翻译对象
  const translations = useMemo(() => ({
    columns: {
      name: tColumns("common.name"),
      logic: tColumns("fingerprint.logic"),
      rules: tColumns("fingerprint.rules"),
      ruleDetails: tColumns("fingerprint.ruleDetails"),
      created: tColumns("fingerprint.created"),
    },
    actions: {
      selectAll: tCommon("actions.selectAll"),
      selectRow: tCommon("actions.selectRow"),
      expand: tTooltips("expand"),
      collapse: tTooltips("collapse"),
    },
  }), [tColumns, tCommon, tTooltips])

  // 查询数据
  const { data, isLoading, isFetching, error, refetch } = useGobyFingerprints({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    filter: filterQuery || undefined,
  })

  // Mutations
  const bulkDeleteMutation = useBulkDeleteGobyFingerprints()
  const deleteAllMutation = useDeleteAllGobyFingerprints()

  // 搜索状态
  React.useEffect(() => {
    if (!isFetching && isSearching) {
      setIsSearching(false)
    }
  }, [isFetching, isSearching])

  const handleFilterChange = (value: string) => {
    setIsSearching(true)
    setFilterQuery(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  // 格式化日期
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString(getDateLocale(locale), {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  // 导出
  const handleExport = async () => {
    try {
      const blob = await FingerprintService.exportGobyFingerprints()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `goby-fingerprints-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(tFingerprints("toast.exportSuccess"))
    } catch (error: any) {
      toast.error(error.message || tFingerprints("toast.exportFailed"))
    }
  }

  // 批量删除
  const handleBulkDelete = async () => {
    if (selectedFingerprints.length === 0) return

    try {
      const ids = selectedFingerprints.map((f) => f.id)
      const result = await bulkDeleteMutation.mutateAsync(ids)
      toast.success(tFingerprints("toast.deleteSuccess", { count: result.deleted }))
      setSelectedFingerprints([])
    } catch (error: any) {
      toast.error(error.message || tFingerprints("toast.deleteFailed"))
    }
  }

  // 删除所有
  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllMutation.mutateAsync()
      toast.success(tFingerprints("toast.deleteSuccess", { count: result.deleted }))
    } catch (error: any) {
      toast.error(error.message || tFingerprints("toast.deleteFailed"))
    }
  }

  // 列定义
  const columns = useMemo(
    () => createGobyFingerprintColumns({ formatDate, t: translations }),
    [translations]
  )

  // 转换数据
  const fingerprints: GobyFingerprint[] = useMemo(() => {
    if (!data?.results) return []
    return data.results
  }, [data])

  // 稳定 paginationInfo 引用，避免不必要的重新渲染
  const total = data?.total ?? 0
  const page = data?.page ?? 1
  const serverPageSize = data?.pageSize ?? 10
  const totalPages = data?.totalPages ?? 1
  
  const paginationInfo = useMemo(() => ({
    total,
    page,
    pageSize: serverPageSize,
    totalPages,
  }), [total, page, serverPageSize, totalPages])

  // 错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-destructive/10 p-3 mb-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{tFingerprints("loadFailed")}</h3>
        <p className="text-muted-foreground text-center mb-4">
          {error.message || tFingerprints("loadError")}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {tFingerprints("reload")}
        </button>
      </div>
    )
  }

  // 加载状态
  if (isLoading && !data) {
    return <DataTableSkeleton toolbarButtonCount={3} rows={6} columns={6} />
  }

  return (
    <>
      <GobyFingerprintDataTable
        data={fingerprints}
        columns={columns}
        onSelectionChange={setSelectedFingerprints}
        filterValue={filterQuery}
        onFilterChange={handleFilterChange}
        isSearching={isSearching}
        onAddSingle={() => setAddDialogOpen(true)}
        onAddImport={() => setImportDialogOpen(true)}
        onExport={handleExport}
        onBulkDelete={handleBulkDelete}
        onDeleteAll={handleDeleteAll}
        totalCount={data?.total || 0}
        pagination={pagination}
        paginationInfo={paginationInfo}
        onPaginationChange={setPagination}
      />

      {/* 添加指纹对话框 */}
      <GobyFingerprintDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* 导入指纹对话框 */}
      <ImportFingerprintDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={() => refetch()}
        fingerprintType="goby"
      />
    </>
  )
}
