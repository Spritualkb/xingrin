"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Lottie from "lottie-react"
import securityAnimation from "@/public/animations/Security000-Purple.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useLogin, useAuth } from "@/hooks/use-auth"
import { useRoutePrefetch } from "@/hooks/use-route-prefetch"

export default function LoginPage() {
  // 在登录页面预加载所有页面组件
  useRoutePrefetch()
  const router = useRouter()
  const { data: auth, isLoading: authLoading } = useAuth()
  const { mutate: login, isPending } = useLogin()
  
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")

  // 如果已登录，跳转到 dashboard
  React.useEffect(() => {
    if (auth?.authenticated) {
      router.push("/dashboard/")
    }
  }, [auth, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ username, password })
  }

  // 加载中显示 spinner
  if (authLoading) {
    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background">
        <Spinner className="size-8 text-primary" />
        <p className="text-muted-foreground text-sm" suppressHydrationWarning>loading...</p>
      </div>
    )
  }

  // 已登录不显示登录页
  if (auth?.authenticated) {
    return null
  }

  return (
    <div className="login-bg flex min-h-svh flex-col p-6 md:p-10">
      {/* 主要内容区域 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm md:max-w-4xl">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                <FieldGroup>
                  {/* 指纹标识 - 用于 FOFA/Shodan 等搜索引擎识别 */}
                  <meta name="generator" content="Xingrin ASM Platform" />
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">XingRin - 星环</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      自动化资产发现与漏洞扫描平台
                    </p> 
                  </div>
                  <Field>
                    <FieldLabel htmlFor="username">用户名</FieldLabel>
                    <Input
                      id="username"
                      type="text"
                      placeholder="请输入账户名"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">密码</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? "登录中..." : "登录"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
              <div className="bg-primary/5 relative hidden md:flex md:items-center md:justify-center">
                <div className="text-center p-4">
                  <Lottie 
                    animationData={securityAnimation} 
                    loop={true}
                    className="w-96 h-96 mx-auto"
                  />
                  {/* <h2 className="text-xl font-semibold text-primary/60 mt-2">安全扫描平台</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Web 应用漏洞扫描与资产管理
                    </p> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 版本号 - 固定在页面底部 */}
      <div className="flex-shrink-0 text-center py-4">
        <p className="text-xs text-muted-foreground">
          {process.env.NEXT_PUBLIC_VERSION || 'dev'}
        </p>
      </div>
    </div>
  )
}
