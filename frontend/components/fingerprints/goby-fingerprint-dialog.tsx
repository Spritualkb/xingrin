"use client"

import React, { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { toast } from "sonner"
import { IconPlus, IconTrash } from "@tabler/icons-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  useCreateGobyFingerprint,
  useUpdateGobyFingerprint,
} from "@/hooks/use-fingerprints"
import type { GobyFingerprint, GobyRule } from "@/types/fingerprint.types"

interface GobyFingerprintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fingerprint?: GobyFingerprint | null
  onSuccess?: () => void
}

interface FormData {
  name: string
  logic: string
  rule: GobyRule[]
}

export function GobyFingerprintDialog({
  open,
  onOpenChange,
  fingerprint,
  onSuccess,
}: GobyFingerprintDialogProps) {
  const isEdit = !!fingerprint

  const createMutation = useCreateGobyFingerprint()
  const updateMutation = useUpdateGobyFingerprint()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      logic: "a",
      rule: [{ label: "a", feature: "", is_equal: true }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rule",
  })

  useEffect(() => {
    if (fingerprint) {
      reset({
        name: fingerprint.name,
        logic: fingerprint.logic,
        rule: fingerprint.rule.length > 0 
          ? fingerprint.rule 
          : [{ label: "a", feature: "", is_equal: true }],
      })
    } else {
      reset({
        name: "",
        logic: "a",
        rule: [{ label: "a", feature: "", is_equal: true }],
      })
    }
  }, [fingerprint, reset])

  const onSubmit = async (data: FormData) => {
    if (data.rule.length === 0) {
      toast.error("至少需要一条规则")
      return
    }

    const payload = {
      name: data.name.trim(),
      logic: data.logic.trim(),
      rule: data.rule,
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

  const addRule = () => {
    const nextLabel = String.fromCharCode(97 + fields.length) // a, b, c, ...
    append({ label: nextLabel, feature: "", is_equal: true })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑指纹" : "添加指纹"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改 Goby 指纹规则" : "添加新的 Goby 指纹规则"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">产品名称 *</Label>
            <Input
              id="name"
              placeholder="如：Apache、Nginx"
              {...register("name", { required: "产品名称不能为空" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logic">逻辑表达式 *</Label>
            <Input
              id="logic"
              placeholder="如：a||b、(a&&b)||c"
              {...register("logic", { required: "逻辑表达式不能为空" })}
            />
            <p className="text-xs text-muted-foreground">
              使用 && 表示 AND，|| 表示 OR，支持括号
            </p>
            {errors.logic && (
              <p className="text-sm text-destructive">{errors.logic.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>规则列表 *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRule}>
                <IconPlus className="h-4 w-4 mr-1" />
                添加规则
              </Button>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2 p-3 border rounded-md">
                  <div className="flex-shrink-0 w-16">
                    <Label className="text-xs">标签</Label>
                    <Input
                      {...register(`rule.${index}.label` as const, { required: true })}
                      placeholder="a"
                      className="h-8"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">特征</Label>
                    <Input
                      {...register(`rule.${index}.feature` as const, { required: true })}
                      placeholder="匹配特征字符串"
                      className="h-8"
                    />
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <Label className="text-xs">匹配</Label>
                    <Checkbox
                      checked={field.is_equal}
                      onCheckedChange={(checked) => {
                        const newRule = [...fields]
                        newRule[index] = { ...newRule[index], is_equal: !!checked }
                      }}
                      {...register(`rule.${index}.is_equal` as const)}
                    />
                  </div>
                  <div className="flex-shrink-0 pt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <IconTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
