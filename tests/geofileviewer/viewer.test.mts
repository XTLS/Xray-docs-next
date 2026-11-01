import { test } from "node:test"
import assert from "node:assert/strict"
import { nextTick } from "vue"
import { withViewer, TestWorker, finishSearch } from "./helpers/viewer.mts"

test("Xray dataset targets start loading automatically", () =>
  withViewer(async (viewer) => {
    viewer.actions.openTarget({ type: "preset", index: 1, tag: "US" })
    const preset = TestWorker.instances[0]
    assert.equal(viewer.session.status, "loading")
    assert.equal(preset.last("load").source.name, "geoip-full.dat")
  }, false))

test("whitelisted URL targets wait for loading before selecting the shared category", async () => {
  for (const url of [
    "https://raw.githubusercontent.com/other/repo/main/geosite.dat",
    "https://cdn.jsdelivr.net/gh/other/repo@main/geosite.dat"
  ])
    await withViewer(async (viewer) => {
      viewer.actions.openTarget({
        type: "url",
        url,
        kind: "geosite",
        tag: "google"
      })
      await nextTick()
      assert.equal(TestWorker.instances.length, 0)
      assert.equal(viewer.session.status, "idle")
      assert.equal(viewer.session.loaded, undefined)
      assert.equal(viewer.draft.mode, "url")
      assert.equal(viewer.draft.url, url)
      assert.equal(viewer.draft.kind, "geosite")
      assert.equal(viewer.view.sourceOpen, true)
      assert.equal(viewer.canLoad.value, true)

      await viewer.actions.loadSource()
      assert.equal(viewer.session.status, "loading")
      const worker = TestWorker.instances[0]
      assert.equal(worker.last("load").source.name, url)
      worker.reply({ type: "ready", categoryCount: 2, entryCount: 2 })
      finishSearch(
        worker,
        ["other", "GOOGLE"].map((code, id) => ({
          id,
          code,
          count: 1,
          matches: 1,
          reverseMatch: false,
          attributes: []
        }))
      )
      assert.equal(viewer.results.value.selected?.code, "GOOGLE")
      assert.equal(viewer.view.mobileDetail, true)
    }, false)
})

test("opening a URL target stops previous work and requires another click even for the same source", () =>
  withViewer(async (viewer, previous) => {
    const target = {
      type: "url",
      url: "https://raw.githubusercontent.com/other/repo/main/geoip.dat",
      kind: "geoip",
      tag: "uS"
    } as const
    viewer.actions.updateSource({
      mode: "url",
      url: target.url,
      kind: target.kind
    })
    await viewer.actions.loadSource()
    const pending = TestWorker.instances[1]
    assert.equal(previous.terminated, true)
    viewer.actions.openTarget(target)
    assert.equal(pending.terminated, true)
    assert.equal(TestWorker.instances.length, 2)
    assert.equal(viewer.session.status, "idle")
    assert.equal(viewer.draft.kind, "geoip")
    pending.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    assert.equal(viewer.session.loaded, undefined)
    await viewer.actions.loadSource()
    const loaded = TestWorker.instances[2]
    loaded.reply({ type: "ready", categoryCount: 2, entryCount: 2 })
    finishSearch(
      loaded,
      ["CN", "US"].map((code, id) => ({
        id,
        code,
        count: 1,
        matches: 1,
        reverseMatch: false,
        attributes: []
      }))
    )
    assert.equal(viewer.results.value.selected?.code, "US")
    viewer.actions.openTarget(target)
    await nextTick()
    assert.equal(loaded.terminated, true)
    assert.equal(TestWorker.instances.length, 3)
    assert.equal(viewer.session.loaded, undefined)
    assert.equal(viewer.session.status, "idle")
    assert.equal(viewer.view.sourceOpen, true)
    assert.equal(viewer.draft.url, target.url)
  }))

test("other URL targets are rejected without prefill or a loadable untrusted source", () =>
  withViewer(async (viewer) => {
    const url = "https://example.com/regions.dat?version=2"
    viewer.actions.openTarget({
      type: "url",
      url,
      kind: "geoip",
      tag: "uS"
    })
    assert.equal(TestWorker.instances.length, 0)
    assert.equal(viewer.session.status, "idle")
    assert.equal(viewer.draft.mode, "preset")
    assert.equal(viewer.draft.url, "")
    assert.equal(viewer.view.sourceOpen, true)

    await viewer.actions.loadSource()
    const worker = TestWorker.instances[0]
    assert.equal(worker.last("load").source.name, "geoip-lite.dat")
    worker.reply({ type: "ready", categoryCount: 2, entryCount: 2 })
    finishSearch(
      worker,
      ["CN", "US"].map((code, id) => ({
        id,
        code,
        count: 1,
        matches: 1,
        reverseMatch: false,
        attributes: []
      }))
    )
    assert.equal(viewer.results.value.selected?.code, "CN")
    assert.equal(viewer.view.mobileDetail, false)
  }, false))

