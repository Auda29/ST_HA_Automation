import { describe, it, expect } from "vitest";
import type { TranspilerContext } from "../types";
import type { TimerInstance, TimerInputs } from "../timer-types";
import { TimerTranspiler, TimerOutputResolver } from "../timer-transpiler";

const createContext = (): TranspilerContext => ({
  programName: "Test",
  projectName: "home",
  variables: new Map(),
  entityBindings: new Map(),
  currentPath: [],
  loopDepth: 0,
  safetyCounters: 0,
});

describe("TimerTranspiler", () => {
  describe("TON Timer", () => {
    it("generates correct entities for TON", () => {
      const transpiler = new TimerTranspiler(createContext());

      const instance: TimerInstance = {
        name: "delayTimer",
        type: "TON",
        programName: "Kitchen",
        projectName: "home",
      };

      const inputs: TimerInputs = {
        IN: "states('binary_sensor.motion') == 'on'",
        PT: "5",
      };

      const result = transpiler.transpileTimer(instance, inputs);

      expect(result.entities.timerId).toBe("timer.st_home_kitchen_delaytimer");
      expect(result.entities.outputHelperId).toBe(
        "input_boolean.st_home_kitchen_delaytimer_q",
      );
    });

    it("generates helper configs", () => {
      const transpiler = new TimerTranspiler(createContext());

      const instance: TimerInstance = {
        name: "timer1",
        type: "TON",
        programName: "Test",
        projectName: "default",
      };

      const result = transpiler.transpileTimer(instance, {
        IN: "true",
        PT: "10",
      });

      expect(result.helpers).toHaveLength(2);
      expect(result.helpers.find((h) => h.type === "timer")).toBeDefined();
      expect(
        result.helpers.find((h) => h.type === "input_boolean"),
      ).toBeDefined();
    });

    it("generates finished automation", () => {
      const transpiler = new TimerTranspiler(createContext());

      const instance: TimerInstance = {
        name: "timer1",
        type: "TON",
        programName: "Test",
        projectName: "default",
      };

      const result = transpiler.transpileTimer(instance, {
        IN: "sensor_value",
        PT: "5",
      });

      expect(result.finishedAutomation.trigger[0]).toMatchObject({
        platform: "event",
        event_type: "timer.finished",
      });
    });

    it("generates output mappings", () => {
      const transpiler = new TimerTranspiler(createContext());

      const instance: TimerInstance = {
        name: "timer1",
        type: "TON",
        programName: "Test",
        projectName: "default",
      };

      const result = transpiler.transpileTimer(instance, {
        IN: "true",
        PT: "5",
      });

      expect(result.outputMappings.Q).toContain("input_boolean");
      expect(result.outputMappings.Q).toContain("== 'on'");
    });
  });

  describe("TOF Timer", () => {
    it("generates correct logic for TOF", () => {
      const transpiler = new TimerTranspiler(createContext());

      const instance: TimerInstance = {
        name: "offDelay",
        type: "TOF",
        programName: "Light",
        projectName: "home",
      };

      const result = transpiler.transpileTimer(instance, {
        IN: "motion",
        PT: "30",
      });

      const choose = result.mainActions[0] as any;
      expect(choose.choose[0].sequence).toContainEqual(
        expect.objectContaining({ service: "input_boolean.turn_on" }),
      );
    });
  });

  describe("TP Timer", () => {
    it("generates pulse logic for TP", () => {
      const transpiler = new TimerTranspiler(createContext());

      const instance: TimerInstance = {
        name: "pulse",
        type: "TP",
        programName: "Alarm",
        projectName: "home",
      };

      const result = transpiler.transpileTimer(instance, {
        IN: "trigger",
        PT: "1",
      });

      // TP needs additional helper for trigger tracking
      expect(result.helpers.length).toBeGreaterThan(2);
    });
  });
});

describe("TimerOutputResolver", () => {
  it("resolves Q output", () => {
    const resolver = new TimerOutputResolver();

    resolver.registerTimer("timer1", {
      Q: "(states('input_boolean.timer1_q') == 'on')",
    });

    const result = resolver.resolveOutput("timer1", "Q");
    expect(result).toContain("input_boolean.timer1_q");
  });

  it("returns null for unknown timer", () => {
    const resolver = new TimerOutputResolver();

    const result = resolver.resolveOutput("unknown", "Q");
    expect(result).toBeNull();
  });

  it("identifies timer output references", () => {
    const resolver = new TimerOutputResolver();

    resolver.registerTimer("myTimer", { Q: "test" });

    expect(resolver.isTimerOutputRef("myTimer", "Q")).toBe(true);
    expect(resolver.isTimerOutputRef("myTimer", "ET")).toBe(true);
    expect(resolver.isTimerOutputRef("myTimer", "X")).toBe(false);
    expect(resolver.isTimerOutputRef("other", "Q")).toBe(false);
  });
}
);

