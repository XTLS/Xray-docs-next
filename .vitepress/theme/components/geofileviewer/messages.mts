export const messages = {
  title: "Geo 数据查看器",
  description: "浏览 GeoIP 和 GeoSite 文件，查看分类、IP 网段与域名规则。",
  source: "数据来源",
  changeSource: "切换来源",
  collapse: "收起",
  preset: "官方预设",
  url: "URL",
  local: "本地文件",
  presetNames: [
    "GeoIP 精简版",
    "GeoIP 完整版",
    "GeoSite 标准版",
    "GeoSite 扩展版"
  ],
  presetDescriptions: [
    "地区分流、私有网络和常用服务",
    "包含全球国家和地区的 IP 数据",
    "常用域名分类与地区黑白名单",
    "覆盖范围更广的地区域名数据"
  ],
  fileUrl: "文件 URL",
  fileType: "文件类型",
  drop: "选择或拖放本地 DAT 文件",
  privacy: "文件在浏览器内处理，不会上传。",
  browse: "选择文件",
  load: "加载文件",
  cancel: "取消",
  retry: "重试",
  comingSoon: "远程数据来源正在接入，请先选择本地文件。",
  emptyTitle: "从一个数据文件开始",
  emptyBody: "加载文件后，在左侧选择分类，在右侧查看条目。",
  processing: "正在解析文件",
  searching: "正在搜索",
  reading: "正在读取条目",
  search: "搜索分类、内容或属性…",
  categories: "分类",
  entries: "条目",
  matches: "匹配",
  noResults: "没有匹配的结果。",
  chooseCategory: "选择一个分类以查看内容。",
  previous: "上一页",
  next: "下一页",
  page: "页",
  back: "← 返回分类列表",
  reverseMatch: "反向匹配",
  errors: {
    emptyFile: "文件为空，请选择包含 Geo 数据的文件。",
    invalidFile:
      "无法解析文件，请确认文件完整，并选择正确的 GeoIP 或 GeoSite 类型。",
    readFailed: "无法读取文件，请重新选择后重试。",
    workerFailed: "无法启动或运行解析器，请重新加载页面后重试。"
  }
}
