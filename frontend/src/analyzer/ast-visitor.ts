/**
 * AST Visitor - Traverses the Structured Text AST
 *
 * This module provides utilities to walk the AST and call visitor callbacks
 * for different types of nodes. It maintains context during traversal to help
 * with analysis (e.g., tracking scope, whether we're in a condition/loop, etc.).
 */

import type {
  ProgramNode,
  Statement,
  Expression,
  IfStatement,
  CaseStatement,
  ForStatement,
  WhileStatement,
  RepeatStatement,
  AssignmentStatement,
  FunctionCallStatement,
  VariableRef,
  MemberAccess,
  BinaryExpression,
  UnaryExpression,
  FunctionCall,
  ParenExpression,
} from "../parser/ast";

/**
 * Callback types for different visitor events
 */
export type VisitorCallback<T = any> = (
  node: T,
  context: VisitorContext,
) => void;

export interface VisitorContext {
  scope: "PROGRAM" | "IF" | "CASE" | "FOR" | "WHILE" | "REPEAT";
  inCondition: boolean;
  inLoop: boolean;
  path: string[]; // Path of scopes, e.g., ['PROGRAM', 'IF', 'WHILE']
  currentStatement?: Statement;
}

export interface VisitorOptions {
  onVariableRef?: VisitorCallback<VariableRef>;
  onAssignment?: VisitorCallback<AssignmentStatement>;
  onFunctionCall?: VisitorCallback<FunctionCall>;
  onBinaryOp?: VisitorCallback<BinaryExpression>;
  onStatement?: VisitorCallback<Statement>;
}

/**
 * Walk the AST and call visitor callbacks
 */
export function walkAST(program: ProgramNode, options: VisitorOptions): void {
  const context: VisitorContext = {
    scope: "PROGRAM",
    inCondition: false,
    inLoop: false,
    path: ["PROGRAM"],
  };

  // Visit program body statements
  visitStatements(program.body, context, options);

  // Restore context
  context.path.pop();
}

function visitStatements(
  statements: Statement[],
  context: VisitorContext,
  options: VisitorOptions,
): void {
  for (const stmt of statements) {
    const stmtContext = {
      ...context,
      currentStatement: stmt,
      path: [...context.path],
    };
    visitStatement(stmt, stmtContext, options);
  }
}

function visitStatement(
  stmt: Statement,
  context: VisitorContext,
  options: VisitorOptions,
): void {
  if (options.onStatement) {
    options.onStatement(stmt, context);
  }

  switch (stmt.type) {
    case "Assignment":
      if (options.onAssignment) {
        options.onAssignment(stmt as AssignmentStatement, context);
      }
      visitExpression((stmt as AssignmentStatement).value, context, options);
      break;

    case "IfStatement":
      visitIfStatement(stmt as IfStatement, context, options);
      break;

    case "CaseStatement":
      visitCaseStatement(stmt as CaseStatement, context, options);
      break;

    case "ForStatement":
      visitForStatement(stmt as ForStatement, context, options);
      break;

    case "WhileStatement":
      visitWhileStatement(stmt as WhileStatement, context, options);
      break;

    case "RepeatStatement":
      visitRepeatStatement(stmt as RepeatStatement, context, options);
      break;

    case "FunctionCallStatement":
      if (options.onFunctionCall) {
        options.onFunctionCall((stmt as FunctionCallStatement).call, context);
      }
      break;

    case "ReturnStatement":
    case "ExitStatement":
      // No expressions to visit
      break;
  }
}

function visitIfStatement(
  stmt: IfStatement,
  context: VisitorContext,
  options: VisitorOptions,
): void {
  const condContext = { ...context, inCondition: true };
  visitExpression(stmt.condition, condContext, options);

  context.path.push("IF");
  visitStatements(stmt.thenBranch, context, options);

  for (const elsif of stmt.elsifBranches) {
    visitExpression(elsif.condition, condContext, options);
    visitStatements(elsif.body, context, options);
  }

  if (stmt.elseBranch) {
    visitStatements(stmt.elseBranch, context, options);
  }

  context.path.pop();
}

