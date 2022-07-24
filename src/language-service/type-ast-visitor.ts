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
  PrimitiveType,
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
 * Traverses an AST and adds types.
 */
export class TypeAstVisitor extends AstVisitor<void> {
  vars = {}; // Keeps track of variables for their types. Assumes a single scope. This is bad!

  visitStatementNode(statement: StatementNode): void {
    this.visit(statement.node);
  }

  visitArithmeticNode(arithmetic: ArithmeticNode): void {
    this.visit(arithmetic.left);
    this.visit(arithmetic.right);

    console.log(arithmetic);

    if (
      arithmetic.left.type.type === PrimitiveType.STRING ||
      arithmetic.right.type.type === PrimitiveType.STRING
    ) {
      arithmetic.type = { type: PrimitiveType.STRING, isArray: false };
    } else if (
      arithmetic.left.type.type === PrimitiveType.FLOAT ||
      arithmetic.right.type.type === PrimitiveType.FLOAT
    ) {
      arithmetic.type = { type: PrimitiveType.FLOAT, isArray: false };
    } else {
      arithmetic.type = { type: PrimitiveType.INTEGER, isArray: false };
    }
  }

  visitArithmeticOperation(operation: ArithmeticOperation): void {}

  visitArrayAccessNode(arrayAccess: ArrayAccessNode): void {
    this.visit(arrayAccess.array);
    this.visit(arrayAccess.index);
  }

  visitDeclarationNode(declaration: DeclarationNode): void {
    this.visit(declaration.name);
    this.visit(declaration.value);

    declaration.name.type = { ...declaration.value.type };
    this.vars[declaration.name.atom] = { ...declaration.name.type };
    console.log(
      'updated type of',
      declaration.name.atom,
      'to',
      declaration.name.type
    );
  }

  visitAssignmentNode(assignment: AssignmentNode): void {
    this.visit(assignment.name);
    this.visit(assignment.value);

    assignment.name.type = { ...assignment.value.type };
    this.vars[assignment.name.atom] = { ...assignment.name.type };
    console.log(
      'updated type of',
      assignment.name.atom,
      'to',
      assignment.name.type
    );
  }

  visitAtomNode(atom: AtomNode): void {
    if (/^-?\d+$/g.test(atom.atom)) {
      atom.type = { type: PrimitiveType.INTEGER, isArray: false };
    } else if (!isNaN(parseFloat(atom.atom))) {
      atom.type = { type: PrimitiveType.FLOAT, isArray: false };
    } else {
      if (atom.atom in this.vars) {
        console.log(atom.atom, this.vars[atom.atom]);
        atom.type = { ...this.vars[atom.atom] };
      } else {
        atom.type = { type: PrimitiveType.OBJECT, isArray: false };
        this.vars[atom.atom] = { ...atom.type };
      }
    }

    console.log(atom);
  }

  visitBinaryLogicalNode(logic: BinaryLogicalNode): void {
    this.visit(logic.left);
    this.visit(logic.right);

    logic.type = { type: PrimitiveType.BOOLEAN, isArray: false };
  }

  visitBinaryLogicalOperation(operation: BinaryLogicalOperation): void {}

  visitComparisonNode(comparison: ComparisonNode): void {
    this.visit(comparison.left);
    this.visit(comparison.right);

    comparison.type = { type: PrimitiveType.BOOLEAN, isArray: false };
  }

  visitComparisonOperation(operation: ComparisonOperation): void {}

  visitDotAccessNode(dotAccess: DotAccessNode): void {
    this.visit(dotAccess.left);
    this.visit(dotAccess.right);

    dotAccess.type = { ...dotAccess.right.type };
  }

  visitElseIfStatementNode(elseIfStatement: ElseIfStatementNode): void {
    this.visit(elseIfStatement.condition);
    elseIfStatement.statements.forEach((statement) => this.visit(statement));
  }

  visitElseStatementNode(elseStatement: ElseStatementNode): void {
    elseStatement.statements.forEach((statement) => this.visit(statement));
  }

  visitForLoopNode(forLoopNode: ForLoopNode): void {
    this.visit(forLoopNode.controlVariable);
    this.visit(forLoopNode.start);
    this.visit(forLoopNode.stop);
    this.visit(forLoopNode.step);
    forLoopNode.statements.forEach((statement) => this.visit(statement));
  }

  visitFunctionCallNode(functionCall: FunctionCallNode): void {
    this.visit(functionCall.func);
    functionCall.args.forEach((arg) => this.visit(arg));

    // TODO: Can hard-code some functions for some languages (print, input).
    functionCall.type = { type: PrimitiveType.OBJECT, isArray: false };
  }

  visitIfStatementNode(ifStatement: IfStatementNode): void {
    this.visit(ifStatement.condition);
    ifStatement.statements.forEach((statement) => this.visit(statement));
    ifStatement.elseIfs.forEach((elseIf) => this.visit(elseIf));

    if (ifStatement.els) {
      this.visit(ifStatement.els);
    }
  }

  visitRootNode(root: RootNode): void {
    root.children.forEach((statement) => this.visit(statement));
  }

  visitUnaryLogicalNode(logic: UnaryLogicalNode): void {
    this.visit(logic.left);

    logic.type = { type: PrimitiveType.BOOLEAN, isArray: false };
  }

  visitUnaryLogicalOperation(operation: UnaryLogicalOperation): void {}

  visitWhileLoopNode(whileLoop: WhileLoopNode): void {
    this.visit(whileLoop.condition);
    whileLoop.statements.forEach((statement) => this.visit(statement));
  }

  visitType(type: Type): void {}

  visitBooleanNode(bool: BooleanNode): void {
    bool.type = { type: PrimitiveType.BOOLEAN, isArray: false };
  }

  visitStringNode(str: StringNode): void {
    str.type = { type: PrimitiveType.STRING, isArray: false };
  }

  visitIntNode(int: IntNode): void {
    int.type = { type: PrimitiveType.INTEGER, isArray: false };
  }

  visitInputNode(input: InputNode): void {
    input.type = { type: PrimitiveType.STRING, isArray: false };
  }

  visitPrintNode(print: PrintNode): void {}

  visitIntConversionNode(intConversion: IntConversionNode): void {
    intConversion.type = { type: PrimitiveType.INTEGER, isArray: false };
  }
}
