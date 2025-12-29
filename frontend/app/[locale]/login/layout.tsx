import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth" })

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  }
}

/**
 * 登录页面布局
 * 不包含侧边栏和头部
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
