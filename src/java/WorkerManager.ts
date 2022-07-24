import * as monaco from "monaco-editor-core";

import Uri = monaco.Uri;
import { JavaWorker } from "./javaWorker";
import { languageID } from "./config";

export class WorkerManager {
  private worker: monaco.editor.MonacoWebWorker<JavaWorker>;
  private workerClientProxy: Promise<JavaWorker>;

  constructor() {
    this.worker = null;
  }

  private getClientProxy(): Promise<JavaWorker> {
    if (!this.workerClientProxy) {
      this.worker = monaco.editor.createWebWorker<JavaWorker>({
        // module that exports the create() method and returns a `JSONWorker` instance
        moduleId: "JavaWorker",
        label: languageID,
        // passed in to the create() method
        createData: {
          languageId: languageID,
        },
      });

      this.workerClientProxy = <Promise<JavaWorker>>(
        (<any>this.worker.getProxy())
      );
    }

    return this.workerClientProxy;
  }

  async getLanguageServiceWorker(...resources: Uri[]): Promise<JavaWorker> {
    const _client: JavaWorker = await this.getClientProxy();
    await this.worker.withSyncedResources(resources);
    return _client;
  }
}
