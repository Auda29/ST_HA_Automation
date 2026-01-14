import { CstParser } from "chevrotain";
import {
  allTokens,
  // Keywords
  Program,
  EndProgram,
  Var,
  EndVar,
  VarInput,
  VarOutput,
  VarInOut,
  VarGlobal,
  If,
  Then,
  Elsif,
  Else,
  EndIf,
  Case,
  Of,
  EndCase,
  For,
  To,
  By,
  Do,
  EndFor,
  While,
  EndWhile,
  Repeat,
  Until,
  EndRepeat,
  Return,
  Exit,
  At,
  // Types
  TypeBool,
  TypeInt,
  TypeReal,
  TypeString,
  TypeTime,
  // Logical operators
  Or,
  And,
  Not,
  Mod,
  // Literals
  True,
  False,
  IntegerLiteral,
  RealLiteral,
  StringLiteral,
  TimeLiteral,
  // Operators
  Assign,
  Equal,
  NotEqual,
  Less,
  LessEqual,
  Greater,
  GreaterEqual,
  Plus,
  Minus,
  Star,
  Slash,
  // Identifiers and I/O
  Identifier,
  IoAddress,
  Pragma,
  // Punctuation
  LParen,
  RParen,
  Comma,
  Semicolon,
  Colon,
  Dot,
  Range,
} from "./tokens";

export class STParser extends CstParser {
  constructor() {
    super(allTokens, {
      recoveryEnabled: true,
      nodeLocationTracking: "full",
    });
    this.performSelfAnalysis();
  }

  // Program structure
  public program = this.RULE("program", () => {
    this.MANY(() => this.SUBRULE(this.pragma));
    this.CONSUME(Program);
    this.CONSUME(Identifier, { LABEL: "programName" });
    this.MANY1(() => this.SUBRULE(this.variableBlock));
    this.MANY2(() => this.SUBRULE(this.statement));
    this.CONSUME(EndProgram);
  });

  // Variable declarations
  private variableBlock = this.RULE("variableBlock", () => {
    this.OR([
      { ALT: () => this.CONSUME(Var) },
      { ALT: () => this.CONSUME(VarInput) },
      { ALT: () => this.CONSUME(VarOutput) },
      { ALT: () => this.CONSUME(VarInOut) },
      { ALT: () => this.CONSUME(VarGlobal) },
    ]);
    this.MANY(() => this.SUBRULE(this.variableDeclaration));
    this.CONSUME(EndVar);
  });

  private variableDeclaration = this.RULE("variableDeclaration", () => {
    this.MANY(() => this.SUBRULE(this.pragma));
    this.CONSUME(Identifier, { LABEL: "varName" });

    // Support both: "name AT %addr : type" and "name : type AT %addr"
    this.OPTION(() => {
      this.CONSUME(At);
      this.CONSUME(IoAddress);
    });

    this.OPTION1(() => {
      this.CONSUME(Colon);
      this.SUBRULE(this.typeSpec);
    });

    this.OPTION2(() => {
      this.CONSUME(Assign);
      this.SUBRULE(this.expression);
    });

    this.OPTION3(() => {
      this.CONSUME1(At);
      this.CONSUME1(IoAddress);
    });

    this.CONSUME(Semicolon);
  });

  private pragma = this.RULE("pragma", () => {
    this.CONSUME(Pragma);
  });

  private typeSpec = this.RULE("typeSpec", () => {
    this.OR([
      { ALT: () => this.CONSUME(TypeBool) },
      { ALT: () => this.CONSUME(TypeInt) },
      { ALT: () => this.CONSUME(TypeReal) },
      { ALT: () => this.CONSUME(TypeString) },
      { ALT: () => this.CONSUME(TypeTime) },
      { ALT: () => this.CONSUME(Identifier) }, // Custom type
    ]);
  });

