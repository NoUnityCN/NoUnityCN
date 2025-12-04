// UnityModule/page.tsx
// 感谢 @HotYearKit 提供 C# 版本代码，没有他的贡献就没有这个模块的诞生。
// 感谢 Larusso/unity-version-manager 开源项目

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// --- 枚举类型定义 ---

enum UnityReleaseDownloadArchitecture {
    X86_64 = 'X86_64',
    ARM64 = 'ARM64'
}

enum UnityReleaseDownloadPlatform {
    MACOS = 'MACOS',
    LINUX = 'LINUX',
    WINDOWS = 'WINDOWS'
}

enum UnityReleaseStream {
    LTS = 'LTS',
    BETA = 'BETA',
    ALPHA = 'ALPHA',
    TECH = 'TECH'
}

enum UnityReleaseEntitlement {
    XLTS = 'XLTS',
    U7ALPHA = 'U7ALPHA'
}

interface FetchReleaseOptions {
    architecture?: UnityReleaseDownloadArchitecture[];
    platform?: UnityReleaseDownloadPlatform[];
    stream?: UnityReleaseStream[];
    entitlements?: UnityReleaseEntitlement[];
    version: string;
}

interface FetchReleaseRequestBody {
    query: string;
    variables: FetchReleaseOptions;
}

interface EulaEntry {
    url?: string;
    label?: string;
    message?: string;
    [k: string]: unknown;
}

interface ExtractedPathRename {
    to?: string;
    from?: string;
    [k: string]: unknown;
}

interface ModuleOnline {
    url?: string;
    integrity?: string;
    type?: string;
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    category?: string;
    downloadSize: { value: number };
    installedSize: { value: number };
    required: boolean;
    hidden: boolean;
    extractedPathRename?: ExtractedPathRename;
    preSelected: boolean;
    destination?: string;
    eula?: EulaEntry[];
    subModules?: ModuleOnline[];
    [k: string]: unknown;
}

interface Module {
    url: string;
    integrity: string;
    type: string;
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    downloadSize: number;
    installedSize: number;
    required: boolean;
    hidden: boolean;
    extractedPathRename: ExtractedPathRename | null;
    preSelected: boolean;
    destination: string | null;
    eula: EulaEntry[] | null;
    subModules: Module[];

    // Additional properties added in the C# constructor logic
    downloadUrl: string;
    visible: boolean;
    selected: boolean; // is_installed
    sync: string;
    parent: string;
    eulaUrl1: string;
    eulaLabel1: string;
    eulaMessage: string;
    renameTo: string;
    renameFrom: string;
    preselected: boolean;
}

// --- GraphQL 查询字符串 ---
// 这是 fetch_release_query.graphql 文件的内容
const FETCH_RELEASE_QUERY = `
query FetchReleaseQuery(
  $architecture: [UnityReleaseDownloadArchitecture!]
  $platform: [UnityReleaseDownloadPlatform!]
  $stream: [UnityReleaseStream!]
  $version: String
  $entitlements: [UnityReleaseEntitlement!]
) {
  getUnityReleases(
    architecture: $architecture
    platform: $platform
    skip: 0
    limit: 1
    stream: $stream
    version: $version
    entitlements: $entitlements
  ) {
    edges {
      node {
        version
        productName
        releaseDate
        releaseNotes {
          ...ReleaseNotesFields
        }
        stream
        skuFamily
        recommended
        unityHubDeepLink
        shortRevision
        downloads {
          ...UnityReleaseHubDownloadFields
        }
        thirdPartyNotices {
      \t\turl
          integrity
          type
          originalFileName
        }
      }
    }
    totalCount
  }
}

fragment ReleaseNotesFields on UnityReleaseNotes {
  url
  integrity
  type
}

fragment UnityReleaseHubDownloadFields on UnityReleaseHubDownload {
  url
  integrity
  type
  platform
  architecture
  modules {
    ...UnityReleaseModuleFields_Level1
  }
  downloadSize(format: BYTE) {
    value
    unit
  }
  installedSize(format: BYTE) {
    value
    unit
  }
}

fragment UnityReleaseModuleFields_Level1 on UnityReleaseModule {
  ...UnityReleaseModuleCommonFields
  subModules {
    ...UnityReleaseModuleFields_Level2
  }
}

fragment UnityReleaseModuleFields_Level2 on UnityReleaseModule {
  ...UnityReleaseModuleCommonFields
  subModules {
    ...UnityReleaseModuleFields_Level3
  }
}

fragment UnityReleaseModuleFields_Level3 on UnityReleaseModule {
  ...UnityReleaseModuleCommonFields
  subModules {
    name
    slug
    id
    description
    url
    destination
  }
}

fragment UnityReleaseModuleCommonFields on UnityReleaseModule {
  __typename
  url
  integrity
  type
  id
  slug
  name
  description
  category
  required
  hidden
  preSelected
  destination
  extractedPathRename {
    from
    to
  }
  downloadSize(format: BYTE) {
    unit
    value
  }
  installedSize(format: BYTE) {
    unit
    value
  }
  eula {
    url
    integrity
    type
    label
    message
  }
}
`;

