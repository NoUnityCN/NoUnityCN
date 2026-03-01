"use client";

import { Download, Share, Box, Apple} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type VersionDictionary = Record<string, string[]>;

export default function UnityhubPage() {

  // @ts-ignore
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">下载 Unity Hub</h2>
            <p className="text-lg text-gray-600">在这里下载Unity Hub，管理您的Unity Editor以及项目</p>
          </div>

          {/* 下载卡片 */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Unity Hub</CardTitle>
                <Badge>国际</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4"></p>
                <div className="space-y-4">
                  <Button className="w-full" size="lg" href="https://github.com/NoUnityCN/service/releases/download/unityhub/UnityHubSetup.exe">
                    <Download className="w-5 h-5 mr-2"/>
                    Windows
                  </Button>
                  <Button className="w-full" size="lg" href="https://github.com/NoUnityCN/service/releases/download/unityhub/UnityHubSetup.dmg">
                    <Download className="w-5 h-5 mr-2"/>
                    Mac OS
                  </Button>
                  <Button className="w-full" size="lg" href="https://github.com/NoUnityCN/service/releases/download/unityhub/UnityHubSetupBeta-arm64.dmg">
                    <Download className="w-5 h-5 mr-2"/>
                    Mac OS (ARM64)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Unity Hub 中国版</CardTitle>
                <Badge>中国</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4"></p>
                <div className="space-y-4">
                  <Button className="w-full" size="lg" href="https://public-cdn.cloud.unitychina.cn/hub/prod/UnityHubSetup.exe">
                    <Download className="w-5 h-5 mr-2"/>
                    Windows
                  </Button>
                  <Button className="w-full" size="lg" href="https://public-cdn.cloud.unitychina.cn/hub/prod/UnityHubSetup.dmg">
                    <Download className="w-5 h-5 mr-2"/>
                    Mac OS
                  </Button>
                  <Button className="w-full" size="lg" href="https://public-cdn.cloud.unitychina.cn/hub/prod/UnityHubSetupBeta-arm64.dmg">
                    <Download className="w-5 h-5 mr-2"/>
                    Mac OS (ARM64)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">Unity Hub Linux版</CardTitle>
                <Badge>全球</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4"></p>
                <div className="space-y-4">
                  <Button className="w-full" size="lg" href="https://docs.unity3d.com/hub/manual/InstallHub.html#install-hub-linux">
                    <Share className="w-5 h-5 mr-2"/>
                    Linux
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </main>
    </div>
  );
}
