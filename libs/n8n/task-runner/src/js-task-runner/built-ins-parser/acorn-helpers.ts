/**
 * Helper functions for working with acorn AST nodes.
 */
import type { Node, Identifier, Literal, MemberExpression, VariableDeclarator, AssignmentExpression } from 'acorn';

/**
 * Type guard for Identifier nodes.
 */
export function isIdentifier(node: Node | undefined | null): node is Identifier {
  return node?.type === 'Identifier';
}

/**
 * Type guard for Literal nodes.
 */
export function isLiteral(node: Node | undefined | null): node is Literal {
  return node?.type === 'Literal';
}

/**
 * Type guard for MemberExpression nodes.
 */
export function isMemberExpression(node: Node | undefined | null): node is MemberExpression {
  return node?.type === 'MemberExpression';
}

/**
 * Type guard for VariableDeclarator nodes.
 */
export function isVariableDeclarator(node: Node | undefined | null): node is VariableDeclarator {
  return node?.type === 'VariableDeclarator';
}

/**
 * Type guard for AssignmentExpression nodes.
 */
export function isAssignmentExpression(node: Node | undefined | null): node is AssignmentExpression {
  return node?.type === 'AssignmentExpression';
}
