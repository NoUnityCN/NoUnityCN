import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users} from "lucide-react"
import {Badge} from "@/components/ui/badge";

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">加入社区</h1>
            <p className="text-xl text-gray-600">与其他开发者交流，分享经验，获取帮助</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  Github
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">查看NoUnityCN的源代码、报告问题</p>
                <Button className="w-full" href="https://github.com/NoUnityCN/NoUnityCN">访问</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  NoUnityCN 讨论区
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">提出需要的功能、分享你的看法</p>
                <Button className="w-full" href="https://github.com/NoUnityCN/NoUnityCN/discussions">访问</Button>
              </CardContent>
            </Card>

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
                    <MessageCircle className="h-6 w-6" />
                    Unity Discussions
                  </div>
                  <Badge>国际</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 mb-4">访问Unity Discussions、和全球开发者讨论</p>
                <Button className="w-full" href="https://discussions.unity.com/">访问</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-6 w-6" />
                    团结引擎 开发者中心
                  </div>
                  <Badge>中国</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 mb-4">访问团结引擎开发者中心</p>
                <Button className="w-full" href="https://developer.unity.cn/">访问</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-6 w-6" />
                    Unity 学习中心
                  </div>
                  <Badge>国际</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 mb-4">在线学习 Unity 游戏开发</p>
                <Button className="w-full" href="https://learn.unity.com/">访问</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-6 w-6" />
                    团结引擎 中文课堂
                  </div>
                  <Badge>中国</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 mb-4">在线学习 团结引擎 游戏开发</p>
                <Button className="w-full" href="https://learn.u3d.cn/">访问</Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}

