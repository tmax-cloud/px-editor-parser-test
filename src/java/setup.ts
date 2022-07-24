import * as monaco from "monaco-editor-core";
import { languageExtensionPoint, languageID } from "./config";
import { conf, language } from "./java";
// import { conf } from "./java";
import { JavaWorker } from "./javaWorker";
import { WorkerManager } from "./WorkerManager";
import DiagnosticsAdapter from "./DiagnosticsAdapter";

export function setupLanguage() {
    (window as any).MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
            return "./javaWorker.js";
            if (label === languageID)
                return "./javaWorker.js";
            return './editor.worker.js';
        }
    }
    monaco.languages.register(languageExtensionPoint);
    monaco.languages.onLanguage(languageID, () => {
        monaco.languages.setMonarchTokensProvider(languageID, language);
        monaco.languages.setLanguageConfiguration(languageID, conf);
        const client = new WorkerManager();

        const worker: WorkerAccessor = (...uris: monaco.Uri[]): Promise<JavaWorker> => {
            return client.getLanguageServiceWorker(...uris);
        };

        new DiagnosticsAdapter(worker);

        // monaco.languages.registerDocumentFormattingEditProvider(languageID, new TodoLangFormattingProvider(worker));
    });

}

export type WorkerAccessor = (...uris: monaco.Uri[]) => Promise<JavaWorker>;
