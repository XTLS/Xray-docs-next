import { test } from "node:test"
import assert from "node:assert/strict"
import {
  createWorkerClient,
  type ViewerEvent
} from "../../.vitepress/theme/components/geofileviewer/workerClient.mts"
import { TestWorker } from "./helpers/worker.mts"

const source = {
  mode: "local",
  name: "test.dat",
  kind: "geosite",
  file: new Blob()
} as const

test("worker client owns session lifetime and ignores events from a replaced worker", () => {
  const events: ViewerEvent[] = []
  const workers: TestWorker[] = []
  const client = createWorkerClient(() => {
    const worker = new TestWorker()
    workers.push(worker)
    return worker
  })
  client.load(source, (event) => events.push(event))
  const old = workers[0]
  client.load(source, (event) => events.push(event))
  assert.equal(old.terminated, true)
  old.reply({ type: "ready", categoryCount: 99, entryCount: 99 })
  old.crash()
  assert.deepEqual(events, [])
  workers[1].reply({ type: "ready", categoryCount: 1, entryCount: 2 })
  assert.equal(events.length, 1)
  client.dispose()
  assert.equal(client.active, false)
  assert.equal(workers[1].terminated, true)
  workers[1].reply({ type: "error", code: "invalidFile" })
  assert.equal(events.length, 1)
})

test("worker client validates search and entry requests and accepts each batch once", () => {
  const events: ViewerEvent[] = []
  const worker = new TestWorker()
  const client = createWorkerClient(() => worker)
  client.load(source, (event) => events.push(event))
  client.search("old")
  const old = worker.last("search")
  assert.equal(old.ipMode, "ip")
  client.invalidateSearch()
  worker.reply({ type: "search", id: old.id, categories: [] })
  assert.equal(events.length, 0)
  client.search("new", "cidr")
  assert.equal(worker.last("search").ipMode, "cidr")
  worker.reply({
    type: "search",
    id: worker.last("search").id,
    categories: []
  })
  assert.equal(events.length, 1)
  client.entries(0, 1)
  const entries = worker.last("entries")
  const requests = worker.requests.length
  client.entries(0, 1)
  assert.equal(worker.requests.length, requests)
  worker.reply({
    type: "entries",
    id: entries.id,
    page: 2,
    total: 1,
    entries: []
  })
  assert.equal(events.length, 1)
  worker.reply({
    type: "entries",
    id: entries.id,
    page: 1,
    total: 1,
    entries: []
  })
  worker.reply({
    type: "entries",
    id: entries.id,
    page: 1,
    total: 1,
    entries: []
  })
  assert.equal(events.length, 2)
  client.entries(0, 2)
  const stale = worker.last("entries")
  client.cancelEntries()
  worker.reply({
    type: "entries",
    id: stale.id,
    page: 2,
    total: 1,
    entries: []
  })
  assert.equal(events.length, 2)
})
