import { StringAstVisitor } from '../ast-visitor';
import {
  ArithmeticNode,
  ArrayAccessNode,
  AssignmentNode,
  BinaryLogicalNode,
  BinaryLogicalOperation,
  BooleanNode,
  ComparisonNode,
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
} from '../ast';

export class Java9AstVisitor extends StringAstVisitor {
  variablesSeen = new Set<string>();
  hasInput = false;

  visitRootNode(root: RootNode): string {
    let val = super.visitRootNode(root);

    if (this.hasInput) {
      val =
        'import java.util.Scanner;\n\nScanner s = new Scanner(System.in);\n' +
        val;
    }

    return val;
  }

  visitStatementNode(statement: StatementNode): string {
    return this.visit(statement.node) + ';';
  }

  visitFunctionCallNode(functionCall: FunctionCallNode): string {
    return (
      this.visit(functionCall.func) +
      '(' +
      functionCall.args.map((child) => this.visit(child)).join(', ') +
      ')'
    );
  }

  visitArithmeticNode(arithmetic: ArithmeticNode): string {
    return (
      this.visit(arithmetic.left) +
      ' ' +
      this.visitArithmeticOperation(arithmetic.operation) +
      ' ' +
      this.visit(arithmetic.right)
    );
  }

  visitAssignmentNode(assignment: AssignmentNode): string {
    if (this.variablesSeen.has(assignment.name.atom)) {
      return this.visit(assignment.name) + ' = ' + this.visit(assignment.value);
    } else {
      // This is a hack because Python can't differentiate between assignments and declarations.
      this.variablesSeen.add(assignment.name.atom);
      return this.visitDeclarationNode(
        new DeclarationNode(assignment.name, assignment.value)
      );
    }
  }

  visitBinaryLogicalNode(logic: BinaryLogicalNode): string {
    return (
      this.visit(logic.left) +
      ' ' +
      this.visitBinaryLogicalOperation(logic.operation) +
      ' ' +
      this.visit(logic.right)
    );
  }

  visitComparisonNode(comparison: ComparisonNode): string {
    return (
      this.visit(comparison.left) +
      ' ' +
      this.visitComparisonOperation(comparison.operation) +
      ' ' +
      this.visit(comparison.right)
    );
  }

  visitDeclarationNode(declaration: DeclarationNode): string {
    this.variablesSeen.add(declaration.name.atom);
    return (
      this.visitType(declaration.value.type) +
      ' ' +
      this.visit(declaration.name) +
      ' = ' +
      this.visit(declaration.value)
    );
  }

  visitUnaryLogicalNode(logic: UnaryLogicalNode): string {
    return (
      this.visitUnaryLogicalOperation(logic.operation) + this.visit(logic.left)
    );
  }

  visitBinaryLogicalOperation(operation: BinaryLogicalOperation): string {
    switch (operation) {
      case BinaryLogicalOperation.AND:
        return '&&';
      case BinaryLogicalOperation.OR:
        return '||';
    }
  }

  visitUnaryLogicalOperation(operation: UnaryLogicalOperation): string {
    switch (operation) {
      case UnaryLogicalOperation.NOT:
        return '!';
    }
  }

  visitArrayAccessNode(arrayAccess: ArrayAccessNode): string {
    return (
      this.visit(arrayAccess.array) + '[' + this.visit(arrayAccess.index) + ']'
    );
  }

  visitDotAccessNode(dotAccess: DotAccessNode): string {
    return this.visit(dotAccess.left) + '.' + this.visit(dotAccess.right);
  }

  visitIfStatementNode(ifStatement: IfStatementNode): string {
    return (
      'if (' +
      this.visit(ifStatement.condition) +
      ') {\n' +
      ifStatement.statements
        .map((statement) => this.visit(statement))
        .join('\n') +
      '\n' +
      this.indentation(ifStatement.depth) +
      '}' +
      (ifStatement.elseIfs.length > 0 ? '\n\n' : '') +
      ifStatement.elseIfs.map((elseIf) => this.visit(elseIf)).join('\n\n') +
      (ifStatement.els ? '\n\n' + this.visit(ifStatement.els) : '')
    );
  }

  visitElseIfStatementNode(elseIfStatement: ElseIfStatementNode): string {
    return (
      'else if (' +
      this.visit(elseIfStatement.condition) +
      ') {\n' +
      elseIfStatement.statements
        .map((statement) => this.visit(statement))
        .join('\n') +
      '\n' +
      this.indentation(elseIfStatement.depth) +
      '}'
    );
  }

  visitElseStatementNode(elseStatement: ElseStatementNode): string {
    return (
      'else {\n' +
      elseStatement.statements.map((statement) => this.visit(statement)) +
      '\n' +
      this.indentation(elseStatement.depth) +
      '}'
    );
  }

  visitForLoopNode(forLoopNode: ForLoopNode): string {
    return (
      'for (' +
      this.visitType(forLoopNode.start.type) +
      ' ' +
      this.visit(forLoopNode.controlVariable) +
      ' = ' +
      this.visit(forLoopNode.start) +
      '; ' +
      this.visit(forLoopNode.controlVariable) +
      ' < ' +
      this.visit(forLoopNode.stop) +
      '; ' +
      this.visit(forLoopNode.controlVariable) +
      ' += ' +
      this.visit(forLoopNode.step) +
      ') {\n' +
      forLoopNode.statements
        .map((statement) => this.visit(statement))
        .join('\n') +
      '\n' +
      this.indentation(forLoopNode.depth) +
      '}'
    );
  }

  visitWhileLoopNode(whileLoop: WhileLoopNode): string {
    return (
      'while (' +
      this.visit(whileLoop.condition) +
      ') {\n' +
      whileLoop.statements
        .map((statement) => this.visit(statement))
        .join('\n') +
      '\n' +
      this.indentation(whileLoop.depth) +
      '}'
    );
  }

  visitBooleanNode(bool: BooleanNode): string {
    return bool.value ? 'true' : 'false';
  }

  visitStringNode(str: StringNode): string {
    return '"' + str.atom + '"';
  }

  visitIntNode(int: IntNode): string {
    return int.atom;
  }

  visitInputNode(input: InputNode): string {
    this.hasInput = true;
    return 's.next()';
  }

  visitIntConversionNode(intConversion: IntConversionNode): string {
    return 'Integer.parseInt(' + this.visit(intConversion.arg) + ')';
  }

  visitPrintNode(print: PrintNode): string {
    if (print.args.length === 0) {
      return 'System.out.println()';
    } else {
      return print.args
        .map(
          (pr, i) =>
            (i !== 0 ? this.indentation(print.depth) : '') +
            'System.out.println(' +
            this.visit(pr) +
            ');'
        )
        .join('\n');
    }
  }

  visitType(type: Type): string {
    let typeName: string;

    switch (type.type) {
      case PrimitiveType.BOOLEAN:
        typeName = 'boolean';
        break;
      case PrimitiveType.FLOAT:
        typeName = 'float';
        break;
      case PrimitiveType.INTEGER:
        typeName = 'int';
        break;
      case PrimitiveType.OBJECT:
        typeName = 'Object';
        break;
      case PrimitiveType.STRING:
        typeName = 'String';
        break;
    }

    if (type.isArray) {
      typeName += '[]';
    }

    return typeName;
  }
}
