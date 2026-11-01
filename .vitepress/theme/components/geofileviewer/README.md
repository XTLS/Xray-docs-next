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
| `links.mts`                                      | URL 参数解析、分享链接构造、站内弹窗目标识别          |
| `useViewerTarget.mts`                            | 将链接参数转换为控制器动作及无效链接提示              |
| `useViewerPageRoute.mts`                         | 仅独立页面的路由读取和 URL 同步                       |
| `useViewerSharing.mts`                           | 两种宿主共用的分享地址和剪贴板操作                    |
| `useViewerNavigation.mts`                        | 安装和恢复站内导航钩子                                |
| `GeofileViewerModal.vue` / `useViewerDialog.mts` | 弹窗挂载、遮罩、焦点恢复和滚动锁定                    |

## 状态边界

- `draft` 是来源表单；编辑它会取消进行中的加载，已完成加载的数据继续保留。
- `session` 表示实际数据来源、加载状态、进度、统计和错误。
- `query` 保存内容、分类和属性条件。内容变化清空分类和属性；分类变化保留内容，必要时切换选中分类并清空属性。
- `results` 提供只读分类、当前条目及剩余批次信息。属性只影响右侧条目结果。
- `view` 保存首页／工作区、来源面板及手机端显示状态。工作区独立于 `session.loaded`，换源、取消和错误不会自行退出工作区；`resetToHome` 才完整返回首页。
- 每次数据加载拥有独立 Worker 会话；搜索和条目批次分别失效。Worker 内的异步取消与主线程的响应校验都保留。

独立宿主使用 `{ mode: "page" }`；弹窗使用 `{ mode: "embedded", url }`。弹窗只应用初始化目标，不安装页面路由同步。两种宿主的分享链接都指向独立工具地址。

## 样式边界

`viewer.css` 管理宿主布局，独立页面的固定工作区只应用于 `geo-viewer--page`。嵌入模式填满弹窗父容器。来源、分类、条目样式分别位于对应 CSS 文件，公共视觉规则集中于带 `.geo-viewer` 命名空间的 `viewer-shared.css`。原生弹窗的焦点和文档滚动由宿主负责。

## 验证

```sh
pnpm run test:geofileviewer
pnpm run docs:build
pnpm exec playwright install chromium
pnpm run test:geofileviewer:e2e
```

浏览器用例在内存生成 DAT 并拦截网络，不依赖官方仓库实时下载。已有外部预览服务时可设置 `PLAYWRIGHT_BASE_URL`；本地使用 Edge 可设置 `PLAYWRIGHT_CHANNEL=msedge`。实际官方 DAT 的最终验收独立执行，数据文件不提交到仓库。