// --- URI 解析函数 ---
function parseUnityHubUri(uri: string) {
    const pattern = /^unityhub:\/\/([^\/]+)\/(.+)$/;
    const matches = uri.match(pattern);
    if (!matches || matches.length < 3) return null;
    return { version: matches[1] };
}

// --- 处理函数 ---
const fetch_modules_from_release = (
    modules: Module[],
    moduleOnline: ModuleOnline,
    parent_id: string = ''
): void => {
    const newModule: Module = {
        url: moduleOnline.url || '',
        integrity: moduleOnline.integrity || '',
        type: moduleOnline.type || '',
        id: moduleOnline.id || '',
        name: moduleOnline.name || '',
        slug: moduleOnline.slug || '',
        description: moduleOnline.description || '',
        category: moduleOnline.category || '',
        downloadSize: moduleOnline.downloadSize?.value || 0,
        installedSize: moduleOnline.installedSize?.value || 0,
        required: moduleOnline.required || false,
        hidden: moduleOnline.hidden || false,
        extractedPathRename:
            (moduleOnline.extractedPathRename &&
                Object.keys(moduleOnline.extractedPathRename).length > 0)
                ? { ...moduleOnline.extractedPathRename }
                : null,
        preSelected: moduleOnline.preSelected || false,
        destination: moduleOnline.destination || null,
        eula:
            (moduleOnline.eula && moduleOnline.eula.length > 0)
                ? [...moduleOnline.eula]
                : null,
        subModules: [],

        // Properties added by C# logic
        downloadUrl: moduleOnline.url || '',
        visible: !(moduleOnline.hidden || false),
        selected: moduleOnline.id === 'android',
        sync: parent_id === 'android-sdk-ndk-tools' ? parent_id : '',
        parent: parent_id,
        eulaUrl1: moduleOnline.eula?.[0]?.url || '',
        eulaLabel1: moduleOnline.eula?.[0]?.label || '',
        eulaMessage: moduleOnline.eula?.[0]?.message || '',
        renameTo: moduleOnline.extractedPathRename?.to || '',
        renameFrom: moduleOnline.extractedPathRename?.from || '',
        preselected: moduleOnline.preSelected || false,
    };

    modules.push(newModule);

    const subModules = moduleOnline.subModules;
    if (subModules && subModules.length > 0) {
        const currentId = moduleOnline.id || '';
        for (const item of subModules) {
            fetch_modules_from_release(modules, item, currentId);
        }
    }
};

