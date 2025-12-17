"use client"

import { SystemLogsView } from "@/components/settings/system-logs"

export default function SystemLogsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">系统日志</h1>
        <p className="text-muted-foreground">每秒自动刷新一次（轮询模式）</p>
      </div>
      <SystemLogsView />
    </div>
  )
}
