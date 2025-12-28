"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateWappalyzerFingerprint,
  useUpdateWappalyzerFingerprint,
} from "@/hooks/use-fingerprints"
import type { WappalyzerFingerprint } from "@/types/fingerprint.types"

interface WappalyzerFingerprintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fingerprint?: WappalyzerFingerprint | null
  onSuccess?: () => void
}

interface FormData {
  name: string
  cats: string  // 逗号分隔的数字
  description: string
  website: string
  cpe: string
  cookies: string  // JSON 字符串
  headers: string  // JSON 字符串
  scriptSrc: string  // 逗号分隔
  html: string  // 逗号分隔
  implies: string  // 逗号分隔
}

export function WappalyzerFingerprintDialog({
  open,
  onOpenChange,
  fingerprint,
  onSuccess,
}: WappalyzerFingerprintDialogProps) {
  const isEdit = !!fingerprint

  const createMutation = useCreateWappalyzerFingerprint()
  const updateMutation = useUpdateWappalyzerFingerprint()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      cats: "",
      description: "",
      website: "",
      cpe: "",
      cookies: "{}",
      headers: "{}",
      scriptSrc: "",
      html: "",
      implies: "",
    },
  })

  useEffect(() => {
    if (fingerprint) {
      reset({
        name: fingerprint.name,
        cats: fingerprint.cats?.join(", ") || "",
        description: fingerprint.description || "",
        website: fingerprint.website || "",
        cpe: fingerprint.cpe || "",
        cookies: JSON.stringify(fingerprint.cookies || {}, null, 2),
        headers: JSON.stringify(fingerprint.headers || {}, null, 2),
        scriptSrc: fingerprint.scriptSrc?.join(", ") || "",
        html: fingerprint.html?.join(", ") || "",
        implies: fingerprint.implies?.join(", ") || "",
      })
    } else {
      reset({
        name: "",
        cats: "",
        description: "",
        website: "",
        cpe: "",
        cookies: "{}",
        headers: "{}",
        scriptSrc: "",
        html: "",
        implies: "",
      })
    }
  }, [fingerprint, reset])

  const parseArray = (str: string): string[] => {
    return str.split(",").map(s => s.trim()).filter(s => s.length > 0)
  }

  const parseNumberArray = (str: string): number[] => {
    return str.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
  }

  const parseJson = (str: string): Record<string, any> => {
    try {
      return JSON.parse(str)
    } catch {
      return {}
    }
  }

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name.trim(),
      cats: parseNumberArray(data.cats),
      description: data.description.trim(),
      website: data.website.trim(),
      cpe: data.cpe.trim(),
      cookies: parseJson(data.cookies),
      headers: parseJson(data.headers),
      script_src: parseArray(data.scriptSrc),
      html: parseArray(data.html),
      implies: parseArray(data.implies),
      js: [],
      meta: {},
    }

    try {
      if (isEdit && fingerprint) {
        await updateMutation.mutateAsync({ id: fingerprint.id, data: payload })
        toast.success("更新成功")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("创建成功")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || (isEdit ? "更新失败" : "创建失败"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑指纹" : "添加指纹"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改 Wappalyzer 指纹规则" : "添加新的 Wappalyzer 指纹规则"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">应用名称 *</Label>
              <Input
                id="name"
                placeholder="如：WordPress、React"
                {...register("name", { required: "应用名称不能为空" })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cats">分类 ID</Label>
              <Input
                id="cats"
                placeholder="如：1, 6, 12"
                {...register("cats")}
              />
              <p className="text-xs text-muted-foreground">多个 ID 用逗号分隔</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="应用描述"
              rows={2}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">官网</Label>
              <Input
                id="website"
                placeholder="https://example.com"
                {...register("website")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpe">CPE</Label>
              <Input
                id="cpe"
                placeholder="cpe:/a:vendor:product"
                {...register("cpe")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cookies">Cookies 检测规则 (JSON)</Label>
            <Textarea
              id="cookies"
              placeholder='{"cookie_name": "pattern"}'
              rows={2}
              className="font-mono text-sm"
              {...register("cookies")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headers">Headers 检测规则 (JSON)</Label>
            <Textarea
              id="headers"
              placeholder='{"header-name": "pattern"}'
              rows={2}
              className="font-mono text-sm"
              {...register("headers")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scriptSrc">Script URL 正则</Label>
            <Input
              id="scriptSrc"
              placeholder="pattern1, pattern2"
              {...register("scriptSrc")}
            />
            <p className="text-xs text-muted-foreground">多个正则用逗号分隔</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="html">HTML 内容正则</Label>
            <Input
              id="html"
              placeholder="pattern1, pattern2"
              {...register("html")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="implies">依赖关系</Label>
            <Input
              id="implies"
              placeholder="PHP, MySQL"
              {...register("implies")}
            />
            <p className="text-xs text-muted-foreground">多个依赖用逗号分隔</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : isEdit ? "更新" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
