"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { VulnerabilitiesDetailView } from "@/components/vulnerabilities"

/**
 * 全部漏洞页面
 * 显示系统中所有漏洞
 */
export default function VulnerabilitiesPage() {
  const t = useTranslations("vulnerabilities")

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      {/* 漏洞列表 */}
      <div className="px-4 lg:px-6">
        <VulnerabilitiesDetailView />
      </div>
    </div>
  )
}
