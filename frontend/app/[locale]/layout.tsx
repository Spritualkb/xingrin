import type React from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, localeHtmlLang, type Locale } from '@/i18n/config'

// 导入全局样式文件
import "../globals.css"
// 导入思源黑体（Noto Sans SC）本地字体
import "@fontsource/noto-sans-sc/400.css"
import "@fontsource/noto-sans-sc/500.css"
import "@fontsource/noto-sans-sc/700.css"
// 导入颜色主题
import "@/styles/themes/bubblegum.css"
import "@/styles/themes/quantum-rose.css"
import "@/styles/themes/clean-slate.css"
import "@/styles/themes/cosmic-night.css"
import "@/styles/themes/vercel.css"
import "@/styles/themes/vercel-dark.css"
import "@/styles/themes/violet-bloom.css"
import "@/styles/themes/cyberpunk-1.css"
import { Suspense } from "react"
import Script from "next/script"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

// 导入公共布局组件
import { RoutePrefetch } from "@/components/route-prefetch"
import { RouteProgress } from "@/components/route-progress"
import { AuthLayout } from "@/components/auth/auth-layout"

// 动态生成元数据
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(',').map(k => k.trim()),
    generator: "Xingrin ASM Platform",
    authors: [{ name: "yyhuni" }],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: "website",
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// 使用思源黑体 + 系统字体回退，完全本地加载
const fontConfig = {
  className: "font-sans",
  style: {
    fontFamily: "'Noto Sans SC', system-ui, -apple-system, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
  }
}

// 生成静态参数，支持所有语言
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/**
 * 语言布局组件
 * 包装所有页面，提供国际化上下文
 */
export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params

  // 验证 locale 有效性
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // 启用静态渲染
  setRequestLocale(locale)

  // 加载翻译消息
  const messages = await getMessages()

  return (
    <html lang={localeHtmlLang[locale as Locale]} suppressHydrationWarning>
      <body className={fontConfig.className} style={fontConfig.style}>
        {/* 加载外部脚本 */}
        <Script
          src="https://tweakcn.com/live-preview.min.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        {/* 路由加载进度条 */}
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {/* ThemeProvider 提供主题切换功能 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* NextIntlClientProvider 提供国际化上下文 */}
          <NextIntlClientProvider messages={messages}>
            {/* QueryProvider 提供 React Query 功能 */}
            <QueryProvider>
              {/* 路由预加载 */}
              <RoutePrefetch />
              {/* AuthLayout 处理认证和侧边栏显示 */}
              <AuthLayout>
                {children}
              </AuthLayout>
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
