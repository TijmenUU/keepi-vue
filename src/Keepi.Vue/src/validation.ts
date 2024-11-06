import { tryParseTimeNotation } from "@/format";

export function getRequiredInputValidationMessage(value: string): string {
  if (value == null || value.length < 1) {
    return "Dit veld is verplicht";
  }
  return "";
}

export function getOptionalTimeInputValidationMessage(value: string): string {
  if (value != "" && tryParseTimeNotation(value) == null) {
    return "Niet ondersteunde tijdsnotatie";
  }

  return "";
}
