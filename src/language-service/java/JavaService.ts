import { Injectable } from '@angular/core';
import { LanguageService } from '../language-service';
import { Ast } from '../ast';
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { Java9Lexer } from '../../ANTLR/Java9Lexer';
import { BlockContext, Java9Parser } from '../../ANTLR/Java9Parser';
import { TranscodeJava9Visitor } from './TranscodeJava9Visitor';
import { Java9AstVisitor } from './Java9AstVisitor';

@Injectable({
  providedIn: 'root',
})
export class JavaService extends LanguageService<BlockContext> {
  convertCodeToAntlr(code: string): BlockContext {
    const inputStream = CharStreams.fromString('{' + code + '}');
    const lexer = new Java9Lexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new Java9Parser(tokenStream);
    return parser.block();
  }

  convertAntlrToAst(antlrRoot: BlockContext): Ast {
    const visitor = new TranscodeJava9Visitor();
    const root = visitor.visitBlock(antlrRoot);
    return { root };
  }

  convertAstToCode(ast: Ast): string {
    super.convertAstToCode(ast);
    const visitor = new Java9AstVisitor();
    return visitor.visit(ast.root);
  }
}
