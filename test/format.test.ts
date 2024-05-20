import { describe, expect, test } from "vitest";
import {
  toHoursMinutesNotation,
  toShortDutchDate,
  toShortIsoDate,
  tryParseColonTimeNotation,
  tryParseSuffixTimeNotation,
  tryParseTimeNotation,
} from "@/format";

describe("format", () => {
  test("toShortIsoDate", () => {
    expect(toShortIsoDate(new Date(2020, 2, 28, 4))).toBe("2020-03-28");
    expect(toShortIsoDate(new Date(2020, 11, 31, 4))).toBe("2020-12-31");
  });

  test("toShortDutchDate", () => {
    expect(toShortDutchDate(new Date(2020, 1, 28))).toBe("28-02-2020");
    expect(toShortDutchDate(new Date(2020, 11, 31))).toBe("31-12-2020");
  });

  test("toHoursMinutesNotation", () => {
    expect(toHoursMinutesNotation(0)).toBe("");
    expect(toHoursMinutesNotation(1)).toBe("1m");
    expect(toHoursMinutesNotation(59)).toBe("59m");
    expect(toHoursMinutesNotation(60)).toBe("1u");
    expect(toHoursMinutesNotation(130)).toBe("2u10m");
  });

  test("tryParseTimeNotation", () => {
    expect(tryParseTimeNotation("")).toBe(null);
    expect(tryParseTimeNotation("abc1h")).toBe(null);
    expect(tryParseTimeNotation("1habc")).toBe(null);
    expect(tryParseTimeNotation("abc0:00")).toBe(null);
    expect(tryParseTimeNotation("0:00abc")).toBe(null);
    expect(tryParseTimeNotation("1:5")).toBe(null);
    expect(tryParseTimeNotation("1:87")).toBe(null);

    expect(tryParseTimeNotation("59m")).toBe(59);
    expect(tryParseTimeNotation("1")).toBe(60);
    expect(tryParseTimeNotation("10")).toBe(600);
    expect(tryParseTimeNotation("1h")).toBe(60);
    expect(tryParseTimeNotation("1h59m")).toBe(119);
    expect(tryParseTimeNotation("10h30m")).toBe(630);

    expect(tryParseTimeNotation("0:59")).toBe(59);
    expect(tryParseTimeNotation("1:30")).toBe(90);
    expect(tryParseTimeNotation("10:30")).toBe(630);
  });

  test("tryParseSuffixTimeNotation", () => {
    expect(tryParseSuffixTimeNotation("")).toBe(null);
    expect(tryParseSuffixTimeNotation("abc1h")).toBe(null);
    expect(tryParseSuffixTimeNotation("1habc")).toBe(null);
    expect(tryParseSuffixTimeNotation("abc0:00")).toBe(null);
    expect(tryParseSuffixTimeNotation("0:00abc")).toBe(null);
    expect(tryParseSuffixTimeNotation("1:5")).toBe(null);
    expect(tryParseSuffixTimeNotation("1:87")).toBe(null);
    expect(tryParseSuffixTimeNotation("1")).toBe(null);
    expect(tryParseSuffixTimeNotation("10")).toBe(null);
    expect(tryParseSuffixTimeNotation("0:59")).toBe(null);
    expect(tryParseSuffixTimeNotation("1:30")).toBe(null);
    expect(tryParseSuffixTimeNotation("10:30")).toBe(null);

    expect(tryParseSuffixTimeNotation("59m")).toBe(59);
    expect(tryParseSuffixTimeNotation("1h")).toBe(60);
    expect(tryParseSuffixTimeNotation("1h59m")).toBe(119);
    expect(tryParseSuffixTimeNotation("10h30m")).toBe(630);
  });

  test("tryParseColonTimeNotation", () => {
    expect(tryParseColonTimeNotation("")).toBe(null);
    expect(tryParseColonTimeNotation("abc1h")).toBe(null);
    expect(tryParseColonTimeNotation("1habc")).toBe(null);
    expect(tryParseColonTimeNotation("abc0:00")).toBe(null);
    expect(tryParseColonTimeNotation("0:00abc")).toBe(null);
    expect(tryParseColonTimeNotation("1:5")).toBe(null);
    expect(tryParseColonTimeNotation("1:87")).toBe(null);
    expect(tryParseColonTimeNotation("59m")).toBe(null);
    expect(tryParseColonTimeNotation("1")).toBe(null);
    expect(tryParseColonTimeNotation("10")).toBe(null);
    expect(tryParseColonTimeNotation("1h")).toBe(null);
    expect(tryParseColonTimeNotation("1h59m")).toBe(null);
    expect(tryParseColonTimeNotation("10h30m")).toBe(null);

    expect(tryParseColonTimeNotation("0:59")).toBe(59);
    expect(tryParseColonTimeNotation("1:30")).toBe(90);
    expect(tryParseColonTimeNotation("10:30")).toBe(630);
  });
});
