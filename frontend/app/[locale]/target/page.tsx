"use client"

import { AllTargetsDetailView } from "@/components/target/all-targets-detail-view"
import { Target } from "lucide-react"
import { useTranslations } from "next-intl"

export default function AllTargetsPage() {
  const t = useTranslations("pages.target")

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target />
            {t("title")}
          </h2>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 lg:px-6">
        <AllTargetsDetailView />
      </div>
    </div>
  )
}
