"use client"

import React, { useState, useMemo } from "react"
import { Play, Settings2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingSpinner } from "@/components/loading-spinner"
import { cn } from "@/lib/utils"
import { CAPABILITY_CONFIG, getEngineIcon, parseEngineCapabilities } from "@/lib/engine-config"

import type { Organization } from "@/types/organization.types"

import { initiateScan } from "@/services/scan.service"
import { toast } from "sonner"
import { useEngines } from "@/hooks/use-engines"

interface InitiateScanDialogProps {
  organization?: Organization | null
  organizationId?: number
  targetId?: number
  targetName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function InitiateScanDialog({
  organization,
  organizationId,
  targetId,
  targetName,
  open,
  onOpenChange,
  onSuccess,
}: InitiateScanDialogProps) {
  const t = useTranslations("scan.initiate")
  const tToast = useTranslations("toast")
  const tCommon = useTranslations("common.actions")
  const [selectedEngineIds, setSelectedEngineIds] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: engines, isLoading, error } = useEngines()

  const selectedEngines = useMemo(() => {
    if (!selectedEngineIds.length || !engines) return []
    return engines.filter((e) => selectedEngineIds.includes(e.id))
  }, [selectedEngineIds, engines])

  const selectedCapabilities = useMemo(() => {
    if (!selectedEngines.length) return []
    const allCaps = new Set<string>()
    selectedEngines.forEach((engine) => {
      parseEngineCapabilities(engine.configuration || "").forEach((cap) => allCaps.add(cap))
    })
    return Array.from(allCaps)
  }, [selectedEngines])

  const handleEngineToggle = (engineId: number, checked: boolean) => {
    if (checked) {
      setSelectedEngineIds((prev) => [...prev, engineId])
    } else {
      setSelectedEngineIds((prev) => prev.filter((id) => id !== engineId))
    }
  }

  const handleInitiate = async () => {
    if (!selectedEngineIds.length) return
    if (!organizationId && !targetId) {
      toast.error(tToast("paramError"), { description: tToast("paramErrorDesc") })
      return
    }
    setIsSubmitting(true)
    try {
      const response = await initiateScan({
        organizationId,
        targetId,
        engineIds: selectedEngineIds,
      })
      
      // 后端返回 201 说明成功创建扫描任务
      const scanCount = response.scans?.length || response.count || 0
      toast.success(tToast("scanInitiated"), {
        description: response.message || tToast("scanInitiatedDesc", { count: scanCount }),
      })
      onSuccess?.()
      onOpenChange(false)
      setSelectedEngineIds([])
    } catch (err: unknown) {
      console.error("Failed to initiate scan:", err)
      // 处理配置冲突错误
      const error = err as { response?: { data?: { error?: { code?: string; message?: string } } } }
      if (error?.response?.data?.error?.code === 'CONFIG_CONFLICT') {
        toast.error(tToast("configConflict"), {
          description: error.response.data.error.message,
        })
      } else {
        toast.error(tToast("initiateScanFailed"), {
          description: err instanceof Error ? err.message : tToast("unknownError"),
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen) setSelectedEngineIds([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-[900px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {t("title")}
            <span className="text-sm font-normal text-muted-foreground">
              {targetName ? (
                <>
                  {t("targetDesc")} <span className="font-medium text-foreground">{targetName}</span> {t("selectEngine")}
                </>
              ) : (
                <>
                  {t("orgDesc")} <span className="font-medium text-foreground">{organization?.name}</span> {t("selectEngine")}
                </>
              )}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex border-t h-[480px]">
          {/* Left side engine list */}
          <div className="w-[260px] border-r flex flex-col shrink-0">
            <div className="px-4 py-3 border-b bg-muted/30 shrink-0">
              <h3 className="text-sm font-medium">
                {t("selectEngineTitle")}
                {selectedEngineIds.length > 0 && (
                  <span className="text-xs text-muted-foreground font-normal ml-2">
                    {t("selectedCount", { count: selectedEngineIds.length })}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-2 text-sm text-muted-foreground">{t("loading")}</span>
                  </div>
                ) : error ? (
                  <div className="py-8 text-center text-sm text-destructive">{t("loadFailed")}</div>
                ) : !engines?.length ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">{t("noEngines")}</div>
                ) : (
                  <div className="space-y-1">
                    {engines.map((engine) => {
                      const capabilities = parseEngineCapabilities(engine.configuration || "")
                      const EngineIcon = getEngineIcon(capabilities)
                      const primaryCap = capabilities[0]
                      const iconConfig = primaryCap ? CAPABILITY_CONFIG[primaryCap] : null
                      const isSelected = selectedEngineIds.includes(engine.id)

                      return (
                        <label
                          key={engine.id}
                          htmlFor={`engine-${engine.id}`}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                            isSelected
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-muted/50 border border-transparent"
                          )}
                        >
                          <Checkbox
                            id={`engine-${engine.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleEngineToggle(engine.id, checked as boolean)}
                            disabled={isSubmitting}
                          />
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-md shrink-0",
                              iconConfig?.color || "bg-muted text-muted-foreground"
                            )}
                          >
                            <EngineIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{engine.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {capabilities.length > 0 ? t("capabilities", { count: capabilities.length }) : t("noConfig")}
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side engine details */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-0">
            {selectedEngines.length > 0 ? (
              <>
                <div className="px-4 py-3 border-b bg-muted/30 shrink-0 min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCapabilities.map((capKey) => {
                      const config = CAPABILITY_CONFIG[capKey]
                      return (
                        <Badge key={capKey} variant="outline" className={cn("text-xs", config?.color)}>
                          {config?.label || capKey}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden p-4 min-w-0">
                  <div className="flex-1 bg-muted/50 rounded-lg border overflow-hidden min-h-0 min-w-0">
                    <pre className="h-full p-3 text-xs font-mono overflow-auto whitespace-pre-wrap break-all">
                      {selectedEngines.map((e) => e.configuration || `# ${t("noConfig")}`).join("\n\n")}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Settings2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t("selectEngineHint")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleInitiate} disabled={!selectedEngineIds.length || isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                {t("initiating")}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {t("startScan")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
