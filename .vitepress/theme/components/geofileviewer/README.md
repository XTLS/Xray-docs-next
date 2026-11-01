# Geo 数据查看器内部结构

## 数据流

用户操作通过展示组件的事件进入 `useViewer`，控制器调用 Worker 客户端，收到有效结果后更新只读视图状态。展示组件不发送 Worker 消息、不修改路由，也不直接写控制器状态。

## 职责入口

| 模块                                             | 职责                                                  |
| ------------------------------------------------ | ----------------------------------------------------- |
| `GeofileViewer.vue`                              | 组装页面或嵌入宿主、国际化、摘要及三个面板            |
| `ViewerSource.vue`                               | 来源表单、文件选择和拖放、来源 dialog、进度和错误展示 |
| `ViewerCategoryList.vue`                         | 分类过滤输入、分类列表滚动、选中项定位                |
| `ViewerEntryList.vue`                            | 条目、属性过滤输入、高亮、条目列表滚动                |
| `useViewer.mts` / `viewerState.mts`              | 状态初始值和显式操作、查询联动、数据会话及批次追加    |
| `workerClient.mts`                               | Worker 工厂、生命周期、请求编号和过期响应校验         |
| `viewer.worker.mts`                              | Worker 内来源读取、索引建立、查询和取消               |
| `sources.mts` / `dataset.mts`                    | 网络与文件读取、gzip、DAT 解析和查询引擎              |
| `domainQuery.mts` / `domainSearch.mts`           | 域名输入规范化、四种 GeoSite 规则命中、RE2 正则缓存   |
| `ipSearch.mts`                                   | IP 解析、CIDR 格式化和前缀匹配、数值二分索引          |
| `links.mts`                                      | URL 参数解析、分享链接构造、站内弹窗目标识别          |
| `useViewerTarget.mts`                            | 将链接参数转换为控制器动作及无效链接提示              |
| `useViewerPageRoute.mts`                         | 仅独立页面的路由读取和 URL 同步                       |
| `useViewerSharing.mts`                           | 两种宿主共用的分享地址和剪贴板操作                    |
| `useViewerNavigation.mts`                        | 安装和恢复站内导航钩子                                |
| `GeofileViewerModal.vue` / `useViewerDialog.mts` | 弹窗挂载、遮罩、焦点恢复和滚动锁定                    |

## 状态边界

- `draft` 是来源表单；编辑它会取消进行中的加载，已完成加载的数据继续保留。
- `session` 表示实际数据来源、加载状态、进度、统计和错误。
- `query` 保存内容、搜索模式、分类和属性条件。内容或模式变化清空分类和属性；分类变化保留内容，必要时切换选中分类并清空属性。
- `results` 提供只读分类、当前条目及剩余批次信息。属性只影响右侧条目结果。
- `view` 保存首页／工作区、来源面板及手机端显示状态。工作区独立于 `session.loaded`，换源、取消和错误不会自行退出工作区；`resetToHome` 才完整返回首页。
- 每次数据加载拥有独立 Worker 会话；搜索和条目批次分别失效。Worker 内的异步取消与主线程的响应校验都保留。

GeoIP 默认使用“查命中”模式，数值二分查找包含输入 IP 的 CIDR；“查规则”按 CIDR 显示文本的开头匹配，允许输入不完整的地址或前缀长度。GeoSite 同样默认“查命中”，按 `keyword`、`regexp`、`domain`、`full` 的语义匹配输入域名；“查规则”保留不区分大小写的字面包含搜索。模式切换保留输入，更换数据源或打开分类直达链接时恢复“查命中”模式。结果按原始文件顺序返回，属性始终只筛选当前分类的命中条目。

内容输入和模式切换共用 250ms 防抖。IP 地址和域名在防抖后校验，非法输入仅显示格式提示，不发起 Worker 查询；清空输入恢复全部分类。域名输入只接受主机名，转为小写及 Punycode 并忽略末尾的根域名点，不接受 URL、端口、路径或 IP。

GeoSite 的规则匹配遵循 [Xray 的四种域名匹配器](https://github.com/XTLS/Xray-core/blob/main/common/geodata/strmatcher/matchers.go)。正则保留原始大小写和内联标志，通过 [RE2JS](https://github.com/le0pard/re2js) 的线性时间引擎执行。无效正则跳过命中，但仍可浏览和查规则。Worker 只缓存已编译的正则，普通域名和属性继续从原始字节按需读取。

GeoIP、GeoSite 和两种宿主共用搜索 UI。`SearchInput` 只处理输入、模式插槽和无障碍属性；查询错误、搜索中状态和分类数量统一由 `GeofileViewer` 的 `geo-stats` 展示。`query.error` 保存类型化的错误文案键，校验逻辑不决定提示位置。

独立宿主使用 `{ mode: "page" }`；弹窗使用 `{ mode: "embedded", url }`。弹窗只应用初始化目标，不安装页面路由同步。两种宿主的分享链接都指向独立工具地址。

远程来源只在 HTTPS 页面启用；客户端挂载前和非 HTTPS 页面均只显示本地上传。分享链接仅接受 HTTPS 的 `raw.githubusercontent.com` 和 `cdn.jsdelivr.net/gh/` 地址，其它地址报错并清空来源。HTTPS 页面仍支持手动输入第三方 URL，但不为白名单之外的来源生成分享链接。

## 样式边界

`viewer.css` 管理宿主布局，独立页面的固定工作区只应用于 `geo-viewer--page`。初始选择界面约 900px 宽，弹窗按内容取高度；加载成功后才扩展为完整工作区。选择与加载共用预留的底部状态行和同一操作按钮，卡片始终保留。手机卡片精简为名称和 GitHub 远程来源标识。Xray 数据摘要使用本地化名称，来源弹窗区分已加载文件与加载状态。

来源、分类、条目样式分别位于对应 CSS 文件，公共视觉规则集中于带 `.geo-viewer` 命名空间的 `viewer-shared.css`。原生弹窗的焦点和文档滚动由宿主负责；异步组件挂载完成后才显示初始弹窗。

工作区和来源弹窗的摘要共用 `MarqueeText`，仅在文字溢出时往返滚动；文字或可用宽度变化时重新测量，悬停暂停。减少动态效果模式下改为手动横向滚动。

## 验证

```sh
pnpm test
pnpm run docs:build
```

单元测试使用 Node 内置测试运行器，覆盖解析、查询、来源读取与状态转换。Xray-rules-dat 的实际 DAT 文件可单独进行人工验收，数据文件不提交到仓库。
