"use client";
import { Download, Share, Box, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type VersionDictionary = Record<string, string[]>;

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 检查cookie是否存在
    if (!getCookie('dismissPrompt')) {
      setIsModalOpen(true);
    }
  }, []);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2
      ? parts.pop()?.split(';').shift()
      : null;
  };

  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  const handleClose = () => setIsModalOpen(false);
  const handleDismiss = () => {
    setCookie('dismissPrompt', 'true', 365);
    handleClose();
  };

  const [versionsData, setVersionsData] = useState<Record<string, VersionDictionary>>({});
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("all");
  const [versionType, setVersionType] = useState("LTS");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{type: string, url: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllVersions = async () => {
      setIsLoading(true);
      try {
        const types = ["LTS", "TECH", "BETA", "ALPHA"];
        const allData: Record<string, VersionDictionary> = {};
        
        for (const type of types) {
          try {
            const response = await fetch(`./version/${type}.json`);
            if (response.ok) {
              const contentType = response.headers.get('content-type');
              if (contentType?.includes('application/json')) {
                allData[type] = await response.json();
              }
            }
          } catch (error) {
            console.error(`加载 ${type} 版本失败:`, error);
          }
        }
        
        if (Object.keys(allData).length === 0) {
          allData["LTS"] = { "6000": ["unityhub://6000.0.38f1/82314a941f2d"] };
        }
        
        setVersionsData(allData);
      } catch (error) {
        console.error('加载版本失败:', error);
        setVersionsData({
          "LTS": { "6000": ["unityhub://6000.0.38f1/82314a941f2d"] }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllVersions();
  }, []);

  const versions = versionsData[versionType] || {};

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const results: Array<{type: string, url: string}> = [];
      
      const typeOrder = ["LTS", "TECH", "BETA", "ALPHA"];
      
      for (const type of typeOrder) {
        const typeVersions = versionsData[type] || {};
        
        for (const year in typeVersions) {
          for (const url of typeVersions[year]) {
            const versionName = getVersionName(url);
            if (versionName.toLowerCase().includes(searchQuery.toLowerCase())) {
              results.push({ type, url });
            }
          }
        }
      }

      results.sort((a, b) => {
        const aVersion = a.url.split("://")[1].split("/")[0];
        const bVersion = b.url.split("://")[1].split("/")[0];
        
        const aMain = parseInt(aVersion.split(".")[0]);
        const bMain = parseInt(bVersion.split(".")[0]);
        if (aMain !== bMain) return bMain - aMain;
        
        const typeIndexA = typeOrder.indexOf(a.type);
        const typeIndexB = typeOrder.indexOf(b.type);
        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
        
        const aRev = aVersion.split(".")[1];
        const bRev = bVersion.split(".")[1];
        return bRev.localeCompare(aRev);
      });
      
      setSearchResults(results);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, versionsData]);

  function getLatestVersion(type: string = "LTS"): string {
    const typeVersions = versionsData[type] || {};
    const availableYears = Object.keys(typeVersions)
        .map(Number)
        .sort((a, b) => b - a);

    if (availableYears.length === 0) return "unityhub://6000.0.38f1/82314a941f2d";

    const latestYear = availableYears[0].toString();
    const yearVersions = typeVersions[latestYear];

    if (!yearVersions || yearVersions.length === 0) {
      return "unityhub://6000.0.38f1/82314a941f2d";
    }

    return yearVersions.sort((a, b) => {
      const aVer = a.split('/')[2].split('.')[1];
      const bVer = b.split('/')[2].split('.')[1];
      return bVer.localeCompare(aVer);
    })[0];
  }

  function getVersionName(url: string) {
    const version = url.split("://")[1].split("/")[0];
    return `Unity ${version}`;
  }

  const filterVersions = (versions: string[]) => {
    if (!searchQuery) return versions;
    return versions.filter(url => 
      getVersionName(url).toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderVersionItem = (url: string, type?: string) => (
    <div className="overflow-x-auto" key={`${type || versionType}-${url}`}>
      <li className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-grow"
          size="lg"
          href={`./download?v=${url}`}
        >
          <Download className="w-5 h-5 mr-2"/>
          {type ? <><span className="font-bold">[{type}]</span> {getVersionName(url)} </> : getVersionName(url)}下载
        </Button>
        <Button
          className="flex-initial"
          size="lg"
          href={`./component?v=${url}`}
        >
          <Box className="w-5 h-5 mr-2"/>
          添加组件
        </Button>
      </li>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded shadow-lg max-w-md text-gray-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {`
在访问之前，我们希望您能了解以下事项：

NoUnityCN是一项大家一起实现的**开源**项目，我们旨在为有中文使用需求的**海外Unity开发者**提供Unity Editor版本检索服务，我们不会保留任何数据。

“Unity”、Unity 徽标及其他 Unity 商标是 Unity Technologies 或其在美国和其他地区的分支机构的商标或注册商标。NoUnityCN不是Unity Technologies (优三缔科技有限公司) 软件提供的一项服务。

NoUnityCN**不是破解、修改、下载工具**，而只是一个方便检索Unity版本的开源项目，仅供学习交流使用。

我们尊重任何内容的版权，我们不会提供任何盗版、破解版相关服务，如果我们的内容侵害到您的权益，请及时联系我们删除。

我们面向的开发者群体是**在华办公的海外开发者或使用中文作为工作语言的海外开发者及需要运程协助工作的开发者**，而**不为大中华区（包含中国大陆及港澳台区域）本土开发者提供服务**，对于后者，我们更推荐使用[团结引擎（点击访问）](https://unity.cn/).
`}
              </ReactMarkdown>
              <div className="flex gap-4 mt-6">
                <Button className="w-full" size="lg" onClick={handleClose}>
                   确认
                </Button>
                <Button variant="secondary" className="w-full" size="lg" onClick={handleDismiss}>
                  不再显示
                </Button>
              </div>
            </div>
          </div>
      )}
      <SiteHeader/>
      <main className="flex-1">
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <div className="text-center">
              <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent rounded-full mb-2"></div>
              <p className="text-lg text-gray-700">加载中...</p>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">下载 Unity Engine</h2>
            <p className="text-lg text-gray-600">选择适合您的版本开始创作</p>
          </div>

          <div className="flex justify-center space-x-4 mb-8">
            {[
              { id: "LTS", name: "长期支持" },
              { id: "TECH", name: "技术支持" },
              { id: "BETA", name: "测试版" },
              { id: "ALPHA", name: "预览版" }
            ].map((type) => (
              <Button
                key={type.id}
                variant={versionType === type.id ? "default" : "outline"}
                onClick={() => {
                  setVersionType(type.id);
                  setSelectedVersion("all"); // 切换版本类型时重置为所有版本
                  if (searchQuery) {
                    setSearchQuery("");
                  }
                }}
              >
                {type.name}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">
                  {versionType === "LTS" && "长期支持版本"}
                  {versionType === "TECH" && "技术支持版本"}
                  {versionType === "BETA" && "测试版本"}
                  {versionType === "ALPHA" && "预览版本"}
                </CardTitle>
                <Badge>{versionType}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{getVersionName(getLatestVersion(versionType))}</p>
                <div className="space-y-4">
                  <Button className="w-full" size="lg" href={`./download?v=${getLatestVersion(versionType)}`}>
                    <Download className="w-5 h-5 mr-2"/>
                    立刻下载
                  </Button>
                  <Button variant="secondary" className="w-full" size="lg" href={`./component?v=${getLatestVersion(versionType)}`}>
                    <Box className="w-5 h-5 mr-2"/>
                    添加组件
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">团结引擎</CardTitle>
                <Badge>中国</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">下载Unity的中国版本</p>
                <p className="text-gray-600 mb-4">请注意：您可以将您的项目从Unity迁移到团结引擎，但目前不支持从团结引擎迁移到Unity。</p>
                <div className="space-y-4">
                  <Button variant="secondary" className="w-full" size="lg" href="https://unity.cn/releases">
                    <Share className="w-5 h-5 mr-2"/>
                    前往官网
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>
                {isSearching
                  ? `全局搜索结果 "${searchQuery}"`
                  : `所有${versionType === "LTS" ? "长期支持" : 
                         versionType === "TECH" ? "技术支持" : 
                         versionType === "BETA" ? "测试" : 
                         versionType === "ALPHA" ? "预览" : ""}版本`
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Input
                  type="text"
                  placeholder="全局搜索版本..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>

              {!isSearching && (
                <div className="flex space-x-4 mb-4 overflow-x-auto flex-nowrap pb-2">
                  <Button
                    key="all"
                    variant={selectedVersion === "all" ? "default" : "outline"}
                    onClick={() => setSelectedVersion("all")}
                  >
                    所有版本
                  </Button>
                  {Object.keys(versions)
                    .sort((a, b) => parseInt(b) - parseInt(a)) // 对年份进行排序
                    .map((year) => (
                      <Button
                        key={year}
                        variant={selectedVersion === year ? "default" : "outline"}
                        onClick={() => setSelectedVersion(year)}
                      >
                        {year} 系列
                      </Button>
                    ))}
                </div>
              )}

              <ul className="space-y-4">
                {isSearching ? (
                  <>
                    {searchResults.length > 0 ? (
                      searchResults
                        .slice(0, showAllVersions ? undefined : 10)
                        .map(item => renderVersionItem(item.url, item.type))
                    ) : (
                      <li className="text-center text-gray-500 py-4">
                        没有找到匹配的版本
                      </li>
                    )}

                    {!showAllVersions && searchResults.length > 10 && (
                      <li>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setShowAllVersions(true)}
                        >
                          显示更多搜索结果 ({searchResults.length - 10} 个) ↓
                        </Button>
                      </li>
                    )}
                  </>
                ) : (
                  <>
                    {selectedVersion === "all"
                      ? Object.keys(versions)
                        .sort((a, b) => parseInt(b) - parseInt(a))
                        .flatMap(year => versions[year])
                        .filter(url => !searchQuery || getVersionName(url).toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, showAllVersions ? undefined : 5) // 控制显示数量
                        .map(url => renderVersionItem(url))
                      : filterVersions(versions[selectedVersion] || []).map(url => renderVersionItem(url))}

                    {!showAllVersions && selectedVersion === "all" && (
                      Object.keys(versions)
                        .flatMap(year => versions[year])
                        .filter(url => !searchQuery || getVersionName(url).toLowerCase().includes(searchQuery.toLowerCase()))
                        .length > 5
                    ) && (
                      <li>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setShowAllVersions(true)}
                        >
                          显示更多版本 ({Object.keys(versions)
                            .flatMap(year => versions[year])
                            .filter(url => !searchQuery || getVersionName(url).toLowerCase().includes(searchQuery.toLowerCase()))
                            .length} 个) ↓
                        </Button>
                      </li>
                    )}

                    {((selectedVersion === "all" &&
                      Object.keys(versions)
                        .flatMap(year => versions[year])
                        .filter(url => !searchQuery || getVersionName(url).toLowerCase().includes(searchQuery.toLowerCase()))
                        .length === 0) ||
                      (selectedVersion !== "all" && filterVersions(versions[selectedVersion] || []).length === 0)) &&
                      searchQuery && (
                        <li className="text-center text-gray-500 py-4">
                          没有找到匹配的版本
                        </li>
                    )}
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter/>
    </div>
  );
}
