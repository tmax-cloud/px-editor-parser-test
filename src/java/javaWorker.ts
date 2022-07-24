import * as monaco from "monaco-editor-core";
import { Ast } from '../language-service/ast';

import IWorkerContext = monaco.worker.IWorkerContext;
import { JavaService } from "../language-service/java/JavaService";
// import { ITodoLangError } from "../language-service/TodoLangErrorListener";
import { BlockContext, Java9Parser } from '../ANTLR/Java9Parser';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JavaWorker {
  private _ctx: IWorkerContext;
  private languageService: JavaService;

  constructor(ctx: IWorkerContext) {
    this._ctx = ctx;
    this.languageService = new JavaService();
  }

  doValidation(): Promise<BlockContext> {
    const code = this.getTextDocument();
    return Promise.resolve(this.languageService.convertCodeToAntlr(code));
  }
  //TODO:AST
  // getAST(): Promise<Ast> {
  //   const code = this.getTextDocument();
  //   let x :BlockContext = this.languageService.convertCodeToAntlr(code);
  //   return Promise.resolve(this.languageService.convertAntlrToAst(x));
  // }

  private getTextDocument(): string {
    const model = this._ctx.getMirrorModels()[0]; // When there are multiple files open, this will be an array
    return model.getValue();
  }
}
