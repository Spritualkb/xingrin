"use client"

import { useTranslations } from "next-intl"
import { SystemLogsView } from "@/components/settings/system-logs"

export default function SystemLogsPage() {
  const t = useTranslations("settings.systemLogs")

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <SystemLogsView />
    </div>
  )
}
