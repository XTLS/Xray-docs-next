import { expect, test, type Page } from "@playwright/test"
import { browserDataset } from "../helpers/dat.mts"

test.beforeEach(async ({ context }) => {
  await context.route(
    "https://raw.githubusercontent.com/XTLS/Xray-rules-dat/release/**",
    (route) =>
      route.fulfill({
        body: browserDataset(
          route.request().url().includes("/geoip/") ? "geoip" : "geosite"
        ),
        contentType: "application/octet-stream",
        headers: { "Access-Control-Allow-Origin": "*" }
      })
  )
  await context.route("https://data.example/geosite.dat", (route) =>
    route.fulfill({
      body: browserDataset("geosite"),
      contentType: "application/octet-stream",
      headers: { "Access-Control-Allow-Origin": "*" }
    })
  )
})

async function idle(page: Page) {
  await expect(page.locator(".geo-browser")).toHaveAttribute(
    "aria-busy",
    "false"
  )
  await expect(page.locator(".geo-content")).toHaveAttribute(
    "aria-busy",
    "false"
  )
}

test("search, category filtering, attributes and streamed entries retain their separate roles", async ({
  page
}) => {
  await page.goto("/tools/geofileviewer.html?file=geosite.dat&tag=google")
  await idle(page)
  await expect(page.locator(".geo-entry")).toHaveCount(100)
  await expect(page.locator("#geo-attribute option")).toHaveText([
    "全部属性",
    "@cn (205)",
    "@weight (205)"
  ])
  await page.locator("#geo-attribute").selectOption("cn")
  await idle(page)
  await expect(page.locator(".geo-entry code").first()).toHaveText(
    "google110.example"
  )
  for (const count of [200, 205]) {
    await page.locator(".geo-entries").evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    await expect(page.locator(".geo-entry")).toHaveCount(count)
  }
  await page.locator("#geo-category-search").fill("google")
  await expect(page.locator("#geo-attribute")).toHaveValue("cn")
  await page.locator("#geo-search").fill("tail")
  await expect(page.locator("#geo-category-search")).toHaveValue("")
  await idle(page)
  await expect(page.locator(".geo-category > span")).toHaveText([
    "BETA",
    "GOOGLE"
  ])
  await expect(page.locator("#geo-attribute")).toHaveValue("")
  await page.locator("#geo-category-search").fill("beta")
  await expect(page.locator("#geo-search")).toHaveValue("tail")
  await page
    .getByRole("button", { name: "清除内容搜索", exact: true })
    .click()
  await expect(page.locator("#geo-category-search")).toHaveValue("")
  await page.locator("#geo-search").fill("weight")
  await idle(page)
  await expect(page.locator(".geo-category")).toHaveCount(0)
})

test("deep links, local source replacement and home navigation retain their lifecycle", async ({
  page
}) => {
  await page.goto(
    "/tools/geofileviewer.html?url=https%3A%2F%2Fdata.example%2Fgeosite.dat&type=geosite&tag=us"
  )
  await idle(page)
  await expect(page.locator(".geo-content h2")).toHaveText("US")
  await expect(
    page.locator(".geo-category[aria-current=true]")
  ).toBeInViewport()
  await expect(page.locator(".geo-workspace-title h1")).not.toBeFocused()
  await page.getByRole("button", { name: "切换来源", exact: true }).click()
  const picker = page.locator(".geo-source-dialog")
  await picker
    .getByRole("button", { name: "本地文件", exact: true })
    .click()
  await picker.locator("input[type=file]").setInputFiles({
    name: "local.dat",
    mimeType: "application/octet-stream",
    buffer: browserDataset("geosite")
  })
  await picker
    .getByRole("button", { name: "加载文件", exact: true })
    .click()
  await expect(picker).not.toBeVisible()
  await idle(page)
  await expect(page).toHaveURL(/geofileviewer\.html$/)
  await expect(page.locator(".geo-viewer")).toHaveClass(/is-workspace/)
  await page.goto("/tools/geofileviewer.html?file=geosite.dat&tag=us")
  await idle(page)
  await page
    .locator(".VPNavBar")
    .getByRole("button", { name: "工具", exact: true })
    .click()
  await page
    .locator('.VPNavBar a[href="/tools/geofileviewer.html"]')
    .click()
  await expect(page.locator(".geo-heading")).toBeVisible()
  await expect(page.locator("dialog[open]")).toHaveCount(0)
  await page.goBack()
  await idle(page)
  await expect(page.locator(".geo-content h2")).toHaveText("US")
})

