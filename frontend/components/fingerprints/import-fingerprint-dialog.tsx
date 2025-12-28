"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone"
import {
  useImportEholeFingerprints,
  useImportGobyFingerprints,
  useImportWappalyzerFingerprints,
} from "@/hooks/use-fingerprints"

type FingerprintType = "ehole" | "goby" | "wappalyzer"

interface ImportFingerprintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  fingerprintType?: FingerprintType
}

// 指纹类型配置
const FINGERPRINT_CONFIG: Record<FingerprintType, {
  title: string
  description: string
  formatHint: string
  validate: (json: any) => { valid: boolean; error?: string }
}> = {
  ehole: {
    title: "导入 EHole 指纹",
    description: "上传 EHole 格式的 JSON 指纹文件",
    formatHint: '{"fingerprint": [...]}',
    validate: (json) => {
      if (!json.fingerprint) {
        return { valid: false, error: "无效的 EHole 格式：缺少 fingerprint 字段" }
      }
      if (!Array.isArray(json.fingerprint)) {
        return { valid: false, error: "无效的 EHole 格式：fingerprint 必须是数组" }
      }
      if (json.fingerprint.length === 0) {
        return { valid: false, error: "指纹数据为空" }
      }
      const first = json.fingerprint[0]
      if (!first.cms || !first.keyword) {
        return { valid: false, error: "无效的 EHole 格式：指纹缺少必要字段 (cms, keyword)" }
      }
      return { valid: true }
    },
  },
  goby: {
    title: "导入 Goby 指纹",
    description: "上传 Goby 格式的 JSON 指纹文件",
    formatHint: "[{...}] 或 {...}",
    validate: (json) => {
      // 支持数组和对象两种格式
      if (Array.isArray(json)) {
        if (json.length === 0) {
          return { valid: false, error: "指纹数据为空" }
        }
        const first = json[0]
        if (!first.product || !first.rule) {
          return { valid: false, error: "无效的 Goby 格式：指纹缺少必要字段 (product, rule)" }
        }
      } else if (typeof json === "object" && json !== null) {
        if (Object.keys(json).length === 0) {
          return { valid: false, error: "指纹数据为空" }
        }
      } else {
        return { valid: false, error: "无效的 Goby 格式：必须是数组或对象" }
      }
      return { valid: true }
    },
  },
  wappalyzer: {
    title: "导入 Wappalyzer 指纹",
    description: "上传 Wappalyzer 格式的 JSON 指纹文件",
    formatHint: '{"apps": {...}} 或 [{...}]',
    validate: (json) => {
      // 支持数组格式
      if (Array.isArray(json)) {
        if (json.length === 0) {
          return { valid: false, error: "指纹数据为空" }
        }
        return { valid: true }
      }
      // 支持对象格式 (apps 或 technologies)
      const apps = json.apps || json.technologies
      if (apps) {
        if (typeof apps !== "object" || Array.isArray(apps)) {
          return { valid: false, error: "无效的 Wappalyzer 格式：apps/technologies 必须是对象" }
        }
        if (Object.keys(apps).length === 0) {
          return { valid: false, error: "指纹数据为空" }
        }
        return { valid: true }
      }
      // 直接是对象格式
      if (typeof json === "object" && json !== null) {
        if (Object.keys(json).length === 0) {
          return { valid: false, error: "指纹数据为空" }
        }
        return { valid: true }
      }
      return { valid: false, error: "无效的 Wappalyzer 格式" }
    },
  },
}

export function ImportFingerprintDialog({
  open,
  onOpenChange,
  onSuccess,
  fingerprintType = "ehole",
}: ImportFingerprintDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  
  const eholeImportMutation = useImportEholeFingerprints()
  const gobyImportMutation = useImportGobyFingerprints()
  const wappalyzerImportMutation = useImportWappalyzerFingerprints()

  const config = FINGERPRINT_CONFIG[fingerprintType]
  
  const importMutation = {
    ehole: eholeImportMutation,
    goby: gobyImportMutation,
    wappalyzer: wappalyzerImportMutation,
  }[fingerprintType]

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }

  const handleImport = async () => {
    if (files.length === 0) {
      toast.error("请先选择文件")
      return
    }

    const file = files[0]

    // 前端基础校验
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      const validation = config.validate(json)
      if (!validation.valid) {
        toast.error(validation.error)
        return
      }
    } catch (e) {
      toast.error("无效的 JSON 文件")
      return
    }

    // 校验通过，提交到后端
    try {
      const result = await importMutation.mutateAsync(file)
      toast.success(`导入成功：创建 ${result.created} 条，失败 ${result.failed} 条`)
      setFiles([])
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || "导入失败")
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setFiles([])
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Dropzone
            src={files}
            onDrop={handleDrop}
            accept={{ "application/json": [".json"] }}
            maxFiles={1}
            maxSize={50 * 1024 * 1024}  // 50MB
            onError={(error) => toast.error(error.message)}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>

          <p className="text-xs text-muted-foreground mt-3">
            支持的 JSON 格式：{" "}
            <code className="bg-muted px-1 rounded">
              {config.formatHint}
            </code>
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            取消
          </Button>
          <Button
            onClick={handleImport}
            disabled={files.length === 0 || importMutation.isPending}
          >
            {importMutation.isPending ? "导入中..." : "导入"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
