import {
  ArithmeticNode,
  ArithmeticOperation,
  ArrayAccessNode,
  AssignmentNode,
  AtomNode,
  BinaryLogicalNode,
  BinaryLogicalOperation,
  BooleanNode,
  ComparisonNode,
  ComparisonOperation,
  DeclarationNode,
  DotAccessNode,
  ElseIfStatementNode,
  ElseStatementNode,
  ForLoopNode,
  FunctionCallNode,
  IfStatementNode,
  InputNode,
  IntConversionNode,
  IntNode,
  PrintNode,
  RootNode,
  StatementNode,
  StringNode,
  Type,
  UnaryLogicalNode,
  UnaryLogicalOperation,
  WhileLoopNode,
} from './ast';
import { AstVisitor } from './ast-visitor';

/**
 * Traverses an AST and adds depth information.
 */
export class DepthAstVisitor extends AstVisitor<void> {
  visitStatementNode(statement: StatementNode): void {
    statement.node.depth = statement.depth;
    this.visit(statement.node);
  }

  visitArithmeticNode(arithmetic: ArithmeticNode): void {
    this.visit(arithmetic.left);
    this.visit(arithmetic.right);
  }

  visitArithmeticOperation(operation: ArithmeticOperation): void {}

  visitArrayAccessNode(arrayAccess: ArrayAccessNode): void {
    this.visit(arrayAccess.array);
    this.visit(arrayAccess.index);
  }

  visitDeclarationNode(declaration: DeclarationNode): void {
    this.visit(declaration.name);
    this.visit(declaration.value);
  }

  visitAssignmentNode(assignment: AssignmentNode): void {
    this.visit(assignment.name);
    this.visit(assignment.value);
  }

  visitAtomNode(atom: AtomNode): void {}

  visitBinaryLogicalNode(logic: BinaryLogicalNode): void {
    this.visit(logic.left);
    this.visit(logic.right);
  }

  visitBinaryLogicalOperation(operation: BinaryLogicalOperation): void {}

  visitComparisonNode(comparison: ComparisonNode): void {
    this.visit(comparison.left);
    this.visit(comparison.right);
  }

  visitComparisonOperation(operation: ComparisonOperation): void {}

  visitDotAccessNode(dotAccess: DotAccessNode): void {
    this.visit(dotAccess.left);
    this.visit(dotAccess.right);
  }

  visitElseIfStatementNode(elseIfStatement: ElseIfStatementNode): void {
    this.visit(elseIfStatement.condition);
    elseIfStatement.statements.forEach((statement) => {
      statement.depth = elseIfStatement.depth + 1;
      this.visit(statement);
    });
  }

  visitElseStatementNode(elseStatement: ElseStatementNode): void {
    elseStatement.statements.forEach((statement) => {
      statement.depth = elseStatement.depth + 1;
      this.visit(statement);
    });
  }

  visitForLoopNode(forLoopNode: ForLoopNode): void {
    this.visit(forLoopNode.controlVariable);
    this.visit(forLoopNode.start);
    this.visit(forLoopNode.stop);
    this.visit(forLoopNode.step);
    forLoopNode.statements.forEach((statement) => {
      statement.depth = forLoopNode.depth + 1;
      this.visit(statement);
    });
  }

  visitFunctionCallNode(functionCall: FunctionCallNode): void {
    this.visit(functionCall.func);
    functionCall.args.forEach((arg) => this.visit(arg));
  }

  visitIfStatementNode(ifStatement: IfStatementNode): void {
    this.visit(ifStatement.condition);

    ifStatement.statements.forEach((statement) => {
      statement.depth = ifStatement.depth + 1;
      this.visit(statement);
    });

    ifStatement.elseIfs.forEach((elseIf) => {
      elseIf.depth = ifStatement.depth;
      this.visit(elseIf);
    });

    if (ifStatement.els) {
      ifStatement.els.depth = ifStatement.depth;
      this.visit(ifStatement.els);
    }
  }

  visitRootNode(root: RootNode): void {
    root.children.forEach((statement) => this.visit(statement));
  }

  visitUnaryLogicalNode(logic: UnaryLogicalNode): void {
    this.visit(logic.left);
  }

  visitUnaryLogicalOperation(operation: UnaryLogicalOperation): void {}

  visitWhileLoopNode(whileLoop: WhileLoopNode): void {
    this.visit(whileLoop.condition);
    whileLoop.statements.forEach((statement) => {
      statement.depth = whileLoop.depth + 1;
      this.visit(statement);
    });
  }

  visitType(type: Type): void {}

  visitBooleanNode(bool: BooleanNode): void {}

  visitStringNode(str: StringNode): void {}

  visitIntNode(int: IntNode): void {}

  visitInputNode(input: InputNode): void {}

  visitPrintNode(print: PrintNode): void {}

  visitIntConversionNode(intConversion: IntConversionNode): void {}
}
