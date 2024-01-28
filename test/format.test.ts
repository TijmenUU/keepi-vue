import { describe, expect, test } from "vitest";
import {
  toColonSeparatedTime,
  toHoursMinutesNotation,
  toShortDutchDate,
  toShortIsoDate,
  tryParseColonSeparatedTime,
  tryParseHoursMinutesNotation,
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

  test("toColonSeparatedTime", () => {
    expect(toColonSeparatedTime(0)).toBe("00:00");
    expect(toColonSeparatedTime(1)).toBe("00:01");
    expect(toColonSeparatedTime(59)).toBe("00:59");
    expect(toColonSeparatedTime(60)).toBe("01:00");
    expect(toColonSeparatedTime(130)).toBe("02:10");
    expect(toColonSeparatedTime(600)).toBe("10:00");
  });

  test("tryParseColonSeparatedTime", () => {
    expect(tryParseColonSeparatedTime("")).toBe(null);
    expect(tryParseColonSeparatedTime("10")).toBe(null);
    expect(tryParseColonSeparatedTime("abc0:00")).toBe(null);
    expect(tryParseColonSeparatedTime("0:00abc")).toBe(null);
    expect(tryParseColonSeparatedTime("abc")).toBe(null);
    expect(tryParseColonSeparatedTime("1:5")).toBe(null);
    expect(tryParseColonSeparatedTime("1:87")).toBe(null);

    expect(tryParseColonSeparatedTime("0:59")).toBe(59);
    expect(tryParseColonSeparatedTime("1:30")).toBe(90);
    expect(tryParseColonSeparatedTime("10:30")).toBe(630);
  });

  test("tryParseHoursMinutesNotation", () => {
    expect(tryParseHoursMinutesNotation("")).toBe(null);
    expect(tryParseHoursMinutesNotation("1")).toBe(null);
    expect(tryParseHoursMinutesNotation("abc1h")).toBe(null);
    expect(tryParseHoursMinutesNotation("1habc")).toBe(null);

    expect(tryParseHoursMinutesNotation("59m")).toBe(59);
    expect(tryParseHoursMinutesNotation("1h")).toBe(60);
    expect(tryParseHoursMinutesNotation("1h59m")).toBe(119);
    expect(tryParseHoursMinutesNotation("10h30m")).toBe(630);
  });
});
