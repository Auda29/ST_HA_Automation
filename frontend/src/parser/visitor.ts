/**
 * CST to AST Visitor
 * Transforms Chevrotain's Concrete Syntax Tree to our custom AST
 */

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
} from "./ast";

const BaseVisitor = parserInstance.getBaseCstVisitorConstructor();

export class STVisitor extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  // Program
  program(ctx: any): ProgramNode {
    const pragmas: PragmaNode[] = ctx.pragma
      ? ctx.pragma.map((p: any) => this.visit(p))
      : [];
    const programName = ctx.programName[0].image;
    const variables: VariableDeclaration[] = ctx.variableBlock
      ? ctx.variableBlock.flatMap((vb: any) => this.visit(vb))
      : [];
    const body: Statement[] = ctx.statement
      ? ctx.statement.map((s: any) => this.visit(s))
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
  variableBlock(ctx: any): VariableDeclaration[] {
    let section: VarSection = "VAR";

    if (ctx.VarInput) section = "VAR_INPUT";
    else if (ctx.VarOutput) section = "VAR_OUTPUT";
    else if (ctx.VarInOut) section = "VAR_IN_OUT";
    else if (ctx.VarGlobal) section = "VAR_GLOBAL";

    return ctx.variableDeclaration
      ? ctx.variableDeclaration.map((vd: any) => {
          const decl = this.visit(vd) as VariableDeclaration;
          decl.section = section;
          return decl;
        })
      : [];
  }

  variableDeclaration(ctx: any): VariableDeclaration {
    const pragmas: PragmaNode[] = ctx.pragma
      ? ctx.pragma.map((p: any) => this.visit(p))
      : [];
    const name = ctx.varName[0].image;
    const dataType = ctx.typeSpec
      ? this.visit(ctx.typeSpec)
      : this.createDataType("UNKNOWN");
    const initialValue = ctx.expression
      ? this.visit(ctx.expression[0])
      : undefined;
    const binding = ctx.IoAddress
      ? this.parseIoAddress(ctx.IoAddress[0].image)
      : undefined;

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

  pragma(ctx: any): PragmaNode {
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

  typeSpec(ctx: any): DataType {
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
  statement(ctx: any): Statement {
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

  assignmentStatement(ctx: any): AssignmentStatement {
    const variable = this.visit(ctx.variableReference[0]);
    const target = variable.type === "VariableRef" ? variable.name : variable;

    return {
      type: "Assignment",
      target,
      value: this.visit(ctx.expression[0]),
      location: this.getLocation(ctx),
    };
  }

  ifStatement(ctx: any): IfStatement {
    const condition = this.visit(ctx.condition[0]);
    const thenBranch = ctx.thenStatements
      ? ctx.thenStatements.map((s: any) => this.visit(s))
      : [];

    const elsifBranches = ctx.elsifCondition
      ? ctx.elsifCondition.map((cond: any) => {
          // elsifStatements is an array of arrays (one array per ELSIF clause)
          // We need to figure out which statements belong to which ELSIF
          // For simplicity, collect all elsif statements
          const stmts = ctx.elsifStatements
            ? ctx.elsifStatements.map((s: any) => this.visit(s))
            : [];
          return {
            condition: this.visit(cond),
            body: stmts,
          };
        })
      : [];

    const elseBranch = ctx.elseStatements
      ? ctx.elseStatements.map((s: any) => this.visit(s))
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

  caseStatement(ctx: any): CaseStatement {
    const selector = this.visit(ctx.selector[0]);
    const cases = ctx.caseClause
      ? ctx.caseClause.map((c: any) => this.visit(c))
      : [];
    const elseCase = ctx.statement
      ? ctx.statement.map((s: any) => this.visit(s))
      : undefined;

    return {
      type: "CaseStatement",
      selector,
      cases,
      elseCase,
      location: this.getLocation(ctx),
    };
  }

  caseClause(ctx: any): { values: Expression[]; body: Statement[] } {
    const values = this.visit(ctx.caseLabelList[0]);
    const body = ctx.statement
      ? ctx.statement.map((s: any) => this.visit(s))
      : [];

    return { values, body };
  }

  caseLabelList(ctx: any): Expression[] {
    return ctx.caseLabel.map((cl: any) => this.visit(cl));
  }

  caseLabel(ctx: any): Expression {
    // Just return the expression (ranges are handled but simplified for now)
    return this.visit(ctx.expression[0]);
  }

  forStatement(ctx: any): ForStatement {
    return {
      type: "ForStatement",
      variable: ctx.controlVar[0].image,
      from: this.visit(ctx.start[0]),
      to: this.visit(ctx.end[0]),
      by: ctx.step ? this.visit(ctx.step[0]) : undefined,
      body: ctx.statement ? ctx.statement.map((s: any) => this.visit(s)) : [],
      location: this.getLocation(ctx),
    };
  }

  whileStatement(ctx: any): WhileStatement {
    return {
      type: "WhileStatement",
      condition: this.visit(ctx.expression[0]),
      body: ctx.statement ? ctx.statement.map((s: any) => this.visit(s)) : [],
      location: this.getLocation(ctx),
    };
  }

  repeatStatement(ctx: any): RepeatStatement {
    return {
      type: "RepeatStatement",
      condition: this.visit(ctx.expression[0]),
      body: ctx.statement ? ctx.statement.map((s: any) => this.visit(s)) : [],
      location: this.getLocation(ctx),
    };
  }

  returnStatement(ctx: any): ReturnStatement {
    return {
      type: "ReturnStatement",
      location: this.getLocation(ctx),
    };
  }

  exitStatement(ctx: any): ExitStatement {
    return {
      type: "ExitStatement",
      location: this.getLocation(ctx),
    };
  }

  functionCallStatement(ctx: any): FunctionCallStatement {
    return {
      type: "FunctionCallStatement",
      call: this.visit(ctx.functionCall[0]),
      location: this.getLocation(ctx),
    };
  }

  // Expressions
  expression(ctx: any): Expression {
    return this.visit(ctx.orExpression[0]);
  }

  orExpression(ctx: any): Expression {
    if (!ctx.Or || ctx.Or.length === 0) {
      return this.visit(ctx.lhs[0]);
    }

    let result: Expression = this.visit(ctx.lhs[0]);
    for (let i = 0; i < ctx.Or.length; i++) {
      result = {
        type: "BinaryExpression",
        operator: "OR",
        left: result,
        right: this.visit(ctx.rhs[i]),
        location: this.getLocation(ctx),
      };
    }
    return result;
  }

  andExpression(ctx: any): Expression {
    if (!ctx.And || ctx.And.length === 0) {
      return this.visit(ctx.lhs[0]);
    }

    let result: Expression = this.visit(ctx.lhs[0]);
    for (let i = 0; i < ctx.And.length; i++) {
      result = {
        type: "BinaryExpression",
        operator: "AND",
        left: result,
        right: this.visit(ctx.rhs[i]),
        location: this.getLocation(ctx),
      };
    }
    return result;
  }

  comparisonExpression(ctx: any): Expression {
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

  additiveExpression(ctx: any): Expression {
    let result: Expression = this.visit(ctx.lhs[0]);

    if (!ctx.Plus && !ctx.Minus) {
      return result;
    }

    const allOps = [...(ctx.Plus || []), ...(ctx.Minus || [])]
      .sort((a: any, b: any) => a.startOffset - b.startOffset)
      .map((op: any) => op.image);

    for (let i = 0; i < allOps.length; i++) {
      result = {
        type: "BinaryExpression",
        operator: allOps[i],
        left: result,
        right: this.visit(ctx.rhs[i]),
        location: this.getLocation(ctx),
      };
    }
    return result;
  }

  multiplicativeExpression(ctx: any): Expression {
    let result: Expression = this.visit(ctx.lhs[0]);

    if (!ctx.Star && !ctx.Slash && !ctx.Mod) {
      return result;
    }

    const allOps = [
      ...(ctx.Star || []),
      ...(ctx.Slash || []),
      ...(ctx.Mod || []),
    ]
      .sort((a: any, b: any) => a.startOffset - b.startOffset)
      .map((op: any) => op.image);

    for (let i = 0; i < allOps.length; i++) {
      result = {
        type: "BinaryExpression",
        operator: allOps[i],
        left: result,
        right: this.visit(ctx.rhs[i]),
        location: this.getLocation(ctx),
      };
    }
    return result;
  }

  unaryExpression(ctx: any): Expression {
    if (ctx.Not || ctx.Minus) {
      const operator = ctx.Not ? "NOT" : "-";
      return {
        type: "UnaryExpression",
        operator,
        operand: this.visit(ctx.unaryExpression[0]),
        location: this.getLocation(ctx),
      };
    }

    return this.visit(ctx.primaryExpression[0]);
  }

  primaryExpression(ctx: any): Expression {
    if (ctx.literal) return this.visit(ctx.literal[0]);
    if (ctx.identifierOrCall) return this.visit(ctx.identifierOrCall[0]);
    if (ctx.expression) return this.visit(ctx.expression[0]);
    throw new Error("Unknown primary expression");
  }

  identifierOrCall(ctx: any): Expression {
    const parts = ctx.Identifier.map((id: any) => id.image);
    const name = parts.join(".");

    // If there's a function call (LParen), treat as function call
    if (ctx.LParen) {
      const args = ctx.argumentList ? this.visit(ctx.argumentList[0]) : [];
      return {
        type: "FunctionCall",
        name: parts[0], // Only use first part for function name
        arguments: args.map((expr: Expression) => ({
          type: "FunctionArgument" as const,
          value: expr,
        })),
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

  literal(ctx: any): Literal {
    let value: any;
    let kind: "integer" | "real" | "string" | "boolean" | "time";
    let raw: string;

    if (ctx.True || ctx.False) {
      value = ctx.True ? true : false;
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
      value = null;
      kind = "integer";
      raw = "null";
    }

    return {
      type: "Literal",
      kind,
      value,
      raw,
      location: this.getLocation(ctx),
    };
  }

  variableReference(ctx: any): VariableRef {
    const parts = ctx.Identifier.map((id: any) => id.image);

    // For now, just return the first part as name
    // In the future, we could handle member access properly
    return {
      type: "VariableRef",
      name: parts.join("."),
      location: this.getLocation(ctx),
    };
  }

  functionCall(ctx: any): FunctionCall {
    const name = ctx.Identifier[0].image;
    const args = ctx.argumentList ? this.visit(ctx.argumentList[0]) : [];

    return {
      type: "FunctionCall",
      name,
      arguments: args.map((expr: Expression) => ({
        type: "FunctionArgument" as const,
        value: expr,
      })),
      location: this.getLocation(ctx),
    };
  }

  argumentList(ctx: any): Expression[] {
    return ctx.expression.map((e: any) => this.visit(e));
  }

  // Helper methods
  private createDataType(name: string): DataType {
    return {
      type: "DataType",
      name,
    };
  }

  private parseIoAddress(address: string): EntityBinding {
    // Parse %I0.0, %Q0.1, etc.
    const direction =
      address[1] === "I" ? "INPUT" : address[1] === "Q" ? "OUTPUT" : "MEMORY";
    const entityId = address.substring(1);

    return {
      type: "EntityBinding",
      direction,
      entityId,
    };
  }

  private getLocation(ctx: any): SourceLocation | undefined {
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

  private getAllTokens(ctx: any): any[] {
    const tokens: any[] = [];
    for (const key in ctx) {
      if (Array.isArray(ctx[key])) {
        for (const item of ctx[key]) {
          if (item && typeof item === "object" && "image" in item) {
            tokens.push(item);
          }
        }
      }
    }
    return tokens.sort((a, b) => a.startOffset - b.startOffset);
  }
}

// Export singleton instance
export const visitor = new STVisitor();
