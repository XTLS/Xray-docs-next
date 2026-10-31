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
  comingSoon:
    "Remote sources are coming soon. Choose a local file to get started.",
  emptyTitle: "Start with a data file",
  emptyBody:
    "Load a file, choose a category on the left and explore its entries on the right.",
  processing: "Processing file",
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
  errors: {
    emptyFile: "This file is empty. Choose a file containing Geo data.",
    invalidFile:
      "Unable to parse this file. Check that it is complete and that the selected GeoIP or GeoSite type is correct.",
    readFailed: "Unable to read this file. Select it again and retry.",
    workerFailed:
      "Unable to start or run the parser. Reload the page and retry."
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
  comingSoon:
    "Загрузка по сети появится позже. Пока выберите локальный файл.",
  emptyTitle: "Начните с файла данных",
  emptyBody:
    "Загрузите файл, выберите категорию слева и просмотрите записи справа.",
  processing: "Обработка файла",
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
  errors: {
    emptyFile: "Файл пуст. Выберите файл с геоданными.",
    invalidFile:
      "Не удалось разобрать файл. Проверьте его целостность и выбранный тип: GeoIP или GeoSite.",
    readFailed:
      "Не удалось прочитать файл. Выберите его заново и повторите попытку.",
    workerFailed:
      "Не удалось запустить обработку. Обновите страницу и повторите попытку."
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
