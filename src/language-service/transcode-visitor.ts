import { ParseTree } from 'antlr4ts/tree';
import {
  ArithmeticOperation,
  AtomNode,
  BinaryLogicalOperation,
  ComparisonOperation,
  Node,
  UnaryLogicalOperation,
} from './ast';

/**
 * The superclass for all classes that visit an ANTLR tree.
 */
export abstract class TranscodeVisitor {
  visit(tree: ParseTree): Node {
    try {
      const node: Node = tree.accept(this as any);

      if (!node) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(':O');
      }

      return node;
    } catch (e) {
      if (e.message !== ':O') {
        console.error(e);
      }

      if (tree.childCount > 0) {
        return this.visit(tree.getChild(0));
      }

      return undefined;
    }
  }

  visitChildren(ctx: ParseTree): Node {
    throw new Error(':O');
  }

  visitTerminal(ctx: ParseTree): Node {
    return this.visitAtom(ctx);
  }

  visitErrorNode(ctx: ParseTree): Node {
    throw new Error(':O');
  }

  visitAtom(ctx: ParseTree) {
    return new AtomNode(ctx.text);
  }

  visitArithmeticOperation(operation: ParseTree): ArithmeticOperation {
    switch (operation.text) {
      case '+':
        return ArithmeticOperation.ADDITION;
      case '-':
        return ArithmeticOperation.SUBTRACTION;
      case '*':
        return ArithmeticOperation.MULTIPLICATION;
      case '/':
        return ArithmeticOperation.DIVISION;
      case '%':
        return ArithmeticOperation.MODULUS;
    }
  }

  abstract visitUnaryLogicalOperation(
    operation: ParseTree
  ): UnaryLogicalOperation;

  abstract visitBinaryLogicalOperation(
    operation: ParseTree
  ): BinaryLogicalOperation;

  visitComparisonOperation(operation: ParseTree): ComparisonOperation {
    switch (operation.text) {
      case '==':
        return ComparisonOperation.EQUALS;
      case '!=':
        return ComparisonOperation.NOT_EQUALS;
      case '>':
        return ComparisonOperation.GREATER_THAN;
      case '<':
        return ComparisonOperation.LESS_THAN;
      case '>=':
        return ComparisonOperation.GREATER_THAN_EQUAL_TO;
      case '<=':
        return ComparisonOperation.LESS_THAN_EQUAL_TO;
    }
  }
}
