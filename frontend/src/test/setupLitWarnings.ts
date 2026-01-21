// Global test setup for Lit warnings in Vitest.
// In dev builds, Lit emits "migration" warnings such as
// class-field shadowing, which surface as rejected promises
// and fail tests. For our test environment we disable those
// migration warnings so that they don't interfere with specs.

import { ReactiveElement } from "@lit/reactive-element";

// Disable the dev-mode warning for class-field shadowing. The codebase
// intentionally uses Lit reactive properties with class fields and the
// warning surfaces as rejected promises in tests, which breaks CI.
ReactiveElement.disableWarning?.("class-field-shadowing" as any);

