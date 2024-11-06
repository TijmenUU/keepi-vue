import { describe, expect, test } from "vitest";
import {
  getOptionalTimeInputValidationMessage,
  getRequiredInputValidationMessage,
} from "@/validation";

describe("validation", () => {
  test("getRequiredInputValidationMessage", () => {
    expect(getRequiredInputValidationMessage("")).toBe("Dit veld is verplicht");
    expect(getRequiredInputValidationMessage("a")).toBe("");
  });

  test("getOptionalTimeInputValidationMessage", () => {
    expect(getOptionalTimeInputValidationMessage("1u30m")).toBe("");
    expect(getOptionalTimeInputValidationMessage("1")).toBe("");
    expect(getOptionalTimeInputValidationMessage("1:30")).toBe("");

    expect(getOptionalTimeInputValidationMessage("1h30")).toBe(
      "Niet ondersteunde tijdsnotatie",
    );
    expect(getOptionalTimeInputValidationMessage("1,5")).toBe(
      "Niet ondersteunde tijdsnotatie",
    );
    expect(getOptionalTimeInputValidationMessage("1:30m")).toBe(
      "Niet ondersteunde tijdsnotatie",
    );
  });
});