test("document popup preserves address, reading position, sharing and nested Escape", async ({
  page,
  context
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/config/routing.html?keep=1#ruleobject")
  const link = page.locator('.vp-doc a[href*="file=geosite.dat"]').first()
  await link.scrollIntoViewIfNeeded()
  const before = await page.evaluate(() => ({
    url: location.href,
    y: scrollY,
    length: history.length
  }))
  await link.click()
  const modal = page.locator(".geo-modal")
  await expect(modal).toBeVisible()
  await idle(page)
  await page.locator(".geo-category").filter({ hasText: "GOOGLE" }).click()
  await page
    .getByRole("button", { name: "复制分类链接", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "已复制", exact: true })
  ).toBeVisible()
  const shared = new URL(
    await page.evaluate(() => navigator.clipboard.readText())
  )
  expect(shared.pathname).toBe("/tools/geofileviewer.html")
  expect(shared.searchParams.get("tag")).toBe("google")
  await page.getByRole("button", { name: "切换来源", exact: true }).click()
  await expect(page.locator("dialog[open]")).toHaveCount(2)
  await page.keyboard.press("Escape")
  await expect(page.locator("dialog[open]")).toHaveCount(1)
  await page.keyboard.press("Escape")
  await expect(modal).toHaveCount(0)
  expect(
    await page.evaluate(() => ({
      url: location.href,
      y: scrollY,
      length: history.length
    }))
  ).toEqual(before)
  await expect(link).toBeFocused()
  const popup = context.waitForEvent("page")
  await link.click({ modifiers: ["ControlOrMeta"] })
  const standalone = await popup
  try {
    await standalone.bringToFront()
    await expect(
      standalone.locator(".geo-viewer.is-workspace")
    ).toBeVisible({ timeout: 15000 })
    await expect(standalone.locator(".geo-modal")).toHaveCount(0)
  } finally {
    await standalone.close()
  }
})

for (const [prefix, tools, title, close] of [
  ["", "工具", "Geo 数据查看器", "关闭查看器"],
  ["/en", "Tools", "Geo Data Viewer", "Close viewer"],
  ["/ru", "Инструменты", "Просмотр геоданных", "Закрыть просмотр"]
]) {
  test(`${prefix || "zh"} mobile navigation popup supports themes and category detail`, async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${prefix}/config/geodata.html`)
    const original = page.url()
    await page.locator(".VPNavBarHamburger").click()
    await page
      .locator(".VPNavScreen")
      .getByRole("button", { name: tools, exact: true })
      .click()
    await page
      .locator(`.VPNavScreen a[href="${prefix}/tools/geofileviewer.html"]`)
      .click()
    const modal = page.locator(".geo-modal")
    await expect(modal.locator(".geo-modal-header h2")).toHaveText(title)
    await expect(
      modal.locator('input[name="geo-preset"]').first()
    ).toBeChecked()
    await modal.locator('input[name="geo-preset"]').nth(2).check()
    await modal.locator(".geo-source-actions .primary").click()
    await idle(page)
    await page
      .locator(".geo-category")
      .filter({ hasText: "GOOGLE" })
      .click()
    await expect(page.locator(".geo-content")).toBeVisible()
    for (const dark of [false, true]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        dark
      )
      const bounds = await modal.evaluate((el) => ({
        box: el.getBoundingClientRect().toJSON(),
        width: innerWidth,
        height: innerHeight,
        list: el
          .querySelector(".geo-entries")!
          .getBoundingClientRect()
          .toJSON()
      }))
      expect(
        Math.abs(
          (bounds.box.left + bounds.box.right) / 2 - bounds.width / 2
        )
      ).toBeLessThan(1)
      expect(bounds.box.top).toBeGreaterThanOrEqual(0)
      expect(bounds.box.bottom).toBeLessThanOrEqual(bounds.height)
      expect(bounds.list.bottom).toBeLessThanOrEqual(bounds.box.bottom)
    }
    await page.getByRole("button", { name: close, exact: true }).click()
    await expect(modal).toHaveCount(0)
    await expect(page).toHaveURL(original)
    await expect(page.locator(".VPNavScreen")).toHaveCount(0)
  })
}

test("closing a downloading popup cancels its worker and cannot reopen on a late reply", async ({
  page,
  context
}) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await context.route(
    "https://slow.example/geosite.dat",
    async (route) => {
      await pending
      await route.abort().catch(() => {})
    }
  )
  await context.addInitScript(() => {
    const Native = Worker
    Object.assign(window, { stoppedWorkers: 0 })
    window.Worker = class extends Native {
      terminate() {
        ;(window as any).stoppedWorkers++
        super.terminate()
      }
    }
  })
  await page.goto("/config/geodata.html")
  await page.evaluate(() => {
    const link = document.createElement("a")
    link.href =
      "/tools/geofileviewer.html?url=https%3A%2F%2Fslow.example%2Fgeosite.dat&type=geosite"
    document.querySelector(".vp-doc")!.append(link)
    link.click()
  })
  await expect(page.locator(".geo-progress")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.locator(".geo-modal")).toHaveCount(0)
  await expect
    .poll(() => page.evaluate(() => (window as any).stoppedWorkers))
    .toBe(1)
  release()
  await expect(page.locator(".geo-modal")).toHaveCount(0)
})
