export enum ArithmeticOperation {
  ADDITION = '+',
  SUBTRACTION = '-',
  MULTIPLICATION = '*',
  DIVISION = '/',
  MODULUS = '%',
}

export enum UnaryLogicalOperation {
  NOT = 'NOT',
}

export enum BinaryLogicalOperation {
  AND = 'AND',
  OR = 'OR',
}

export enum ComparisonOperation {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN_EQUAL_TO = 'LESS_THAN_EQUAL_TO',
  GREATER_THAN_EQUAL_TO = 'GREATER_THAN_EQUAL_TO',
}

export enum PrimitiveType {
  INTEGER = 'INTEGER',
  FLOAT = 'FLOAT',
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  OBJECT = 'OBJECT',
}

export interface Type {
  type: PrimitiveType;
  isArray: boolean;
}

export interface Ast {
  root: RootNode;
}

export abstract class Node {
  depth = 0;

  protected constructor(public nodeType: string) {}
}

export class RootNode extends Node {
  constructor(public children: Node[]) {
    super('root');
  }
}

export class StatementNode extends Node {
  constructor(public node: Node) {
    super('statement');
  }
}

export abstract class ExpressionNode extends Node {
  type: Type;

  protected constructor(nodeType: string) {
    super(nodeType);
  }
}

export class DeclarationNode extends Node {
  constructor(public name: AtomNode, public value: ExpressionNode) {
    super('declaration');
  }
}

export class AssignmentNode extends Node {
  constructor(public name: AtomNode, public value: ExpressionNode) {
    super('assignment');
  }
}

export class ArithmeticNode extends ExpressionNode {
  constructor(
    public left: ExpressionNode,
    public right: ExpressionNode,
    public operation: ArithmeticOperation
  ) {
    super('arithmetic');
  }
}

export class UnaryLogicalNode extends ExpressionNode {
  constructor(
    public left: ExpressionNode,
    public operation: UnaryLogicalOperation
  ) {
    super('unaryLogical');
  }
}

export class BinaryLogicalNode extends ExpressionNode {
  constructor(
    public left: ExpressionNode,
    public right: ExpressionNode,
    public operation: BinaryLogicalOperation
  ) {
    super('binaryLogical');
  }
}

export class ComparisonNode extends ExpressionNode {
  constructor(
    public left: ExpressionNode,
    public right: ExpressionNode,
    public operation: ComparisonOperation
  ) {
    super('comparison');
  }
}

export class FunctionCallNode extends ExpressionNode {
  constructor(public func: ExpressionNode, public args: ExpressionNode[]) {
    super('functionCall');
  }
}

export class DotAccessNode extends ExpressionNode {
  constructor(public left: ExpressionNode, public right: AtomNode) {
    super('dotAccess');
  }
}

export class ArrayAccessNode extends ExpressionNode {
  constructor(public array: ExpressionNode, public index: ExpressionNode) {
    super('arrayAccess');
  }
}

export class IfStatementNode extends Node {
  constructor(
    public condition: ExpressionNode,
    public statements: StatementNode[],
    public elseIfs: ElseIfStatementNode[] = [],
    public els?: ElseStatementNode
  ) {
    super('ifStatement');
  }
}

export class ElseIfStatementNode extends Node {
  constructor(
    public condition: ExpressionNode,
    public statements: StatementNode[]
  ) {
    super('elseIfStatement');
  }
}

export class ElseStatementNode extends Node {
  constructor(public statements: StatementNode[]) {
    super('elseStatement');
  }
}

export class WhileLoopNode extends Node {
  constructor(
    public condition: ExpressionNode,
    public statements: StatementNode[]
  ) {
    super('whileLoop');
  }
}

export class ForLoopNode extends Node {
  constructor(
    public controlVariable: AtomNode,
    public start: ExpressionNode,
    public stop: ExpressionNode,
    public step: ExpressionNode,
    public statements: StatementNode[]
  ) {
    super('forLoop');
  }
}

export class PrintNode extends Node {
  constructor(public args: ExpressionNode[]) {
    super('print');
  }
}

export class InputNode extends ExpressionNode {
  // TODO: Add prompt?
  constructor() {
    super('input');
  }
}

export class IntConversionNode extends ExpressionNode {
  constructor(public arg: ExpressionNode) {
    super('intConversion');
  }
}

export class AtomNode extends ExpressionNode {
  constructor(public atom: string, nodeType: string = 'atom') {
    super(nodeType);
  }
}

export class IntNode extends AtomNode {
  constructor(public value: number) {
    super(value.toString(), 'int');
  }
}

export class StringNode extends AtomNode {
  constructor(str: string) {
    super(str, 'string');
  }
}

export class BooleanNode extends AtomNode {
  constructor(public value: boolean) {
    super(value ? 'TRUE' : 'FALSE', 'boolean');
  }
}
