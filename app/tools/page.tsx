import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users} from "lucide-react"
import {Badge} from "@/components/ui/badge";

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">工具</h1>
            <p className="text-xl text-gray-600">一些在线小工具</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* 模板 带有标签的卡片 */}

            {/*<Card>*/}
            {/*  <CardHeader>*/}
            {/*    <CardTitle className="flex justify-between">*/}
            {/*      <div className="flex items-center gap-2">*/}
            {/*        <MessageCircle className="h-6 w-6" />*/}
            {/*        标题*/}
            {/*      </div>*/}
            {/*      <Badge>标签</Badge>*/}
            {/*    </CardTitle>*/}
            {/*  </CardHeader>*/}

            {/*  <CardContent>*/}
            {/*    <p className="text-gray-600 mb-4">简介</p>*/}
            {/*    <Button className="w-full" href="https://unity.com/">访问</Button>*/}
            {/*  </CardContent>*/}
            {/*</Card>*/}

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <div className="flex items-center gap-2">
                    UnityHub modules.json 生成器
                  </div>
                  <Badge>测试</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 mb-4">用于生成 modules.json 文件</p>
                <Button className="w-full" href="./UnityModule">使用</Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

