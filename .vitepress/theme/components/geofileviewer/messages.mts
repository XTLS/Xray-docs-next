export const zh = {
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
  emptyTitle: "从一个数据文件开始",
  emptyBody: "加载文件后，在左侧选择分类，在右侧查看条目。",
  processing: "正在解析文件",
  downloading: "正在下载文件",
  readingFile: "正在读取文件",
  decompressing: "正在解压文件",
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
  invalidPreset: "链接中的预设文件无效，请选择下方的官方预设。",
  missingCategory: "文件中没有找到该分类，可继续浏览其他分类",
  copyLink: "复制分类链接",
  copied: "已复制",
  copyFailed: "无法写入剪贴板，请手动复制此链接。",
  help: "选择官方预设、输入文件直链，或打开本地 DAT/gzip 文件。搜索按字面文本筛选文件内容；规则匹配方式请参阅路由文档。",
  relatedDocs: "相关文档",
  routingDocs: "路由与规则格式",
  geodataDocs: "地理数据文件",
  dataSourceDocs: "官方数据源与版本说明",
  errors: {
    emptyFile: "文件为空，请选择包含 Geo 数据的文件。",
    invalidFile:
      "无法解析文件，请确认文件完整，并选择正确的 GeoIP 或 GeoSite 类型。",
    readFailed: "无法读取文件，请重新选择后重试。",
    workerFailed: "无法启动或运行解析器，请重新加载页面后重试。",
    invalidUrl: "请输入有效的 HTTP 或 HTTPS 文件直链。",
    downloadFailed:
      "下载失败，请检查文件地址或稍后重试。也可下载后选择本地文件。",
    networkFailed:
      "无法访问该 URL，可能是网络或跨域限制。请下载文件后通过本地文件入口打开。",
    gzipUnsupported: "浏览器不支持 gzip 解压，请改用未压缩的 DAT 文件。"
  }
}

export type Messages = typeof zh

const en: Messages = {
  title: "Geo Data Viewer",
  description:
    "Explore GeoIP and GeoSite files, categories, IP networks and domain rules.",
  source: "Data source",
  changeSource: "Change source",
  collapse: "Collapse",
  preset: "Official presets",
  url: "URL",
  local: "Local file",
  presetNames: [
    "GeoIP Lite",
    "GeoIP Full",
    "GeoSite Standard",
    "GeoSite Expanded"
  ],
  presetDescriptions: [
    "Regional routing, private networks and popular services",
    "Includes IP geolocation for countries and territories worldwide",
    "Domain categories and regional blocklists and whitelists",
    "Regional domain lists with broader coverage"
  ],
  fileUrl: "File URL",
  fileType: "File type",
  drop: "Choose or drop a local DAT file",
  privacy: "Files are processed in your browser and are never uploaded.",
  browse: "Choose file",
  load: "Load file",
  cancel: "Cancel",
  retry: "Retry",
  emptyTitle: "Start with a data file",
  emptyBody:
    "Load a file, choose a category on the left and explore its entries on the right.",
  processing: "Processing file",
  downloading: "Downloading file",
  readingFile: "Reading file",
  decompressing: "Decompressing file",
  searching: "Searching",
  reading: "Reading entries",
  search: "Search categories, contents or attributes…",
  categories: "Categories",
  entries: "Entries",
  matches: "Matches",
  noResults: "No matching results.",
  chooseCategory: "Choose a category to view its contents.",
  previous: "Previous",
  next: "Next",
  page: "Page",
  back: "← Back to categories",
  reverseMatch: "Reverse match",
  invalidPreset:
    "This link specifies an invalid preset. Choose an official preset below.",
  missingCategory:
    "Category not found in this file. You can browse other categories",
  copyLink: "Copy category link",
  copied: "Copied",
  copyFailed: "Unable to access the clipboard. Copy this link manually.",
  help: "Choose an official preset, enter a direct file URL, or open a local DAT/gzip file. Search filters the file's literal text; see the routing documentation for rule matching behavior.",
  relatedDocs: "Related documentation",
  routingDocs: "Routing and rule formats",
  geodataDocs: "Geodata files",
  dataSourceDocs: "Official data and edition details",
  errors: {
    emptyFile: "This file is empty. Choose a file containing Geo data.",
    invalidFile:
      "Unable to parse this file. Check that it is complete and that the selected GeoIP or GeoSite type is correct.",
    readFailed: "Unable to read this file. Select it again and retry.",
    workerFailed:
      "Unable to start or run the parser. Reload the page and retry.",
    invalidUrl: "Enter a valid HTTP or HTTPS direct file URL.",
    downloadFailed:
      "Download failed. Check the URL or retry later. You can also download the file and open it locally.",
    networkFailed:
      "Unable to access this URL. The network or cross-origin restrictions may be blocking it. Download the file and open it using Local file.",
    gzipUnsupported:
      "Your browser does not support gzip decompression. Use an uncompressed DAT file."
  }
}

