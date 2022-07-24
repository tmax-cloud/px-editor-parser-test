import { Ast } from './ast';
import { ParserRuleContext } from 'antlr4ts';
import { TypeAstVisitor } from './type-ast-visitor';
import { DepthAstVisitor } from './depth-ast-visitor';

/**
 * The interface implemented by all services that provide a language.
 * {@code R} is the root node of the ANTLR tree.
 */
export abstract class LanguageService<R extends ParserRuleContext> {
  abstract convertCodeToAntlr(code: string): R;
  abstract convertAntlrToAst(antlrRoot: R): Ast;

  convertAstToCode(ast: Ast): string {
    const typeVisitor = new TypeAstVisitor();
    typeVisitor.visit(ast.root);

    const depthVisitor = new DepthAstVisitor();
    depthVisitor.visit(ast.root);

    console.log('pre-processed ast:', ast.root);
    return 'please override';
  }

  convertCodeToAst(code: string): Ast {
    return this.convertAntlrToAst(this.convertCodeToAntlr(code));
  }
}
