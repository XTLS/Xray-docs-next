import type { ViewerWorker } from "../../../.vitepress/theme/components/geofileviewer/workerClient.mts"
import type {
  WorkerRequest,
  WorkerResponse
} from "../../../.vitepress/theme/components/geofileviewer/types.mts"

export class TestWorker implements ViewerWorker {
  static instances: TestWorker[] = []
  onmessage: ViewerWorker["onmessage"] = null
  onerror: ViewerWorker["onerror"] = null
  requests: WorkerRequest[] = []
  terminated = false
  constructor() {
    TestWorker.instances.push(this)
  }
  postMessage(message: WorkerRequest) {
    this.requests.push(message)
  }
  terminate() {
    this.terminated = true
  }
  reply(data: WorkerResponse) {
    this.onmessage?.({ data } as MessageEvent<WorkerResponse>)
  }
  crash() {
    this.onerror?.({} as ErrorEvent)
  }
  last<T extends WorkerRequest["type"]>(type: T) {
    return this.requests.findLast(
      (request) => request.type === type
    ) as Extract<WorkerRequest, { type: T }>
  }
}