const ru: Messages = {
  title: "Просмотр геоданных",
  description:
    "Просматривайте файлы GeoIP и GeoSite: категории, IP-сети и правила доменов.",
  source: "Источник данных",
  changeSource: "Сменить источник",
  collapse: "Свернуть",
  preset: "Готовые наборы",
  url: "URL",
  local: "Локальный файл",
  presetNames: [
    "GeoIP Lite",
    "GeoIP Full",
    "GeoSite Standard",
    "GeoSite Expanded"
  ],
  presetDescriptions: [
    "Региональная маршрутизация, частные сети и популярные сервисы",
    "Включает географические IP-данные всех стран и территорий",
    "Категории доменов и региональные чёрные и белые списки",
    "Региональные списки доменов с расширенным покрытием"
  ],
  fileUrl: "URL файла",
  fileType: "Тип файла",
  drop: "Выберите или перетащите локальный DAT-файл",
  privacy: "Файлы обрабатываются в браузере и никуда не загружаются.",
  browse: "Выбрать файл",
  load: "Загрузить файл",
  cancel: "Отмена",
  retry: "Повторить",
  emptyTitle: "Начните с файла данных",
  emptyBody:
    "Загрузите файл, выберите категорию слева и просмотрите записи справа.",
  processing: "Обработка файла",
  downloading: "Загрузка файла",
  readingFile: "Чтение файла",
  decompressing: "Распаковка файла",
  searching: "Поиск",
  reading: "Чтение записей",
  search: "Поиск категорий, содержимого или атрибутов…",
  categories: "Категории",
  entries: "Записи",
  matches: "Совпадения",
  noResults: "Совпадений не найдено.",
  chooseCategory: "Выберите категорию для просмотра записей.",
  previous: "Назад",
  next: "Далее",
  page: "Страница",
  back: "← К списку категорий",
  reverseMatch: "Обратное сопоставление",
  invalidPreset:
    "В ссылке указан недопустимый набор. Выберите один из готовых наборов ниже.",
  missingCategory:
    "Категория не найдена в файле. Можно просмотреть другие категории",
  copyLink: "Копировать ссылку",
  copied: "Скопировано",
  copyFailed: "Нет доступа к буферу обмена. Скопируйте ссылку вручную.",
  help: "Выберите готовый набор, введите прямую ссылку или откройте локальный DAT/gzip-файл. Поиск фильтрует текст файла; правила сопоставления описаны в документации по маршрутизации.",
  relatedDocs: "Связанная документация",
  routingDocs: "Маршрутизация и формат правил",
  geodataDocs: "Файлы геоданных",
  dataSourceDocs: "Официальные данные и версии",
  errors: {
    emptyFile: "Файл пуст. Выберите файл с геоданными.",
    invalidFile:
      "Не удалось разобрать файл. Проверьте его целостность и выбранный тип: GeoIP или GeoSite.",
    readFailed:
      "Не удалось прочитать файл. Выберите его заново и повторите попытку.",
    workerFailed:
      "Не удалось запустить обработку. Обновите страницу и повторите попытку.",
    invalidUrl: "Введите прямую ссылку на файл по HTTP или HTTPS.",
    downloadFailed:
      "Не удалось загрузить файл. Проверьте ссылку или повторите попытку позже. Также можно скачать файл и открыть его локально.",
    networkFailed:
      "Не удалось открыть URL. Возможна ошибка сети или запрет междоменных запросов. Скачайте файл и откройте его как локальный.",
    gzipUnsupported:
      "Браузер не поддерживает распаковку gzip. Используйте несжатый DAT-файл."
  }
}

export const dictionaries = { zh, en, ru }
export function getMessages(language: string): Messages {
  return (
    dictionaries[
      language.toLowerCase().split("-")[0] as keyof typeof dictionaries
    ] ?? en
  )
}
