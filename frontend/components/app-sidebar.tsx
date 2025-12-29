"use client" // 标记为客户端组件,可以使用浏览器 API 和交互功能

// 导入 React 库
import type * as React from "react"
// 导入 Tabler Icons 图标库中的各种图标
import {
  IconDashboard, // 仪表板图标
  IconHelp, // 帮助图标
  IconListDetails, // 列表详情图标
  IconSettings, // 设置图标
  IconUsers, // 用户图标
  IconChevronRight, // 右箭头图标
  IconRadar, // 雷达扫描图标
  IconTool, // 工具图标
  IconServer, // 服务器图标
  IconTerminal2, // 终端图标
  IconBug, // 漏洞图标
} from "@tabler/icons-react"
// 导入国际化 hook
import { useTranslations } from 'next-intl'
// 导入国际化导航组件
import { Link, usePathname } from '@/i18n/navigation'

// 导入自定义导航组件
import { NavSystem } from "@/components/nav-system"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
// 导入侧边栏 UI 组件
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar"
// 导入折叠组件
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

/**
 * 应用侧边栏组件
 * 显示应用的主要导航菜单,包括用户信息、主菜单、文档和次要菜单
 * 支持子菜单的展开和折叠功能
 * @param props - Sidebar 组件的所有属性
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  const normalize = (p: string) => (p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p)
  const current = normalize(pathname)

  // 用户信息
  const user = {
    name: "admin",
    email: "admin@admin.com",
    avatar: "",
  }

  // 主导航菜单项 - 使用翻译
  const navMain = [
    {
      title: t('dashboard'),
      url: "/dashboard/",
      icon: IconDashboard,
    },
    {
      title: t('organization'),
      url: "/organization/",
      icon: IconUsers,
    },
    {
      title: t('target'),
      url: "/target/",
      icon: IconListDetails,
    },
    {
      title: t('vulnerabilities'),
      url: "/vulnerabilities/",
      icon: IconBug,
    },
    {
      title: t('scan'),
      url: "/scan/",
      icon: IconRadar,
      items: [
        {
          title: t('scanHistory'),
          url: "/scan/history/",
        },
        {
          title: t('scheduledScan'),
          url: "/scan/scheduled/",
        },
        {
          title: t('scanEngine'),
          url: "/scan/engine/",
        },
      ],
    },
    {
      title: t('tools'),
      url: "/tools/",
      icon: IconTool,
      items: [
        {
          title: t('wordlists'),
          url: "/tools/wordlists/",
        },
        {
          title: t('fingerprints'),
          url: "/tools/fingerprints/",
        },
        {
          title: t('nucleiTemplates'),
          url: "/tools/nuclei/",
        },
      ],
    },
  ]

  // 次要导航菜单项
  const navSecondary = [
    {
      title: t('help'),
      url: "https://github.com/yyhuni/xingrin",
      icon: IconHelp,
    },
  ]

  // 系统设置相关菜单项
  const documents = [
    {
      name: t('workers'),
      url: "/settings/workers/",
      icon: IconServer,
    },
    {
      name: t('systemLogs'),
      url: "/settings/system-logs/",
      icon: IconTerminal2,
    },
    {
      name: t('notifications'),
      url: "/settings/notifications/",
      icon: IconSettings,
    },
  ]

  return (
    // collapsible="icon" 表示侧边栏可以折叠为仅图标模式
    <Sidebar collapsible="icon" {...props}>
      {/* 侧边栏头部 */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconRadar className="!size-5" />
                <span className="text-base font-semibold">XingRin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 侧边栏主要内容区域 */}
      <SidebarContent>
        {/* 主导航菜单 */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('mainFeatures')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                const navUrl = normalize(item.url)
                const isActive = navUrl === "/" ? current === "/" : current === navUrl || current.startsWith(navUrl + "/")
                const hasSubItems = item.items && item.items.length > 0

                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isActive}>
                          <item.icon />
                          <span>{item.title}</span>
                          <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => {
                            const subUrl = normalize(subItem.url)
                            const isSubActive = current === subUrl || current.startsWith(subUrl + "/")
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                >
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* 系统设置导航菜单 */}
        <NavSystem items={documents} />
        {/* 次要导航菜单,使用 mt-auto 推到底部 */}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* 侧边栏底部 */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