// --- React 组件 ---
const UnityModuleFetcher: React.FC = () => {
    // --- 使用钩子获取 URL 参数和路由控制 ---
    const searchParams = useSearchParams(); // 获取查询参数对象
    const router = useRouter();             // 用于更新浏览器 URL
    const pathname = usePathname();         // 当前页面路径（不含查询参数）

    const [inputUri, setInputUri] = useState<string>('');
    const [parsedVersion, setParsedVersion] = useState<string | null>(null);

    // --- 用户选择的状态 ---
    const [selectedPlatform, setSelectedPlatform] = useState<UnityReleaseDownloadPlatform>(UnityReleaseDownloadPlatform.WINDOWS);
    const [selectedArchitecture, setSelectedArchitecture] = useState<UnityReleaseDownloadArchitecture>(UnityReleaseDownloadArchitecture.X86_64);
    const [selectedStream, setSelectedStream] = useState<UnityReleaseStream | ''>(''); // 允许空字符串表示不指定
    const [selectedEntitlements, setSelectedEntitlements] = useState<UnityReleaseEntitlement[]>([]); // 允许空数组

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [modules, setModules] = useState<Module[] | null>(null);

    // --- 在组件挂载时处理 URL 查询参数 ---
    useEffect(() => {
        // 从 URL 中获取 'v' 参数
        const uriFromParam = searchParams.get('v');
        const platformFromParam = searchParams.get('platform') as UnityReleaseDownloadPlatform | null;
        const archFromParam = searchParams.get('arch') as UnityReleaseDownloadArchitecture | null;
        const streamFromParam = searchParams.get('stream') as UnityReleaseStream | null;
        const entitlementsFromParam = searchParams.get('entitlements');

        if (uriFromParam) {
            setInputUri(uriFromParam);
            const result = parseUnityHubUri(uriFromParam);
            if (result) {
                setParsedVersion(result.version);
                setError(null);
            } else {
                setParsedVersion(null);
                setError('无法解析 URI，请检查格式是否正确！');
            }
        }

        // 设置平台
        if (platformFromParam && Object.values(UnityReleaseDownloadPlatform).includes(platformFromParam)) {
            setSelectedPlatform(platformFromParam);
        }

        // 设置架构
        if (archFromParam && Object.values(UnityReleaseDownloadArchitecture).includes(archFromParam)) {
            setSelectedArchitecture(archFromParam);
        }

        // 设置 Stream
        if (streamFromParam && Object.values(UnityReleaseStream).includes(streamFromParam)) {
            setSelectedStream(streamFromParam);
        } else if (streamFromParam === '') {
            setSelectedStream('');
        }

        // 设置 Entitlements
        if (entitlementsFromParam) {
            const ents = entitlementsFromParam.split(',').map(e => e.trim() as UnityReleaseEntitlement)
                .filter(e => Object.values(UnityReleaseEntitlement).includes(e));
            setSelectedEntitlements(ents);
        }

    }, [searchParams]); // 依赖项为 searchParams，在初始加载时运行一次

    // --- 处理函数 ---
    const handleParseUri = useCallback(() => {
        const result = parseUnityHubUri(inputUri);
        if (result) {
            setParsedVersion(result.version);
            setError(null);
            // --- URL 参数获取 ---
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set('v', inputUri);
            newParams.set('platform', selectedPlatform);
            newParams.set('arch', selectedArchitecture);
            if(selectedStream) {
                newParams.set('stream', selectedStream);
            } else {
                newParams.delete('stream');
            }
            if(selectedEntitlements.length > 0) {
                newParams.set('entitlements', selectedEntitlements.join(','));
            } else {
                newParams.delete('entitlements');
            }
            router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
        } else {
            setParsedVersion(null);
            setError('无法解析 URI，请检查格式是否正确');
            // 清除 URL 中的 'v' 参数
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('v');
            router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
        }
    }, [inputUri, router, pathname, searchParams, selectedPlatform, selectedArchitecture, selectedStream, selectedEntitlements]); // 添加了所有相关状态作为依赖


    const handleFetchModules = useCallback(async () => {
        if (!parsedVersion) {
            setError('请先解析一个有效的 URI 以获取版本号。');
            return;
        }

        setLoading(true);
        setError(null);
        setModules(null);

        // --- 使用用户选择的值构建请求体 ---
        const variables: FetchReleaseOptions = {
            architecture: [selectedArchitecture],
            platform: [selectedPlatform],
            version: parsedVersion,
        };

        // 只有当用户选择了 Stream 或 Entitlements 时才添加到 variables
        if (selectedStream) {
            variables.stream = [selectedStream];
        }
        if (selectedEntitlements.length > 0) {
            variables.entitlements = selectedEntitlements;
        }

        const requestBody: FetchReleaseRequestBody = {
            query: FETCH_RELEASE_QUERY,
            variables,
        };

        try {
            const response = await fetch('https://live-platform-api.prd.ld.unity3d.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 检查 GraphQL 错误
            if (data.errors && data.errors.length > 0) {
                throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
            }


            const modulesOnline =
                data?.data?.getUnityReleases?.edges?.[0]?.node?.downloads?.[0]
                    ?.modules;

            if (!modulesOnline) {
                throw new Error('返回的数据结构异常，未找到模块列表。');
            }

            const processedModules: Module[] = [];
            for (const module of modulesOnline) {
                fetch_modules_from_release(processedModules, module);
            }

            setModules(processedModules);
        } catch (err: any) {
            console.error("Fetching or processing failed:", err);
            setError(err.message || '获取或处理模块时发生未知错误。');
        } finally {
            setLoading(false);
        }
    }, [parsedVersion, selectedArchitecture, selectedPlatform, selectedStream, selectedEntitlements]); // 添加了所有相关状态作为依赖

    const handleDownloadJson = useCallback(() => {
        if (!modules) return;
        const dataStr = JSON.stringify(modules, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'modules.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [modules]);

    // --- 处理下拉菜单变化 ---
    const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPlatform(e.target.value as UnityReleaseDownloadPlatform);
    };

    const handleArchitectureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedArchitecture(e.target.value as UnityReleaseDownloadArchitecture);
    };

    const handleStreamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as UnityReleaseStream | '';
        setSelectedStream(value);
    };

    const handleEntitlementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value as UnityReleaseEntitlement;
        const isChecked = e.target.checked;
        setSelectedEntitlements(prev =>
            isChecked
                ? [...prev, value]
                : prev.filter(ent => ent !== value)
        );
    };


    return (
        <>
            <SiteHeader/>
            <br/>
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">UnityHub modules.json 生成器</h2>
                {/* URI 输入 */}
                <div>
                    <label htmlFor="uriInput" className="block text-sm font-medium text-gray-700 mb-1">
                        输入 UnityHub URI:
                    </label>

                    <input
                        type="text"
                        id="uriInput"
                        value={inputUri}
                        onChange={(e) => setInputUri(e.target.value)}
                        placeholder="例如: unityhub://6000.0.63f1/9438f9b77a46"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* 解析按钮 */}
                <button
                    onClick={handleParseUri}
                    disabled={!inputUri}
                    className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                        inputUri
                            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            : 'bg-gray-400 cursor-not-allowed'
                    } transition duration-150`}
                >
                    解析 URI
                </button>

                {/* 平台选择 */}
                <div>
                    <label htmlFor="platformSelect" className="block text-sm font-medium text-gray-700 mb-1">
                        平台 (Platform):
                    </label>
                    <select
                        id="platformSelect"
                        value={selectedPlatform}
                        onChange={handlePlatformChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {Object.values(UnityReleaseDownloadPlatform).map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 架构选择 */}
                <div>
                    <label htmlFor="architectureSelect" className="block text-sm font-medium text-gray-700 mb-1">
                        架构 (Architecture):
                    </label>

                    <select
                        id="architectureSelect"
                        value={selectedArchitecture}
                        onChange={handleArchitectureChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >

                        {Object.values(UnityReleaseDownloadArchitecture).map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 流选择 */}
                <div>
                    <label htmlFor="streamSelect" className="block text-sm font-medium text-gray-700 mb-1">
                        流 (Stream):
                    </label>

                    <select
                        id="streamSelect"
                        value={selectedStream}
                        onChange={handleStreamChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >

                        <option value="">不指定</option>

                        {Object.values(UnityReleaseStream).map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                </div>

                {/* 授权选择（复选框） */}
                <div>
                    <span className="block text-sm font-medium text-gray-700 mb-2">授权 (Entitlements):</span>
                    <div className="flex flex-wrap gap-3">

                        {Object.values(UnityReleaseEntitlement).map((ent) => (
                            <label key={ent} className="inline-flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    value={ent}
                                    checked={selectedEntitlements.includes(ent)}
                                    onChange={handleEntitlementChange}
                                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />

                                <span className="text-sm text-gray-700">{ent}</span>

                            </label>
                        ))}
                    </div>
                </div>

                {/* 解析结果 & 获取模块按钮 */}
                {parsedVersion && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-3">
                            解析出的版本: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">{parsedVersion}</code>
                        </p>

                        <button
                            onClick={handleFetchModules}
                            disabled={loading}
                            className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                                loading
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                            } transition duration-150`}
                        >
                            {loading ? '获取中...' : '获取模块列表'}
                        </button>
                    </div>
                )}

                {/* 错误提示 */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                        <strong>错误:</strong> {error}
                    </div>

                )}

                {/* 加载提示（仅在加载且无错误时显示） */}
                {loading && !error && !modules && (
                    <p className="text-center text-gray-500 text-sm">正在从服务器获取数据...</p>
                )}

                {/* 结果展示 */}
                {modules && (
                    <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                            <h3 className="text-lg font-semibold text-green-800">✅ 模块获取成功!</h3>
                            <p className="text-sm text-gray-700">共获取到 <strong>{modules.length}</strong> 个模块。</p>
                        </div>

                        <button
                            onClick={handleDownloadJson}
                            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
                        >
                            下载 modules.json
                        </button>

                        <pre className="bg-white p-3 rounded-md text-xs overflow-x-auto max-h-60 whitespace-pre-wrap break-words border border-gray-200">
                            {JSON.stringify(modules, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
            <br/>
            <SiteFooter/>
        </>
    );
};

export default UnityModuleFetcher;