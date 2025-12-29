"use client"

// 导入组织管理组件
import { OrganizationList } from "@/components/organization/organization-list"
// 导入图标
import { Building2 } from "lucide-react"
import { useTranslations } from "next-intl"

/**
 * 组织管理页面
 * 资产管理下的组织管理子页面，显示组织列表和相关操作
 */
export default function OrganizationPage() {
  const t = useTranslations("pages.organization")

  return (
    // 内容区域，包含组织管理功能
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 />
            {t("title")}
          </h2>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      {/* 组织列表组件 */}
      <div className="px-4 lg:px-6">
        <OrganizationList />
      </div>
    </div>
  )
}
