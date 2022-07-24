import { Java9Visitor } from '../../ANTLR/Java9Visitor';
import {
  ArithmeticNode,
  AssignmentNode,
  AtomNode,
  BinaryLogicalNode,
  BinaryLogicalOperation,
  BooleanNode,
  ComparisonNode,
  DeclarationNode,
  DotAccessNode,
  ElseIfStatementNode,
  ElseStatementNode,
  ExpressionNode,
  ForLoopNode,
  FunctionCallNode,
  IfStatementNode,
  InputNode,
  IntConversionNode,
  Node,
  PrintNode,
  RootNode,
  StatementNode,
  StringNode,
  UnaryLogicalOperation,
} from '../ast';
import {
  AdditiveExpressionContext,
  AssignmentContext,
  BasicForStatementContext,
  BlockContext,
  BlockStatementContext,
  BlockStatementsContext,
  ConditionalAndExpressionContext,
  ConditionalOrExpressionContext,
  EqualityExpressionContext,
  IfThenElseStatementContext,
  IfThenStatementContext,
  LocalVariableDeclarationContext,
  MethodInvocation_lfno_primaryContext,
  MethodInvocationContext,
  MultiplicativeExpressionContext,
  RelationalExpressionContext,
  TypeNameContext,
  VariableDeclaratorContext,
} from '../../ANTLR/Java9Parser';
import { TranscodeVisitor } from '../transcode-visitor';
import { ParseTree } from 'antlr4ts/tree';

