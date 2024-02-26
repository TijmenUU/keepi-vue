import { getDifferenceInSeconds, getWeekDaysFor, getWeekNumber } from "@/date";
import { describe, expect, test } from "vitest";

describe("format", () => {
  test("getWeekDaysFor", () => {
    expect(getWeekDaysFor(new Date(2024, 0, 28))).toEqual({
      dates: [
        new Date(2024, 0, 22),
        new Date(2024, 0, 23),
        new Date(2024, 0, 24),
        new Date(2024, 0, 25),
        new Date(2024, 0, 26),
        new Date(2024, 0, 27),
        new Date(2024, 0, 28),
      ],
      weekNumber: 4,
      year: 2024,
    });

    expect(getWeekDaysFor(new Date(2024, 0, 25))).toEqual({
      dates: [
        new Date(2024, 0, 22),
        new Date(2024, 0, 23),
        new Date(2024, 0, 24),
        new Date(2024, 0, 25),
        new Date(2024, 0, 26),
        new Date(2024, 0, 27),
        new Date(2024, 0, 28),
      ],
      weekNumber: 4,
      year: 2024,
    });

    expect(getWeekDaysFor(new Date(2024, 0, 22))).toEqual({
      dates: [
        new Date(2024, 0, 22),
        new Date(2024, 0, 23),
        new Date(2024, 0, 24),
        new Date(2024, 0, 25),
        new Date(2024, 0, 26),
        new Date(2024, 0, 27),
        new Date(2024, 0, 28),
      ],
      weekNumber: 4,
      year: 2024,
    });

    expect(getWeekDaysFor(new Date(2022, 0, 1))).toEqual({
      dates: [
        new Date(2021, 11, 27),
        new Date(2021, 11, 28),
        new Date(2021, 11, 29),
        new Date(2021, 11, 30),
        new Date(2021, 11, 31),
        new Date(2022, 0, 1),
        new Date(2022, 0, 2),
      ],
      weekNumber: 52,
      year: 2021,
    });
  });

  test("getWeekNumber", () => {
    expect(getWeekNumber(new Date(2021, 11, 31))).toBe(52);
    expect(getWeekNumber(new Date(2022, 0, 1))).toBe(52);

    expect(getWeekNumber(new Date(2023, 11, 31))).toBe(52);

    expect(getWeekNumber(new Date(2024, 0, 1))).toBe(1);
    expect(getWeekNumber(new Date(2024, 0, 7))).toBe(1);
    expect(getWeekNumber(new Date(2024, 0, 14))).toBe(2);
    expect(getWeekNumber(new Date(2024, 0, 21))).toBe(3);
    expect(getWeekNumber(new Date(2024, 0, 28))).toBe(4);
  });

  test("getDifferenceInSeconds", () => {
    const now = new Date(2024, 0, 1, 0, 0, 0, 0);
    expect(getDifferenceInSeconds(now, now)).toBe(0);

    const fiveSecondsLater = new Date(now);
    fiveSecondsLater.setSeconds(5);
    expect(getDifferenceInSeconds(now, fiveSecondsLater)).toBeCloseTo(5, 1);
    expect(getDifferenceInSeconds(fiveSecondsLater, now)).toBeCloseTo(5, 1);

    const twoHundredMillisecondsLater = new Date(now);
    twoHundredMillisecondsLater.setMilliseconds(200);
    expect(
      getDifferenceInSeconds(now, twoHundredMillisecondsLater),
    ).toBeCloseTo(0.2, 1);
    expect(
      getDifferenceInSeconds(twoHundredMillisecondsLater, now),
    ).toBeCloseTo(0.2, 1);
  });
});