  // Statements
  private statement = this.RULE("statement", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.assignmentStatement) },
      { ALT: () => this.SUBRULE(this.ifStatement) },
      { ALT: () => this.SUBRULE(this.caseStatement) },
      { ALT: () => this.SUBRULE(this.forStatement) },
      { ALT: () => this.SUBRULE(this.whileStatement) },
      { ALT: () => this.SUBRULE(this.repeatStatement) },
      { ALT: () => this.SUBRULE(this.returnStatement) },
      { ALT: () => this.SUBRULE(this.exitStatement) },
      { ALT: () => this.SUBRULE(this.functionCallStatement) },
    ]);
  });

  private assignmentStatement = this.RULE("assignmentStatement", () => {
    this.SUBRULE(this.variableReference);
    this.CONSUME(Assign);
    this.SUBRULE(this.expression);
    this.CONSUME(Semicolon);
  });

  private ifStatement = this.RULE("ifStatement", () => {
    this.CONSUME(If);
    this.SUBRULE(this.expression, { LABEL: "condition" });
    this.CONSUME(Then);
    this.MANY(() => this.SUBRULE(this.statement, { LABEL: "thenStatements" }));
    this.MANY1(() => {
      this.CONSUME(Elsif);
      this.SUBRULE1(this.expression, { LABEL: "elsifCondition" });
      this.CONSUME1(Then);
      this.MANY2(() =>
        this.SUBRULE1(this.statement, { LABEL: "elsifStatements" }),
      );
    });
    this.OPTION(() => {
      this.CONSUME(Else);
      this.MANY3(() =>
        this.SUBRULE2(this.statement, { LABEL: "elseStatements" }),
      );
    });
    this.CONSUME(EndIf);
  });

  private caseStatement = this.RULE("caseStatement", () => {
    this.CONSUME(Case);
    this.SUBRULE(this.expression, { LABEL: "selector" });
    this.CONSUME(Of);
    this.MANY(() => this.SUBRULE(this.caseClause));
    this.OPTION(() => {
      this.CONSUME(Else);
      this.MANY1(() => this.SUBRULE(this.statement));
    });
    this.CONSUME(EndCase);
  });

  private caseClause = this.RULE("caseClause", () => {
    this.SUBRULE(this.caseLabelList);
    this.CONSUME(Colon);
    this.MANY(() => this.SUBRULE(this.statement));
  });

  private caseLabelList = this.RULE("caseLabelList", () => {
    this.SUBRULE(this.caseLabel);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE1(this.caseLabel);
    });
  });

  private caseLabel = this.RULE("caseLabel", () => {
    this.SUBRULE(this.expression);
    this.OPTION(() => {
      this.CONSUME(Range);
      this.SUBRULE1(this.expression);
    });
  });

  private forStatement = this.RULE("forStatement", () => {
    this.CONSUME(For);
    this.CONSUME(Identifier, { LABEL: "controlVar" });
    this.CONSUME(Assign);
    this.SUBRULE(this.expression, { LABEL: "start" });
    this.CONSUME(To);
    this.SUBRULE1(this.expression, { LABEL: "end" });
    this.OPTION(() => {
      this.CONSUME(By);
      this.SUBRULE2(this.expression, { LABEL: "step" });
    });
    this.CONSUME(Do);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(EndFor);
  });

  private whileStatement = this.RULE("whileStatement", () => {
    this.CONSUME(While);
    this.SUBRULE(this.expression);
    this.CONSUME(Do);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(EndWhile);
  });

  private repeatStatement = this.RULE("repeatStatement", () => {
    this.CONSUME(Repeat);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(Until);
    this.SUBRULE(this.expression);
    this.CONSUME(EndRepeat);
  });

  private returnStatement = this.RULE("returnStatement", () => {
    this.CONSUME(Return);
    this.CONSUME(Semicolon);
  });

  private exitStatement = this.RULE("exitStatement", () => {
    this.CONSUME(Exit);
    this.CONSUME(Semicolon);
  });

  private functionCallStatement = this.RULE("functionCallStatement", () => {
    this.SUBRULE(this.functionCall);
    this.CONSUME(Semicolon);
  });

  // Expressions with operator precedence
  private expression = this.RULE("expression", () => {
    this.SUBRULE(this.orExpression);
  });

  private orExpression = this.RULE("orExpression", () => {
    this.SUBRULE(this.andExpression, { LABEL: "lhs" });
    this.MANY(() => {
      this.CONSUME(Or);
      this.SUBRULE1(this.andExpression, { LABEL: "rhs" });
    });
  });

  private andExpression = this.RULE("andExpression", () => {
    this.SUBRULE(this.comparisonExpression, { LABEL: "lhs" });
    this.MANY(() => {
      this.CONSUME(And);
      this.SUBRULE1(this.comparisonExpression, { LABEL: "rhs" });
    });
  });

  private comparisonExpression = this.RULE("comparisonExpression", () => {
    this.SUBRULE(this.additiveExpression, { LABEL: "lhs" });
    this.OPTION(() => {
      this.OR([
        { ALT: () => this.CONSUME(Equal) },
        { ALT: () => this.CONSUME(NotEqual) },
        { ALT: () => this.CONSUME(Less) },
        { ALT: () => this.CONSUME(LessEqual) },
        { ALT: () => this.CONSUME(Greater) },
        { ALT: () => this.CONSUME(GreaterEqual) },
      ]);
      this.SUBRULE1(this.additiveExpression, { LABEL: "rhs" });
    });
  });

  private additiveExpression = this.RULE("additiveExpression", () => {
    this.SUBRULE(this.multiplicativeExpression, { LABEL: "lhs" });
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Plus) },
        { ALT: () => this.CONSUME(Minus) },
      ]);
      this.SUBRULE1(this.multiplicativeExpression, { LABEL: "rhs" });
    });
  });

  private multiplicativeExpression = this.RULE(
    "multiplicativeExpression",
    () => {
      this.SUBRULE(this.unaryExpression, { LABEL: "lhs" });
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Star) },
          { ALT: () => this.CONSUME(Slash) },
          { ALT: () => this.CONSUME(Mod) },
        ]);
        this.SUBRULE1(this.unaryExpression, { LABEL: "rhs" });
      });
    },
  );

  private unaryExpression = this.RULE("unaryExpression", () => {
    this.OR([
      {
        ALT: () => {
          this.OR1([
            { ALT: () => this.CONSUME(Not) },
            { ALT: () => this.CONSUME(Minus) },
          ]);
          this.SUBRULE(this.unaryExpression);
        },
      },
      { ALT: () => this.SUBRULE(this.primaryExpression) },
    ]);
  });

  private primaryExpression = this.RULE("primaryExpression", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.literal) },
      { ALT: () => this.SUBRULE(this.identifierOrCall) },
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.SUBRULE(this.expression);
          this.CONSUME(RParen);
        },
      },
    ]);
  });

  private identifierOrCall = this.RULE("identifierOrCall", () => {
    this.CONSUME(Identifier);
    this.MANY(() => {
      this.CONSUME(Dot);
      this.CONSUME1(Identifier);
    });
    this.OPTION(() => {
      this.CONSUME(LParen);
      this.OPTION1(() => {
        this.SUBRULE(this.argumentList);
      });
      this.CONSUME(RParen);
    });
  });

  private literal = this.RULE("literal", () => {
    this.OR([
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
      { ALT: () => this.CONSUME(IntegerLiteral) },
      { ALT: () => this.CONSUME(RealLiteral) },
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(TimeLiteral) },
    ]);
  });

  private variableReference = this.RULE("variableReference", () => {
    this.CONSUME(Identifier);
    this.MANY(() => {
      this.CONSUME(Dot);
      this.CONSUME1(Identifier);
    });
  });

  private functionCall = this.RULE("functionCall", () => {
    this.CONSUME(Identifier);
    this.CONSUME(LParen);
    this.OPTION(() => {
      this.SUBRULE(this.argumentList);
    });
    this.CONSUME(RParen);
  });

  private argumentList = this.RULE("argumentList", () => {
    this.SUBRULE(this.expression);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE1(this.expression);
    });
  });
}

// Export singleton instance
export const parserInstance = new STParser();