function visitForStatement(
  stmt: ForStatement,
  context: VisitorContext,
  options: VisitorOptions,
): void {
  const loopContext = { ...context, inLoop: true };

  visitExpression(stmt.from, context, options);
  visitExpression(stmt.to, context, options);
  if (stmt.by) visitExpression(stmt.by, context, options);

  loopContext.path.push("FOR");
  visitStatements(stmt.body, loopContext, options);
  loopContext.path.pop();
}

function visitWhileStatement(
  stmt: WhileStatement,
  context: VisitorContext,
  options: VisitorOptions,
): void {
  const loopContext = { ...context, inLoop: true, inCondition: true };
  visitExpression(stmt.condition, loopContext, options);

  loopContext.path.push("WHILE");
  loopContext.inCondition = false;
  visitStatements(stmt.body, loopContext, options);
  loopContext.path.pop();
}

function visitRepeatStatement(
  stmt: RepeatStatement,
  context: VisitorContext,
  options: VisitorOptions,
): void {
  const loopContext = { ...context, inLoop: true };

  loopContext.path.push("REPEAT");
  visitStatements(stmt.body, loopContext, options);
  loopContext.inCondition = true;
  visitExpression(stmt.condition, loopContext, options);
  loopContext.path.pop();
}

function visitCaseStatement(
  stmt: CaseStatement,
  context: VisitorContext,
  options: VisitorOptions,
): void {
  const { ...condContext } = context;
  condContext.inCondition = true;
  visitExpression(stmt.selector, condContext, options);

  context.path.push("CASE");
  for (const caseBlock of stmt.cases) {
    for (const value of caseBlock.values) {
      visitExpression(value, condContext, options);
    }
    visitStatements(caseBlock.body, context, options);
  }

  if (stmt.elseCase) {
    visitStatements(stmt.elseCase, context, options);
  }
  context.path.pop();
}

function visitExpression(
  expr: Expression,
  context: VisitorContext,
  options: VisitorOptions,
): void {
  switch (expr.type) {
    case "VariableRef":
      if (options.onVariableRef) {
        options.onVariableRef(expr as VariableRef, context);
      }
      break;

    case "BinaryExpression": {
      const binExpr = expr as BinaryExpression;
      if (options.onBinaryOp) {
        options.onBinaryOp(binExpr, context);
      }
      visitExpression(binExpr.left, context, options);
      visitExpression(binExpr.right, context, options);
      break;
    }

    case "UnaryExpression":
      visitExpression((expr as UnaryExpression).operand, context, options);
      break;

    case "FunctionCall":
      visitFunctionCall(expr as FunctionCall, context, options);
      break;

    case "MemberAccess":
      visitExpression((expr as MemberAccess).object, context, options);
      break;

    case "ParenExpression":
      visitExpression((expr as ParenExpression).expression, context, options);
      break;

    case "Literal":
      // Nothing to visit
      break;
  }
}

function visitFunctionCall(
  call: FunctionCall,
  context: VisitorContext,
  options: VisitorOptions,
): void {
  if (options.onFunctionCall) {
    options.onFunctionCall(call, context);
  }
  for (const arg of call.arguments) {
    visitExpression(arg.value, context, options);
  }
}

/**
 * Find all variable references in an expression
 */
export function findVariableRefs(
  expr: Expression,
  context: VisitorContext,
): VariableRef[] {
  const refs: VariableRef[] = [];

  const visitor: VisitorOptions = {
    onVariableRef: (ref) => {
      refs.push(ref);
    },
  };

  visitExpression(
    expr,
    {
      scope: context.scope || "PROGRAM",
      inCondition: context.inCondition || false,
      inLoop: context.inLoop || false,
      path: context.path || ["PROGRAM"],
    },
    visitor,
  );

  return refs;
}

/**
 * Check if an expression contains a specific variable
 */
export function expressionContainsVariable(
  expr: Expression,
  variableName: string,
): boolean {
  return findVariableRefs(expr, {
    scope: "PROGRAM",
    inCondition: false,
    inLoop: false,
    path: [],
  }).some((ref) => ref.name === variableName);
}