export class TranscodeJava9Visitor extends TranscodeVisitor
  implements Java9Visitor<Node> {
  seenRoot = false;

  visitBlock(ctx: BlockContext) {
    if (!this.seenRoot) {
      this.seenRoot = true;
      return new RootNode(
        ctx
          .blockStatements()
          .blockStatement()
          .map((child) => this.visit(child)) as StatementNode[]
      );
    }
  }

  visitBlockStatement(ctx: BlockStatementContext) {
    if (
      ctx.statement() &&
      (ctx.statement().forStatement() ||
        ctx.statement().ifThenStatement() ||
        ctx.statement().ifThenElseStatement() ||
        ctx.statement().whileStatement())
    ) {
      // Don't wrap these things in a block.
      return undefined;
    } else {
      return new StatementNode(this.visit(ctx.getChild(0)));
    }
  }

  visitMethodInvocation(ctx: MethodInvocationContext) {
    console.log(ctx);

    if (ctx.childCount >= 5) {
      let identifier: Node;
      let args: Node[];

      if (ctx.typeName()) {
        identifier = new DotAccessNode(
          this.visit(ctx.typeName()) as ExpressionNode,
          this.visit(ctx.identifier()) as AtomNode
        );
      } else {
        identifier = this.visitAtom(ctx.methodName());
      }

      if (ctx.argumentList()) {
        args = ctx.argumentList().children.map((child) => this.visit(child));
      } else {
        args = [];
      }

      if (
        identifier instanceof DotAccessNode &&
        identifier.left instanceof DotAccessNode &&
        identifier.left.left instanceof AtomNode &&
        identifier.left.left.atom === 'System' &&
        identifier.left.right instanceof AtomNode &&
        identifier.left.right.atom === 'out' &&
        identifier.right instanceof AtomNode &&
        identifier.right.atom === 'println'
      ) {
        return new PrintNode(args as ExpressionNode[]);
      } else if (
        identifier instanceof DotAccessNode &&
        identifier.left instanceof AtomNode &&
        identifier.left.atom === 's' &&
        identifier.right instanceof AtomNode &&
        identifier.right.atom === 'next'
      ) {
        return new InputNode();
      } else if (
        identifier instanceof DotAccessNode &&
        identifier.left instanceof AtomNode &&
        identifier.left.atom === 'Integer' &&
        identifier.right instanceof AtomNode &&
        identifier.right.atom === 'parseInt'
      ) {
        return new IntConversionNode(args[0] as ExpressionNode);
      }

      return new FunctionCallNode(
        identifier as ExpressionNode,
        args as ExpressionNode[]
      );
    }
  }

  visitMethodInvocation_lfno_primary(
    ctx: MethodInvocation_lfno_primaryContext
  ) {
    return this.visitMethodInvocation(ctx as MethodInvocationContext);
  }

  visitTypeName(ctx: TypeNameContext) {
    if (ctx.childCount === 3) {
      const left = this.visit(ctx.packageOrTypeName());
      const right = this.visit(ctx.identifier());
      return new DotAccessNode(left as ExpressionNode, right as AtomNode);
    }
  }

  visitLocalVariableDeclaration(ctx: LocalVariableDeclarationContext) {
    // TODO: Handle types.
    return this.visit(ctx.getChild(1));
  }

  visitVariableDeclarator(ctx: VariableDeclaratorContext) {
    const name = this.visit(ctx.variableDeclaratorId());
    const value = this.visit(ctx.variableInitializer());
    return new DeclarationNode(name as AtomNode, value as ExpressionNode);
  }

  visitAssignment(ctx: AssignmentContext) {
    if (ctx.childCount === 3) {
      // TODO: look at assignmentOperator.
      const name = this.visit(ctx.leftHandSide());
      const value = this.visit(ctx.expression());
      return new AssignmentNode(name as AtomNode, value as ExpressionNode);
    }
  }

  visitAdditiveExpression(ctx: AdditiveExpressionContext) {
    if (ctx.childCount === 3) {
      const lhs = this.visit(ctx.additiveExpression());
      const rhs = this.visit(ctx.multiplicativeExpression());
      const operator = this.visitArithmeticOperation(ctx.getChild(1));
      return new ArithmeticNode(
        lhs as ExpressionNode,
        rhs as ExpressionNode,
        operator
      );
    }
  }

  visitMultiplicativeExpression(ctx: MultiplicativeExpressionContext) {
    if (ctx.childCount === 3) {
      const lhs = this.visit(ctx.multiplicativeExpression());
      const rhs = this.visit(ctx.unaryExpression());
      const operator = this.visitArithmeticOperation(ctx.getChild(1));
      return new ArithmeticNode(
        lhs as ExpressionNode,
        rhs as ExpressionNode,
        operator
      );
    }
  }

  visitEqualityExpression(ctx: EqualityExpressionContext) {
    if (ctx.childCount === 3) {
      const lhs = this.visit(ctx.equalityExpression());
      const rhs = this.visit(ctx.relationalExpression());
      const operator = this.visitComparisonOperation(ctx.getChild(1));
      return new ComparisonNode(
        lhs as ExpressionNode,
        rhs as ExpressionNode,
        operator
      );
    }
  }

  visitRelationalExpression(ctx: RelationalExpressionContext) {
    // TODO: instanceof should be a separate node.
    if (ctx.childCount === 3) {
      const lhs = this.visit(ctx.relationalExpression());
      const rhs = this.visit(ctx.shiftExpression());
      const operator = this.visitComparisonOperation(ctx.getChild(1));
      return new ComparisonNode(
        lhs as ExpressionNode,
        rhs as ExpressionNode,
        operator
      );
    }
  }

  visitConditionalAndExpression(ctx: ConditionalAndExpressionContext) {
    if (ctx.childCount === 3) {
      const left = this.visit(ctx.conditionalAndExpression());
      const right = this.visit(ctx.inclusiveOrExpression());
      return new BinaryLogicalNode(
        left as ExpressionNode,
        right as ExpressionNode,
        BinaryLogicalOperation.AND
      );
    }
  }

  visitConditionalOrExpression(ctx: ConditionalOrExpressionContext) {
    if (ctx.childCount === 3) {
      const left = this.visit(ctx.conditionalOrExpression());
      const right = this.visit(ctx.conditionalAndExpression());
      return new BinaryLogicalNode(
        left as ExpressionNode,
        right as ExpressionNode,
        BinaryLogicalOperation.OR
      );
    }
  }

  visitBasicForStatement(ctx: BasicForStatementContext) {
    const init = ctx
      .forInit()
      .localVariableDeclaration()
      .variableDeclaratorList()
      .variableDeclarator()[0];
    const controlVariable = this.visit(init.variableDeclaratorId());
    const start = this.visit(init.variableInitializer());

    const condition = this.visit(ctx.expression()) as ComparisonNode;
    const stop = condition.right;

    const update = this.visit(ctx.forUpdate()) as AssignmentNode;
    const step = update.value;

    const statements = ctx
      .statement()
      .statementWithoutTrailingSubstatement()
      .block()
      .blockStatements()
      .blockStatement()
      .map((statement) => this.visit(statement));

    return new ForLoopNode(
      controlVariable as AtomNode,
      start as ExpressionNode,
      stop,
      step,
      statements as StatementNode[]
    );
  }

  // If statement parsing
  visitIfThenStatement(ctx: IfThenStatementContext) {
    const expr = this.visit(ctx.getChild(2));
    const statements = this.parseStatementsIf(ctx);
    return new IfStatementNode(expr as ExpressionNode, statements);
  }

  parseStatementsIfElse(ctx: IfThenElseStatementContext): StatementNode[] {
    const statements: StatementNode[] = [];
    if (
      ctx.statementNoShortIf().statementWithoutTrailingSubstatement().block()
    ) {
      const stats = ctx
        .statementNoShortIf()
        .statementWithoutTrailingSubstatement()
        .block()
        .getChild(1) as BlockStatementsContext;
      for (const child of stats.children) {
        statements.push(this.visit(child) as StatementNode);
      }
    }
    return statements;
  }

  parseStatementsIf(ctx: IfThenStatementContext): StatementNode[] {
    const statements: StatementNode[] = [];
    if (ctx.statement().statementWithoutTrailingSubstatement().block()) {
      const stats = ctx
        .statement()
        .statementWithoutTrailingSubstatement()
        .block()
        .getChild(1) as BlockStatementsContext;
      for (const child of stats.children) {
        statements.push(this.visit(child) as StatementNode);
      }
    }
    return statements;
  }

  visitIfThenElseStatement(ctx: IfThenElseStatementContext) {
    const expr = this.visit(ctx.getChild(2));
    const origStats = this.parseStatementsIfElse(ctx);
    const elseIfs: ElseIfStatementNode[] = [];
    let elseE: ElseStatementNode = undefined;

    let currCTX: IfThenElseStatementContext = ctx;
    while (true) {
      if (
        (currCTX.statement() &&
          currCTX.statement().getChild(0) instanceof
            IfThenElseStatementContext) ||
        currCTX.statement().getChild(0) instanceof IfThenStatementContext
      ) {
        const newCTX = currCTX.statement().getChild(0) as
          | IfThenElseStatementContext
          | IfThenStatementContext;

        let currStatements;
        if (newCTX instanceof IfThenElseStatementContext) {
          currStatements = this.parseStatementsIfElse(newCTX);
        } else {
          currStatements = this.parseStatementsIf(newCTX);
        }

        elseIfs.push(
          new ElseIfStatementNode(
            this.visit(newCTX.getChild(2)) as ExpressionNode,
            currStatements
          )
        );

        if (newCTX instanceof IfThenElseStatementContext) {
          currCTX = newCTX;
        } else {
          currCTX = null;
          break;
        }
      } else {
        break;
      }
    }

    if (currCTX) {
      if (currCTX.statement().statementWithoutTrailingSubstatement().block()) {
        const stats = currCTX
          .statement()
          .statementWithoutTrailingSubstatement()
          .block()
          .getChild(1) as BlockStatementsContext;
        const statements: StatementNode[] = [];
        for (const child of stats.children) {
          statements.push(this.visit(child) as StatementNode);
        }
        elseE = new ElseStatementNode(statements);
      }
    }

    return new IfStatementNode(
      expr as ExpressionNode,
      origStats,
      elseIfs,
      elseE
    );
  }

  visitAtom(ctx: ParseTree): AtomNode {
    if (ctx.text === 'true' || ctx.text === 'false') {
      return new BooleanNode(ctx.text === 'true');
    } else if (ctx.text.startsWith('"')) {
      return new StringNode(ctx.text.substring(1, ctx.text.length - 1));
    }

    return super.visitAtom(ctx);
  }

  visitUnaryLogicalOperation(operation: ParseTree): UnaryLogicalOperation {
    switch (operation.text) {
      case '!':
        return UnaryLogicalOperation.NOT;
    }
  }

  visitBinaryLogicalOperation(operation: ParseTree): BinaryLogicalOperation {
    switch (operation.text) {
      case '&&':
        return BinaryLogicalOperation.AND;
      case '||':
        return BinaryLogicalOperation.OR;
    }
  }
}