test("rejecting a shared target cancels old work while manually entered URLs remain supported on HTTPS", () =>
  withViewer(async (viewer, previous) => {
    viewer.actions.openTarget({
      type: "url",
      url: "https://example.com/first.dat",
      kind: "geosite",
      tag: "google"
    })
    assert.equal(previous.terminated, true)
    previous.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    assert.equal(viewer.session.loaded, undefined)
    assert.equal(viewer.session.status, "idle")
    assert.equal(viewer.draft.url, "")
    assert.equal(TestWorker.instances.length, 1)
    viewer.actions.updateSource({
      mode: "url",
      url: "https://example.com/second.dat"
    })
    await viewer.actions.loadSource()
    const worker = TestWorker.instances[1]
    assert.equal(
      worker.last("load").source.name,
      "https://example.com/second.dat"
    )
    worker.reply({ type: "ready", categoryCount: 1, entryCount: 1 })
    finishSearch(worker, [
      {
        id: 0,
        code: "other",
        count: 1,
        matches: 1,
        reverseMatch: false,
        attributes: []
      }
    ])
    assert.equal(viewer.results.value.categoryMissing, "")
    assert.equal(viewer.results.value.selected?.code, "other")
  }))

test("cancelled or replaced workers cannot update the current dataset", () =>
  withViewer(async (viewer) => {
    const instances = TestWorker.instances
    viewer.actions.updateSource({ presetIndex: 1 })
    await viewer.actions.loadSource()
    const old = instances[0]
    viewer.actions.updateSource({ presetIndex: 0 })
    await viewer.actions.loadSource("uS")
    const current = instances[1]
    assert.equal(old.terminated, true)
    old.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    old.crash()
    assert.equal(viewer.session.loaded, undefined)
    assert.equal(viewer.session.error, undefined)
    current.reply({ type: "ready", categoryCount: 19, entryCount: 1000 })
    assert.equal(viewer.session.loaded?.name, "geoip-lite.dat")
    assert.equal(viewer.session.categoryCount, 19)
    const initialSearch = current.requests.findLast(
      (request) => request.type === "search"
    )!
    if (initialSearch.type !== "search") throw Error()
    current.reply({
      type: "search",
      id: initialSearch.id,
      categories: Array.from({ length: 50 }, (_, id) => ({
        id,
        code: id === 40 ? "US" : `category-${id}`,
        count: 1,
        matches: 1,
        reverseMatch: false,
        attributes: []
      }))
    })
    assert.equal(viewer.results.value.selected?.code, "US")
    assert.equal(
      viewer.results.value.visibleCategories.some((c) => c.code === "US"),
      true
    )
    assert.equal(viewer.results.value.visibleCategories[0].id, 0)
    assert.equal(viewer.view.mobileDetail, true)
    viewer.actions.updateSource({ presetIndex: 2 })
    assert.equal(viewer.session.loaded?.name, "geoip-lite.dat")
    assert.equal(current.terminated, false)
    viewer.actions.focusCategory("missing")
    const missingSearch = current.requests.findLast(
      (request) => request.type === "search"
    )!
    if (missingSearch.type !== "search") throw Error()
    current.reply({ type: "search", id: missingSearch.id, categories: [] })
    assert.equal(viewer.results.value.categoryMissing, "missing")
    viewer.actions.setContentQuery("new query")
    const staleSearch = current.requests.find(
      (request) => request.type === "search"
    )!
    if (staleSearch.type !== "search") throw Error()
    current.reply({
      type: "search",
      id: staleSearch.id,
      categories: [
        {
          id: 0,
          code: "STALE",
          count: 1,
          matches: 1,
          reverseMatch: false,
          attributes: []
        }
      ]
    })
    assert.equal(viewer.results.value.categories.length, 0)
    viewer.actions.dispose()
    current.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    assert.equal(viewer.session.categoryCount, 19)
    assert.equal(viewer.session.status === "loading", false)
    await nextTick()
  }, false))

test("non-HTTPS pages only allow local files, including preset and trusted URL targets", async () => {
  for (const protocol of ["http:", "file:", "data:"]) {
    await withViewer(
      async (viewer) => {
        assert.equal(viewer.remoteAllowed.value, false)
        assert.equal(viewer.draft.mode, "local")
        assert.equal(viewer.canLoad.value, false)
        for (const target of [
          { type: "preset", index: 0, tag: "CN" },
          {
            type: "url",
            url: "https://raw.githubusercontent.com/owner/repo/main/geosite.dat",
            kind: "geosite",
            tag: "A"
          },
          {
            type: "url",
            url: "https://cdn.jsdelivr.net/gh/owner/repo@main/geosite.dat",
            kind: "geosite",
            tag: "A"
          }
        ] as const) {
          viewer.actions.openTarget(target)
          assert.equal(viewer.draft.mode, "local")
          assert.equal(viewer.draft.url, "")
          await viewer.actions.loadSource()
          assert.equal(TestWorker.instances.length, 0)
        }
        viewer.actions.updateSource({
          mode: "url",
          url: "https://example.com/file.dat"
        })
        viewer.actions.updateSource({ mode: "preset" })
        assert.equal(viewer.draft.mode, "local")
        assert.equal(viewer.draft.url, "")
        await viewer.actions.loadSource()
        assert.equal(TestWorker.instances.length, 0)
        const file = new File([Uint8Array.of(10)], "local.dat")
        viewer.actions.updateSource({ file, kind: "geosite" })
        assert.equal(viewer.canLoad.value, true)
        await viewer.actions.loadSource()
        const worker = TestWorker.instances[0]
        assert.equal(worker.last("load").source.mode, "local")
        worker.reply({ type: "ready", categoryCount: 1, entryCount: 1 })
        assert.equal(viewer.session.loaded?.name, "local.dat")
        viewer.actions.resetToHome()
        assert.equal(viewer.draft.mode, "local")
        assert.equal(viewer.canLoad.value, false)
      },
      false,
      "geosite",
      protocol
    )
  }
})
