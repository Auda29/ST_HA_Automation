/**
 * CST to AST Visitor
 * Transforms Chevrotain's Concrete Syntax Tree to our custom AST
 */

import { CstNode, IToken } from "chevrotain";
import { parserInstance } from "./parser";
import type {
  ProgramNode,
  VariableDeclaration,
  Statement,
  Expression,
  PragmaNode,
  IfStatement,
  CaseStatement,
  ForStatement,
  WhileStatement,
  RepeatStatement,
  AssignmentStatement,
  ReturnStatement,
  ExitStatement,
  FunctionCallStatement,
  Literal,
  VariableRef,
  FunctionCall,
  DataType,
  EntityBinding,
  VarSection,
  SourceLocation,
  FunctionArgument,
} from "./ast";

const BaseVisitor = parserInstance.getBaseCstVisitorConstructor();

// Define a type for the context to avoid 'any'
type CstContext = Record<string, CstNode[] | IToken[]>;

export class STVisitor extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  // Program
  program(ctx: {
    pragma?: CstNode[];
    programName: IToken[];
    variableBlock?: CstNode[];
    statement?: CstNode[];
  }): ProgramNode {
    const pragmas: PragmaNode[] = ctx.pragma
      ? ctx.pragma.map((p) => this.visit(p))
      : [];
    const programName = ctx.programName[0].image;
    const variables: VariableDeclaration[] = ctx.variableBlock
      ? ctx.variableBlock.flatMap((vb) => this.visit(vb))
      : [];
    const body: Statement[] = ctx.statement
      ? ctx.statement.map((s) => this.visit(s))
      : [];

    return {
      type: "Program",
      name: programName,
      pragmas,
      variables,
      body,
      location: this.getLocation(ctx),
    };
  }

  // Variable declarations
  variableBlock(ctx: {
    VarInput?: IToken[];
    VarOutput?: IToken[];
    VarInOut?: IToken[];
    VarGlobal?: IToken[];
    variableDeclaration?: CstNode[];
  }): VariableDeclaration[] {
    let section: VarSection = "VAR";

    if (ctx.VarInput) section = "VAR_INPUT";
    else if (ctx.VarOutput) section = "VAR_OUTPUT";
    else if (ctx.VarInOut) section = "VAR_IN_OUT";
    else if (ctx.VarGlobal) section = "VAR_GLOBAL";

    return ctx.variableDeclaration
      ? ctx.variableDeclaration.map((vd) => {
          const decl = this.visit(vd) as VariableDeclaration;
          decl.section = section;
          return decl;
        })
      : [];
  }

  variableDeclaration(ctx: {
    pragma?: CstNode[];
    varName: IToken[];
    typeSpec?: CstNode[];
    expression?: CstNode[];
    IoAddress?: IToken[];
  }): VariableDeclaration {
    const pragmas: PragmaNode[] = ctx.pragma
      ? ctx.pragma.map((p) => this.visit(p))
      : [];
    const name = ctx.varName[0].image;
    const dataType = ctx.typeSpec
      ? this.visit(ctx.typeSpec[0])
      : this.createDataType("UNKNOWN");
    const initialValue = ctx.expression
      ? this.visit(ctx.expression[0])
      : undefined;

    // Create binding if IO address is present
    let binding;
    if (ctx.IoAddress) {
      binding = this.parseIoAddress(ctx.IoAddress[0].image);

      // Extract entity ID from initialValue if it's a string literal
      if (
        initialValue &&
        initialValue.type === "Literal" &&
        initialValue.kind === "string"
      ) {
        binding.entityId = initialValue.value as string;
      }
    }

    return {
      type: "VariableDeclaration",
      name,
      dataType,
      section: "VAR", // Will be set by variableBlock
      pragmas,
      constant: false,
      initialValue,
      binding,
      location: this.getLocation(ctx),
    };
  }

  pragma(ctx: { Pragma: IToken[] }): PragmaNode {
    const text = ctx.Pragma[0].image;
    // Extract pragma content from {pragma_content}
    const content = text.slice(1, -1).trim();

    // Parse pragma as name: value or just name
    const colonIndex = content.indexOf(":");
    let name: string;
    let value: string | undefined;

    if (colonIndex > 0) {
      name = content.substring(0, colonIndex).trim();
      value = content.substring(colonIndex + 1).trim();
    } else {
      name = content;
    }

    return {
      type: "Pragma",
      name,
      value,
      location: this.getLocation(ctx),
    };
  }

  typeSpec(ctx: {
    TypeBool?: IToken[];
    TypeInt?: IToken[];
    TypeReal?: IToken[];
    TypeString?: IToken[];
    TypeTime?: IToken[];
    Identifier?: IToken[];
  }): DataType {
    let typeName: string;

    if (ctx.TypeBool) typeName = "BOOL";
    else if (ctx.TypeInt) typeName = ctx.TypeInt[0].image;
    else if (ctx.TypeReal) typeName = ctx.TypeReal[0].image;
    else if (ctx.TypeString) typeName = ctx.TypeString[0].image;
    else if (ctx.TypeTime) typeName = ctx.TypeTime[0].image;
    else if (ctx.Identifier) typeName = ctx.Identifier[0].image;
    else typeName = "UNKNOWN";

    return this.createDataType(typeName);
  }

  // Statements
  statement(ctx: {
    assignmentStatement?: CstNode[];
    ifStatement?: CstNode[];
    caseStatement?: CstNode[];
    forStatement?: CstNode[];
    whileStatement?: CstNode[];
    repeatStatement?: CstNode[];
    returnStatement?: CstNode[];
    exitStatement?: CstNode[];
    functionCallStatement?: CstNode[];
  }): Statement {
    if (ctx.assignmentStatement) return this.visit(ctx.assignmentStatement[0]);
    if (ctx.ifStatement) return this.visit(ctx.ifStatement[0]);
    if (ctx.caseStatement) return this.visit(ctx.caseStatement[0]);
    if (ctx.forStatement) return this.visit(ctx.forStatement[0]);
    if (ctx.whileStatement) return this.visit(ctx.whileStatement[0]);
    if (ctx.repeatStatement) return this.visit(ctx.repeatStatement[0]);
    if (ctx.returnStatement) return this.visit(ctx.returnStatement[0]);
    if (ctx.exitStatement) return this.visit(ctx.exitStatement[0]);
    if (ctx.functionCallStatement)
      return this.visit(ctx.functionCallStatement[0]);
    throw new Error("Unknown statement type");
  }

  assignmentStatement(ctx: {
    variableReference: CstNode[];
    expression: CstNode[];
  }): AssignmentStatement {
    const variable = this.visit(ctx.variableReference[0]) as VariableRef;
    return {
      type: "Assignment",
      target: variable.name,
      value: this.visit(ctx.expression[0]),
      location: this.getLocation(ctx),
    };
  }

  ifStatement(ctx: {
    condition: CstNode[];
    thenStatements?: CstNode[];
    elsifCondition?: CstNode[];
    elsifStatements?: CstNode[];
    elseStatements?: CstNode[];
  }): IfStatement {
    const condition = this.visit(ctx.condition[0]);
    const thenBranch = ctx.thenStatements
      ? ctx.thenStatements.map((s) => this.visit(s))
      : [];

    const elsifBranches = ctx.elsifCondition
      ? ctx.elsifCondition.map((cond, i) => {
          const stmts =
            ctx.elsifStatements && ctx.elsifStatements[i]
              ? this.visit(ctx.elsifStatements[i])
              : [];
          return {
            condition: this.visit(cond),
            body: Array.isArray(stmts) ? stmts : [stmts],
          };
        })
      : [];

    const elseBranch = ctx.elseStatements
      ? ctx.elseStatements.map((s) => this.visit(s))
      : undefined;

    return {
      type: "IfStatement",
      condition,
      thenBranch,
      elsifBranches,
      elseBranch,
      location: this.getLocation(ctx),
    };
  }

  caseStatement(ctx: {
    selector: CstNode[];
    caseClause?: CstNode[];
    statement?: CstNode[];
  }): CaseStatement {
    const selector = this.visit(ctx.selector[0]);
    const cases = ctx.caseClause
      ? ctx.caseClause.map((c) => this.visit(c))
      : [];
    const elseCase = ctx.statement
      ? ctx.statement.map((s) => this.visit(s))
      : undefined;

    return {
      type: "CaseStatement",
      selector,
      cases,
      elseCase,
      location: this.getLocation(ctx),
    };
  }

  caseClause(ctx: { caseLabelList: CstNode[]; statement?: CstNode[] }): {
    values: Expression[];
    body: Statement[];
  } {
    const values = this.visit(ctx.caseLabelList[0]);
    const body = ctx.statement ? ctx.statement.map((s) => this.visit(s)) : [];

    return { values, body };
  }

  caseLabelList(ctx: { caseLabel: CstNode[] }): Expression[] {
    return ctx.caseLabel.map((cl) => this.visit(cl));
  }

  caseLabel(ctx: { expression: CstNode[] }): Expression {
    return this.visit(ctx.expression[0]);
  }

  forStatement(ctx: {
    controlVar: IToken[];
    start: CstNode[];
    end: CstNode[];
    step?: CstNode[];
    statement?: CstNode[];
  }): ForStatement {
    return {
      type: "ForStatement",
      variable: ctx.controlVar[0].image,
      from: this.visit(ctx.start[0]),
      to: this.visit(ctx.end[0]),
      by: ctx.step ? this.visit(ctx.step[0]) : undefined,
      body: ctx.statement ? ctx.statement.map((s) => this.visit(s)) : [],
      location: this.getLocation(ctx),
    };
  }

  whileStatement(ctx: {
    expression: CstNode[];
    statement?: CstNode[];
  }): WhileStatement {
    return {
      type: "WhileStatement",
      condition: this.visit(ctx.expression[0]),
      body: ctx.statement ? ctx.statement.map((s) => this.visit(s)) : [],
      location: this.getLocation(ctx),
    };
  }

  repeatStatement(ctx: {
    expression: CstNode[];
    statement?: CstNode[];
  }): RepeatStatement {
    return {
      type: "RepeatStatement",
      condition: this.visit(ctx.expression[0]),
      body: ctx.statement ? ctx.statement.map((s) => this.visit(s)) : [],
      location: this.getLocation(ctx),
    };
  }

  returnStatement(ctx: CstContext): ReturnStatement {
    return {
      type: "ReturnStatement",
      location: this.getLocation(ctx),
    };
  }

  exitStatement(ctx: CstContext): ExitStatement {
    return {
      type: "ExitStatement",
      location: this.getLocation(ctx),
    };
  }

  functionCallStatement(ctx: {
    functionCall: CstNode[];
  }): FunctionCallStatement {
    return {
      type: "FunctionCallStatement",
      call: this.visit(ctx.functionCall[0]),
      location: this.getLocation(ctx),
    };
  }

  // Expressions
  expression(ctx: { orExpression: CstNode[] }): Expression {
    return this.visit(ctx.orExpression[0]);
  }

  orExpression(ctx: {
    lhs: CstNode[];
    Or?: IToken[];
    rhs?: CstNode[];
  }): Expression {
    if (!ctx.Or || ctx.Or.length === 0) {
      return this.visit(ctx.lhs[0]);
    }

    let result: Expression = this.visit(ctx.lhs[0]);
    for (let i = 0; i < ctx.Or.length; i++) {
      result = {
        type: "BinaryExpression",
        operator: "OR",
        left: result,
        right: this.visit(ctx.rhs![i]),
        location: this.getLocation(ctx),
      };
    }
    return result;
  }

  andExpression(ctx: {
    lhs: CstNode[];
    And?: IToken[];
    rhs?: CstNode[];
  }): Expression {
    if (!ctx.And || ctx.And.length === 0) {
      return this.visit(ctx.lhs[0]);
    }

    let result: Expression = this.visit(ctx.lhs[0]);
    for (let i = 0; i < ctx.And.length; i++) {
      result = {
        type: "BinaryExpression",
        operator: "AND",
        left: result,
        right: this.visit(ctx.rhs![i]),
        location: this.getLocation(ctx),
      };
    }
    return result;
  }

  comparisonExpression(ctx: {
    lhs: CstNode[];
    rhs?: CstNode[];
    Equal?: IToken[];
    NotEqual?: IToken[];
    Less?: IToken[];
    LessEqual?: IToken[];
    Greater?: IToken[];
    GreaterEqual?: IToken[];
  }): Expression {
    const lhs = this.visit(ctx.lhs[0]);

    if (!ctx.rhs || ctx.rhs.length === 0) {
      return lhs;
    }

    let operator = "=";
    if (ctx.Equal) operator = "=";
    else if (ctx.NotEqual) operator = "<>";
    else if (ctx.Less) operator = "<";
    else if (ctx.LessEqual) operator = "<=";
    else if (ctx.Greater) operator = ">";
    else if (ctx.GreaterEqual) operator = ">=";

    return {
      type: "BinaryExpression",
      operator,
      left: lhs,
      right: this.visit(ctx.rhs[0]),
      location: this.getLocation(ctx),
    };
  }

  additiveExpression(ctx: {
    lhs: CstNode[];
    rhs?: CstNode[];
    Plus?: IToken[];
    Minus?: IToken[];
  }): Expression {
    let result: Expression = this.visit(ctx.lhs[0]);

    if (!ctx.Plus && !ctx.Minus) {
      return result;
    }

    const allOps = [...(ctx.Plus || []), ...(ctx.Minus || [])]
      .sort((a, b) => a.startOffset - b.startOffset)
      .map((op) => op.image);

    for (let i = 0; i < allOps.length; i++) {
      result = {
        type: "BinaryExpression",
        operator: allOps[i],
        left: result,
        right: this.visit(ctx.rhs![i]),
        location: this.getLocation(ctx),
      };
    }
    return result;
  }

  multiplicativeExpression(ctx: {
    lhs: CstNode[];
    rhs?: CstNode[];
    Star?: IToken[];
    Slash?: IToken[];
    Mod?: IToken[];
  }): Expression {
    let result: Expression = this.visit(ctx.lhs[0]);

    if (!ctx.Star && !ctx.Slash && !ctx.Mod) {
      return result;
    }

    const allOps = [
      ...(ctx.Star || []),
      ...(ctx.Slash || []),
      ...(ctx.Mod || []),
    ]
      .sort((a, b) => a.startOffset - b.startOffset)
      .map((op) => op.image);

    for (let i = 0; i < allOps.length; i++) {
      result = {
        type: "BinaryExpression",
        operator: allOps[i],
        left: result,
        right: this.visit(ctx.rhs![i]),
        location: this.getLocation(ctx),
      };
    }
    return result;
  }

  unaryExpression(ctx: {
    Not?: IToken[];
    Minus?: IToken[];
    unaryExpression?: CstNode[];
    primaryExpression?: CstNode[];
  }): Expression {
    if (ctx.Not || ctx.Minus) {
      const operator = ctx.Not ? "NOT" : "-";
      return {
        type: "UnaryExpression",
        operator,
        operand: this.visit(ctx.unaryExpression![0]),
        location: this.getLocation(ctx),
      };
    }

    return this.visit(ctx.primaryExpression![0]);
  }

  primaryExpression(ctx: {
    literal?: CstNode[];
    identifierOrCall?: CstNode[];
    expression?: CstNode[];
  }): Expression {
    if (ctx.literal) return this.visit(ctx.literal[0]);
    if (ctx.identifierOrCall) return this.visit(ctx.identifierOrCall[0]);
    if (ctx.expression) return this.visit(ctx.expression[0]);
    throw new Error("Unknown primary expression");
  }

  identifierOrCall(ctx: {
    Identifier: IToken[];
    LParen?: IToken[];
    argumentList?: CstNode[];
  }): Expression {
    const parts = ctx.Identifier.map((id) => id.image);
    const name = parts.join(".");

    // If there's a function call (LParen), treat as function call
    if (ctx.LParen) {
      const args: FunctionArgument[] = ctx.argumentList
        ? this.visit(ctx.argumentList[0])
        : [];
      return {
        type: "FunctionCall",
        name: parts[0], // Only use first part for function name
        arguments: args,
        location: this.getLocation(ctx),
      };
    }

    // Otherwise, treat as variable reference
    return {
      type: "VariableRef",
      name,
      location: this.getLocation(ctx),
    };
  }

  literal(ctx: {
    True?: IToken[];
    False?: IToken[];
    IntegerLiteral?: IToken[];
    RealLiteral?: IToken[];
    StringLiteral?: IToken[];
    TimeLiteral?: IToken[];
  }): Literal {
    let value: string | number | boolean;
    let kind: "integer" | "real" | "string" | "boolean" | "time";
    let raw: string;

    if (ctx.True || ctx.False) {
      value = !!ctx.True;
      kind = "boolean";
      raw = ctx.True ? "TRUE" : "FALSE";
    } else if (ctx.IntegerLiteral) {
      raw = ctx.IntegerLiteral[0].image;
      value = parseInt(raw, 10);
      kind = "integer";
    } else if (ctx.RealLiteral) {
      raw = ctx.RealLiteral[0].image;
      value = parseFloat(raw);
      kind = "real";
    } else if (ctx.StringLiteral) {
      raw = ctx.StringLiteral[0].image;
      // Remove surrounding quotes and handle escaped quotes
      value = raw.slice(1, -1).replace(/''/g, "'");
      kind = "string";
    } else if (ctx.TimeLiteral) {
      raw = ctx.TimeLiteral[0].image;
      value = raw;
      kind = "time";
    } else {
      // Fallback for unexpected literals – treat as integer 0
      raw = "0";
      value = 0;
      kind = "integer";
    }

    return {
      type: "Literal",
      kind,
      value,
      raw,
      location: this.getLocation(ctx),
    };
  }

  variableReference(ctx: { Identifier: IToken[] }): VariableRef {
    const parts = ctx.Identifier.map((id) => id.image);

    // For now, just return the first part as name
    // In the future, we could handle member access properly
    return {
      type: "VariableRef",
      name: parts.join("."),
      location: this.getLocation(ctx),
    };
  }

  functionCall(ctx: {
    Identifier: IToken[];
    argumentList?: CstNode[];
  }): FunctionCall {
    const name = ctx.Identifier[0].image;
    const args: FunctionArgument[] = ctx.argumentList
      ? this.visit(ctx.argumentList[0])
      : [];

    return {
      type: "FunctionCall",
      name,
      arguments: args,
      location: this.getLocation(ctx),
    };
  }

  argumentList(ctx: { argument: CstNode[] }): FunctionArgument[] {
    return ctx.argument.map((a) => this.visit(a));
  }

  argument(ctx: {
    argName?: IToken[];
    argValue?: CstNode[];
    expression?: CstNode[];
  }): FunctionArgument {
    const name = ctx.argName ? ctx.argName[0].image : undefined;
    const valueExpr: Expression = ctx.argValue
      ? this.visit(ctx.argValue[0])
      : this.visit(ctx.expression![0]);

    return {
      type: "FunctionArgument",
      name,
      value: valueExpr,
      location: this.getLocation(ctx),
    };
  }

  // Helper methods
  private createDataType(name: string): DataType {
    return {
      type: "DataType",
      name,
    };
  }

  private parseIoAddress(address: string): EntityBinding {
    // Parse %I0.0, %Q0.1, %M*, etc.
    // Remove the % prefix to get the IO address
    const ioAddress = address.substring(1);
    const direction =
      address[1] === "I" ? "INPUT" : address[1] === "Q" ? "OUTPUT" : "MEMORY";

    return {
      type: "EntityBinding",
      direction,
      ioAddress,
      // entityId will be set from initialValue if present
    };
  }

  private getLocation(ctx: CstContext): SourceLocation | undefined {
    // Extract location from first and last tokens
    const tokens = this.getAllTokens(ctx);
    if (tokens.length === 0) return undefined;

    const first = tokens[0];
    const last = tokens[tokens.length - 1];

    return {
      startLine: first.startLine || 0,
      startColumn: first.startColumn || 0,
      endLine: last.endLine || last.startLine || 0,
      endColumn: last.endColumn || last.startColumn || 0,
    };
  }

  private getAllTokens(ctx: CstContext): IToken[] {
    const tokens: IToken[] = [];
    for (const key in ctx) {
      if (Array.isArray(ctx[key])) {
        for (const item of ctx[key]) {
          if (item && typeof item === "object" && "image" in item) {
            tokens.push(item as IToken);
          }
        }
      }
    }
    return tokens.sort((a, b) => a.startOffset - b.startOffset);
  }
}

// Export singleton instance
export const visitor = new STVisitor();
