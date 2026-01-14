/**
 * Known Error Patterns for Translation
 */

import type { ErrorPattern } from './error-types';

// ============================================================================
// Jinja/Template Errors
// ============================================================================

export const TEMPLATE_ERRORS: ErrorPattern[] = [
  {
    pattern: /UndefinedError: '(\w+)' is undefined/,
    translation: "Variable '$1' ist nicht definiert oder Entity nicht gefunden",
    category: 'template',
    suggestions: [
      "Prüfen Sie, ob die Variable deklariert ist",
      "Prüfen Sie, ob die Entity-ID korrekt ist",
      "Stellen Sie sicher, dass die Entity in Home Assistant existiert",
    ],
  },
  {
    pattern: /could not convert string to float: '([^']+)'/,
    translation: "Wert '$1' kann nicht in eine Zahl konvertiert werden",
    category: 'type',
    suggestions: [
      "Der Sensor liefert möglicherweise 'unavailable' oder 'unknown'",
      "Verwenden Sie einen Default-Wert: | float(default=0)",
    ],
  },
  {
    pattern: /TemplateSyntaxError: (.+)/,
    translation: "Template-Syntaxfehler: $1",
    category: 'syntax',
    suggestions: [
      "Prüfen Sie die Jinja2-Syntax",
      "Achten Sie auf korrekte Klammerung",
    ],
  },
  {
    pattern: /TypeError: unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/,
    translation: "Typfehler: Operation '$1' nicht möglich zwischen '$2' und '$3'",
    category: 'type',
    suggestions: [
      "Stellen Sie sicher, dass beide Operanden den korrekten Typ haben",
      "Verwenden Sie Typkonvertierungen wie | int oder | float",
    ],
  },
  {
    pattern: /ZeroDivisionError/,
    translation: "Division durch Null",
    category: 'runtime',
    suggestions: [
      "Prüfen Sie den Divisor vor der Division",
      "Verwenden Sie eine Bedingung: {% if divisor != 0 %}",
    ],
  },
];

// ============================================================================
// Entity Errors
// ============================================================================

export const ENTITY_ERRORS: ErrorPattern[] = [
  {
    pattern: /Entity not found: (.+)/,
    translation: "Entity '$1' wurde nicht gefunden",
    category: 'entity',
    suggestions: [
      "Prüfen Sie, ob die Entity-ID korrekt geschrieben ist",
      "Stellen Sie sicher, dass die Entity in Home Assistant existiert",
      "Die Entity könnte durch eine Integration deaktiviert sein",
    ],
  },
  {
    pattern: /Unable to find service (.+)/,
    translation: "Service '$1' wurde nicht gefunden",
    category: 'service',
    suggestions: [
      "Prüfen Sie, ob die Integration geladen ist",
      "Der Service-Name könnte falsch sein",
    ],
  },
  {
    pattern: /Invalid entity ID: (.+)/,
    translation: "Ungültige Entity-ID: '$1'",
    category: 'entity',
    suggestions: [
      "Entity-IDs müssen das Format 'domain.name' haben",
      "Nur Kleinbuchstaben, Zahlen und Unterstriche erlaubt",
    ],
  },
  {
    pattern: /state of (.+) is unavailable/i,
    translation: "Entity '$1' ist nicht verfügbar (unavailable)",
    category: 'entity',
    suggestions: [
      "Die Entity ist möglicherweise offline",
      "Prüfen Sie die Verbindung zum Gerät",
      "Verwenden Sie Fallback-Werte für unavailable States",
    ],
  },
];

// ============================================================================
// Automation/Script Errors
// ============================================================================

export const AUTOMATION_ERRORS: ErrorPattern[] = [
  {
    pattern: /Error while executing automation (.+)/,
    translation: "Fehler bei Ausführung der Automation '$1'",
    category: 'runtime',
  },
  {
    pattern: /Timeout while executing script/,
    translation: "Timeout bei Script-Ausführung (möglicherweise Endlosschleife)",
    category: 'runtime',
    suggestions: [
      "Prüfen Sie WHILE/REPEAT Schleifen auf Exit-Bedingungen",
      "Der Safety Counter (max 1000 Iterationen) wurde möglicherweise erreicht",
    ],
  },
  {
    pattern: /Error rendering (.+) template/,
    translation: "Fehler beim Rendern des '$1' Templates",
    category: 'template',
  },
  {
    pattern: /Condition (.+) error/,
    translation: "Fehler in Bedingung '$1'",
    category: 'template',
  },
];

// ============================================================================
// Timer Errors
// ============================================================================

export const TIMER_ERRORS: ErrorPattern[] = [
  {
    pattern: /Timer (.+) not found/,
    translation: "Timer '$1' wurde nicht gefunden",
    category: 'entity',
    suggestions: [
      "Der Timer-Helper muss zuerst erstellt werden",
      "Führen Sie einen erneuten Deploy aus",
    ],
  },
  {
    pattern: /Timer (.+) is already running/,
    translation: "Timer '$1' läuft bereits",
    category: 'runtime',
  },
];

// ============================================================================
// All Patterns Combined
// ============================================================================

export const ALL_ERROR_PATTERNS: ErrorPattern[] = [
  ...TEMPLATE_ERRORS,
  ...ENTITY_ERRORS,
  ...AUTOMATION_ERRORS,
  ...TIMER_ERRORS,
];

// ============================================================================
// Pattern Matcher Helper
// ============================================================================

export function findMatchingPattern(message: string): {
  pattern: ErrorPattern;
  matches: RegExpMatchArray;
} | null {
  for (const pattern of ALL_ERROR_PATTERNS) {
    const matches = message.match(pattern.pattern);
    if (matches) {
      return { pattern, matches };
    }
  }
  return null;
}

export function translateMessage(message: string): string {
  const result = findMatchingPattern(message);
  if (!result) {
    return message; // Return original if no pattern matches
  }

  const { pattern, matches } = result;
  let translation = pattern.translation;

  // Replace $1, $2, etc. with captured groups
  for (let i = 1; i < matches.length; i++) {
    translation = translation.replace(`$${i}`, matches[i] || '');
  }

  return translation;
}
