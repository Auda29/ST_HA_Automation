/**
 * AST Node Types for Structured Text
 */

// ============================================================================
// Base Types
// ============================================================================

export interface SourceLocation {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface ASTNode {
  type: string;
  location?: SourceLocation;
}

// ============================================================================
// Program Structure
// ============================================================================

export interface ProgramNode extends ASTNode {
  type: 'Program';
  name: string;
  pragmas: PragmaNode[];
  variables: VariableDeclaration[];
  body: Statement[];
}

export interface PragmaNode extends ASTNode {
  type: 'Pragma';
  name: string;
  value?: string;
}

// ============================================================================
// Variables
// ============================================================================

export type VarSection = 'VAR' | 'VAR_INPUT' | 'VAR_OUTPUT' | 'VAR_IN_OUT' | 'VAR_GLOBAL';

export interface VariableDeclaration extends ASTNode {
  type: 'VariableDeclaration';
  name: string;
  dataType: DataType;
  initialValue?: Expression;
  binding?: EntityBinding;
  section: VarSection;
  pragmas: PragmaNode[];
  constant: boolean;
}

export interface DataType extends ASTNode {
  type: 'DataType';
  name: string;  // BOOL, INT, REAL, STRING, TIME, or custom FB name
  isArray?: boolean;
  arrayBounds?: { lower: number; upper: number };
}

export interface EntityBinding extends ASTNode {
  type: 'EntityBinding';
  direction: 'INPUT' | 'OUTPUT' | 'MEMORY';  // %I, %Q, %M
  ioAddress: string;  // The IO address from AT clause (e.g., "I0.0" from %I0.0)
  entityId?: string;  // The actual HA entity ID from initializer (e.g., 'binary_sensor.motion')
}

// ============================================================================
// Statements
// ============================================================================

export type Statement =
  | AssignmentStatement
  | IfStatement
  | CaseStatement
  | ForStatement
  | WhileStatement
  | RepeatStatement
  | FunctionCallStatement
  | ReturnStatement
  | ExitStatement;

export interface AssignmentStatement extends ASTNode {
  type: 'Assignment';
  target: string | MemberAccess;
  value: Expression;
}

export interface IfStatement extends ASTNode {
  type: 'IfStatement';
  condition: Expression;
  thenBranch: Statement[];
  elsifBranches: { condition: Expression; body: Statement[] }[];
  elseBranch?: Statement[];
}

export interface CaseStatement extends ASTNode {
  type: 'CaseStatement';
  selector: Expression;
  cases: { values: Expression[]; body: Statement[] }[];
  elseCase?: Statement[];
}

export interface ForStatement extends ASTNode {
  type: 'ForStatement';
  variable: string;
  from: Expression;
  to: Expression;
  by?: Expression;
  body: Statement[];
}

export interface WhileStatement extends ASTNode {
  type: 'WhileStatement';
  condition: Expression;
  body: Statement[];
}

export interface RepeatStatement extends ASTNode {
  type: 'RepeatStatement';
  condition: Expression;
  body: Statement[];
}

export interface FunctionCallStatement extends ASTNode {
  type: 'FunctionCallStatement';
  call: FunctionCall;
}

export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  value?: Expression;
}

export interface ExitStatement extends ASTNode {
  type: 'ExitStatement';
}

// ============================================================================
// Expressions
// ============================================================================

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | Literal
  | VariableRef
  | MemberAccess
  | FunctionCall
  | ParenExpression;

export interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends ASTNode {
  type: 'UnaryExpression';
  operator: string;  // NOT, -
  operand: Expression;
}

export interface Literal extends ASTNode {
  type: 'Literal';
  kind: 'integer' | 'real' | 'string' | 'boolean' | 'time';
  value: number | string | boolean;
  raw: string;
}

export interface VariableRef extends ASTNode {
  type: 'VariableRef';
  name: string;
}

export interface MemberAccess extends ASTNode {
  type: 'MemberAccess';
  object: Expression;
  member: string;
}

export interface FunctionCall extends ASTNode {
  type: 'FunctionCall';
  name: string;
  arguments: FunctionArgument[];
}

export interface FunctionArgument extends ASTNode {
  type: 'FunctionArgument';
  name?: string;  // For named args: input := value
  value: Expression;
}

export interface ParenExpression extends ASTNode {
  type: 'ParenExpression';
  expression: Expression;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface ParseResult {
  ast: ProgramNode | null;
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  location?: SourceLocation;
}
