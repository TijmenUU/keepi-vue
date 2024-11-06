import { DateRange } from "@/date";
import { toShortIsoDate } from "@/format";
import { INokoGetEntryResponse } from "@/responses";
import { mapToTimeTableEntries, getNokoCallsForDelta } from "@/transformer";
import { Category, TimeTableEntry, loggableDays } from "@/types";
import { describe, expect, test } from "vitest";

describe("transformer", () => {
  describe("mapToTimeTableEntries", () => {
    test("date range should be sorted ascendingly", () => {
      expect(() =>
        mapToTimeTableEntries(
          {
            dates: [
              new Date("2024-01-23T00:00:00Z"), // tuesday
              new Date("2024-01-22T00:00:00Z"), // monday
              new Date("2024-01-24T00:00:00Z"), // wednesday
              new Date("2024-01-25T00:00:00Z"), // thursday
              new Date("2024-01-26T00:00:00Z"), // friday
              new Date("2024-01-27T00:00:00Z"), // saturday
              new Date("2024-01-28T00:00:00Z"), // sunday
            ],
            weekNumber: 4,
            year: 2024,
          },
          getTestCategories(),
          [],
        ),
      ).toThrowError(
        "Expected the date range dates to be sorted ascendingly and unique",
      );
    });

    test("date range should 1 week", () => {
      expect(() =>
        mapToTimeTableEntries(
          {
            dates: [
              new Date("2024-01-22T00:00:00Z"), // monday
              new Date("2024-01-23T00:00:00Z"), // tuesday
              new Date("2024-01-24T00:00:00Z"), // wednesday
              new Date("2024-01-25T00:00:00Z"), // thursday
              new Date("2024-01-26T00:00:00Z"), // friday
              new Date("2024-01-27T00:00:00Z"), // saturday
            ],
            weekNumber: 4,
            year: 2024,
          },
          getTestCategories(),
          [],
        ),
      ).toThrowError(
        "Expected the date range to be 1 week, but it was 6 day(s)",
      );
    });

    test("date range should contain unique dates", () => {
      expect(() =>
        mapToTimeTableEntries(
          {
            dates: [
              new Date("2024-01-22T00:00:00Z"), // monday
              new Date("2024-01-23T00:00:00Z"), // tuesday
              new Date("2024-01-23T00:00:00Z"), // tuesday
              new Date("2024-01-25T00:00:00Z"), // thursday
              new Date("2024-01-26T00:00:00Z"), // friday
              new Date("2024-01-27T00:00:00Z"), // saturday
              new Date("2024-01-28T00:00:00Z"), // sunday
            ],
            weekNumber: 4,
            year: 2024,
          },
          getTestCategories(),
          [],
        ),
      ).toThrowError(
        "Expected the date range dates to be sorted ascendingly and unique",
      );
    });

    test("entries should be sorted by category input order then by date ascending", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestCategories(),
        [
          {
            id: 5004,
            date: "2024-01-24", // wednesday
            user: {
              id: 9000,
            },
            minutes: 60, // 1 hour
            description: "#Presentation",
            project: {
              id: 1,
            },
            tags: [
              {
                id: 4001,
                formatted_name: "#Presentation",
              },
            ],
          },
          {
            id: 5002,
            date: "2024-01-23", // tuesday
            user: {
              id: 9000,
            },
            minutes: 480, // 8 hours
            description: "#Development",
            project: {
              id: 1,
            },
            tags: [
              {
                id: 4000,
                formatted_name: "#Development",
              },
            ],
          },
          {
            id: 5001,
            date: "2024-01-22", // monday
            user: {
              id: 9000,
            },
            minutes: 480, // 8 hours
            description: "#Development",
            project: {
              id: 1,
            },
            tags: [
              {
                id: 4000,
                formatted_name: "#Development",
              },
            ],
          },
          {
            id: 5005,
            date: "2024-01-25", // thursday
            user: {
              id: 9000,
            },
            minutes: 480, // 8 hours
            description: "#National-Holiday",
            project: {
              id: 2,
            },
            tags: [
              {
                id: 4002,
                formatted_name: "#National-Holiday",
              },
            ],
          },
          {
            id: 5006,
            date: "2024-01-26", // friday
            user: {
              id: 9000,
            },
            minutes: 480, // 8 hours
            description: "#Development",
            project: {
              id: 1,
            },
            tags: [
              {
                id: 4000,
                formatted_name: "#Development",
              },
            ],
          },
        ],
      );

      expect(result.entries.length).toBe(28);
      expect(result.unmappedEntries.length).toBe(0);

      expect(result.entries[0].category.name).toBe("Development");
      expect(result.entries[1].category.name).toBe("Development");
      expect(result.entries[2].category.name).toBe("Development");
      expect(result.entries[3].category.name).toBe("Development");
      expect(result.entries[4].category.name).toBe("Development");
      expect(result.entries[5].category.name).toBe("Development");
      expect(result.entries[6].category.name).toBe("Development");

      expect(result.entries[7].category.name).toBe("Vacation");
      expect(result.entries[8].category.name).toBe("Vacation");
      expect(result.entries[9].category.name).toBe("Vacation");
      expect(result.entries[10].category.name).toBe("Vacation");
      expect(result.entries[11].category.name).toBe("Vacation");
      expect(result.entries[12].category.name).toBe("Vacation");
      expect(result.entries[13].category.name).toBe("Vacation");

      expect(result.entries[14].category.name).toBe("National holiday");
      expect(result.entries[15].category.name).toBe("National holiday");
      expect(result.entries[16].category.name).toBe("National holiday");
      expect(result.entries[17].category.name).toBe("National holiday");
      expect(result.entries[18].category.name).toBe("National holiday");
      expect(result.entries[19].category.name).toBe("National holiday");
      expect(result.entries[20].category.name).toBe("National holiday");

      expect(result.entries[21].category.name).toBe("Presentation");
      expect(result.entries[22].category.name).toBe("Presentation");
      expect(result.entries[23].category.name).toBe("Presentation");
      expect(result.entries[24].category.name).toBe("Presentation");
      expect(result.entries[25].category.name).toBe("Presentation");
      expect(result.entries[26].category.name).toBe("Presentation");
      expect(result.entries[27].category.name).toBe("Presentation");

      expect(toShortIsoDate(result.entries[0].date)).toBe("2024-01-22");
      expect(toShortIsoDate(result.entries[7].date)).toBe("2024-01-22");
      expect(toShortIsoDate(result.entries[14].date)).toBe("2024-01-22");
      expect(toShortIsoDate(result.entries[21].date)).toBe("2024-01-22");

      expect(toShortIsoDate(result.entries[1].date)).toBe("2024-01-23");
      expect(toShortIsoDate(result.entries[8].date)).toBe("2024-01-23");
      expect(toShortIsoDate(result.entries[15].date)).toBe("2024-01-23");
      expect(toShortIsoDate(result.entries[22].date)).toBe("2024-01-23");

      expect(toShortIsoDate(result.entries[2].date)).toBe("2024-01-24");
      expect(toShortIsoDate(result.entries[9].date)).toBe("2024-01-24");
      expect(toShortIsoDate(result.entries[16].date)).toBe("2024-01-24");
      expect(toShortIsoDate(result.entries[23].date)).toBe("2024-01-24");

      expect(toShortIsoDate(result.entries[3].date)).toBe("2024-01-25");
      expect(toShortIsoDate(result.entries[10].date)).toBe("2024-01-25");
      expect(toShortIsoDate(result.entries[17].date)).toBe("2024-01-25");
      expect(toShortIsoDate(result.entries[24].date)).toBe("2024-01-25");

      expect(toShortIsoDate(result.entries[4].date)).toBe("2024-01-26");
      expect(toShortIsoDate(result.entries[11].date)).toBe("2024-01-26");
      expect(toShortIsoDate(result.entries[18].date)).toBe("2024-01-26");
      expect(toShortIsoDate(result.entries[25].date)).toBe("2024-01-26");

      expect(toShortIsoDate(result.entries[5].date)).toBe("2024-01-27");
      expect(toShortIsoDate(result.entries[12].date)).toBe("2024-01-27");
      expect(toShortIsoDate(result.entries[19].date)).toBe("2024-01-27");
      expect(toShortIsoDate(result.entries[26].date)).toBe("2024-01-27");

      expect(toShortIsoDate(result.entries[6].date)).toBe("2024-01-28");
      expect(toShortIsoDate(result.entries[13].date)).toBe("2024-01-28");
      expect(toShortIsoDate(result.entries[20].date)).toBe("2024-01-28");
      expect(toShortIsoDate(result.entries[27].date)).toBe("2024-01-28");
    });

    test("average workweek scenario should be mapped correctly", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestCategories(),
        getAverageWorkweekEntries(),
      );

      expect(result.entries.length).toBe(28);
      expect(result.unmappedEntries.length).toBe(0);

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Development",
        result.entries,
        [480, 480, 420, 0, 480, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Presentation",
        result.entries,
        [0, 0, 60, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "National holiday",
        result.entries,
        [0, 0, 0, 480, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Vacation",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );
    });

    test("average workweek scenario with unmapped entries should be mapped correctly", () => {
      // Remove the categories National holiday and Presentation
      const testCategories = getTestCategories().slice(0, 2);

      const result = mapToTimeTableEntries(
        getTestDateRange(),
        testCategories,
        getAverageWorkweekEntries(),
      );

      //                  | Monday | Tuesday | Wednesday | Thursday | Friday
      // Development      | 8h     | 8h      | 7h        | -        | 8h
      // Presentation     | -      | -       | 1h        | -        | -
      // National holiday | -      | -       | -         | 8h       | -
      expect(result.entries.length).toBe(14);
      expect(result.unmappedEntries.length).toBe(7);

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Development",
        result.entries,
        [480, 480, 420, 0, 480, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Vacation",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Unmapped",
        result.unmappedEntries,
        [0, 0, 60, 480, 0, 0, 0],
      );
    });

    test("partial average workweek scenario should be mapped correctly", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestCategories(),
        // Only include monday until wednesday
        getAverageWorkweekEntries().filter((e) => e.date < "2024-01-25"),
      );

      expect(result.entries.length).toBe(28);
      expect(result.unmappedEntries.length).toBe(0);

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Development",
        result.entries,
        [480, 480, 420, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Presentation",
        result.entries,
        [0, 0, 60, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "National holiday",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Vacation",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );
    });

    test("vacation scenario should be mapped correctly", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestCategories(),
        getVacationWeekEntries(),
      );

      expect(result.entries.length).toBe(28);
      expect(result.unmappedEntries.length).toBe(0);

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Development",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Presentation",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "National holiday",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Vacation",
        result.entries,
        [480, 480, 480, 480, 480, 0, 0],
      );
    });

    test("ignores unmapped entries", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestCategories(),
        [
          {
            id: 5001,
            date: "2024-01-22", // monday
            user: {
              id: 9000,
            },
            minutes: 480, // 8 hours
            description: "#Development",
            project: {
              id: 2, // Different project ID
            },
            tags: [
              {
                id: 4000,
                formatted_name: "#Development",
              },
            ],
          },
          {
            id: 5002,
            date: "2024-01-22", // monday
            user: {
              id: 9000,
            },
            minutes: 480, // 8 hours
            description: "#Development",
            project: {
              id: 1,
            },
            tags: [
              {
                id: 4000,
                formatted_name: "#Developments", // Different tag
              },
            ],
          },
          {
            id: 5003,
            date: "2024-01-22", // monday
            user: {
              id: 9000,
            },
            minutes: 480, // 8 hours
            description: "#Development",
            project: {
              id: 1,
            },
            tags: [
              // Different tag combination
              {
                id: 4000,
                formatted_name: "#Development",
              },
              {
                id: 4001,
                formatted_name: "#Special",
              },
            ],
          },
        ],
      );

      expect(result.entries.length).toBe(28);
      expect(result.unmappedEntries.length).toBeGreaterThan(0);

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Development",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Presentation",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "National holiday",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Vacation",
        result.entries,
        [0, 0, 0, 0, 0, 0, 0],
      );
    });

    function expectToHaveTimeTableEntriesForProjectWeekDays(
      categoryName: string,
      timeTableEntries: TimeTableEntry[],
      minutesPerWeekDay: number[],
    ) {
      const categoryEntries = timeTableEntries.filter(
        (r) => r.category.name === categoryName,
      );
      expect(categoryEntries.length).toBe(7);

      if (minutesPerWeekDay.length != loggableDays.length) {
        throw Error(
          `Unexpected length of minutes per workday. Expected ${loggableDays.length} (1 per workday) but received ${minutesPerWeekDay.length}`,
        );
      }
      if (categoryEntries.length != loggableDays.length) {
        throw Error(
          `Unexpected number of entries for ${categoryName}. Expected ${loggableDays.length} (1 per workday) but received ${categoryEntries.length}`,
        );
      }

      for (let i = 0; i < loggableDays.length; ++i) {
        const match = categoryEntries.find(
          (e) =>
            e.category.name === categoryName && e.dayName === loggableDays[i],
        );
        if (match == null) {
          throw Error(
            `The mapped entries dit not contain an entry for category ${categoryName} and ${loggableDays[i]}`,
          );
        }

        expect(match.inputMinutes).toBe(minutesPerWeekDay[i]);
      }
    }
  });

  // If these test fail be sure to first check if the mapToTimeTableEntries
  // tests pass as it is used to create scenarios as input for these tests
  describe("getNokoCallsForDelta", () => {
    test("empty workweek to complete workweek should produce expected delta", () => {
      const categoryMapping = getTestCategories();
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        entries,
      );

      const result = getNokoCallsForDelta(input.entries, []);

      expect(result.creates.length).toBe(6);
      expect(result.idsToDelete.length).toBe(0);

      expect(result.creates).toContainEqual({
        date: "2024-01-22",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-23",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-24",
        minutes: 420,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-24",
        minutes: 60,
        project_id: 1,
        description: "#Presentation",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-25",
        minutes: 480,
        project_id: 2,
        description: "#National-Holiday",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-26",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
    });

    test("partial workweek to complete workweek should produce expected delta", () => {
      const categoryMapping = getTestCategories();
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        entries,
      );

      const result = getNokoCallsForDelta(
        input.entries,
        // Only include monday until wednesday
        entries.filter((e) => e.date < "2024-01-25"),
      );

      expect(result.creates.length).toBe(2);
      expect(result.idsToDelete.length).toBe(0);

      expect(result.creates).toContainEqual({
        date: "2024-01-25",
        minutes: 480,
        project_id: 2,
        description: "#National-Holiday",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-26",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
    });

    test("overwrite complete workweek with vacation should produce expected delta", () => {
      const categoryMapping = getTestCategories();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        getVacationWeekEntries(),
      );

      const result = getNokoCallsForDelta(
        input.entries,
        getAverageWorkweekEntries(),
      );

      expect(result.idsToDelete.length).toBe(6);
      expect(result.idsToDelete).toContain(5001);
      expect(result.idsToDelete).toContain(5002);
      expect(result.idsToDelete).toContain(5003);
      expect(result.idsToDelete).toContain(5004);
      expect(result.idsToDelete).toContain(5005);
      expect(result.idsToDelete).toContain(5006);

      expect(result.creates.length).toBe(5);
      expect(result.creates).toContainEqual({
        date: "2024-01-22",
        minutes: 480,
        project_id: 3,
        description: "#Vacation",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-23",
        minutes: 480,
        project_id: 3,
        description: "#Vacation",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-24",
        minutes: 480,
        project_id: 3,
        description: "#Vacation",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-25",
        minutes: 480,
        project_id: 3,
        description: "#Vacation",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-26",
        minutes: 480,
        project_id: 3,
        description: "#Vacation",
      });
    });

    test("update workweek to complete workweek should produce expected delta", () => {
      const categoryMapping = getTestCategories();

      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        getAverageWorkweekEntries(),
      );

      const result = getNokoCallsForDelta(
        input.entries,
        // All average workweek devlopment entry minutes halved scenario
        getAverageWorkweekEntries().map((e) => {
          if (e.description === "#Development") {
            e.minutes /= 2;
          }
          return e;
        }),
      );

      expect(result.creates.length).toBe(4);
      expect(result.creates).toContainEqual({
        date: "2024-01-22",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-23",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-24",
        minutes: 420,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-26",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });

      expect(result.idsToDelete.length).toBe(4);
      expect(result.idsToDelete).toContain(5001);
      expect(result.idsToDelete).toContain(5002);
      expect(result.idsToDelete).toContain(5003);
      expect(result.idsToDelete).toContain(5006);
    });

    test("ignores readonly categories", () => {
      const categoryMapping = getTestCategories();
      categoryMapping[2].readonly = true;
      categoryMapping[3].readonly = true;
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        entries,
      );

      const result = getNokoCallsForDelta(input.entries, []);

      expect(result.creates.length).toBe(4);
      expect(result.idsToDelete.length).toBe(0);

      expect(result.creates).toContainEqual({
        date: "2024-01-22",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-23",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-24",
        minutes: 420,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-26",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
    });

    test("ignores categories without a project ID or Noko tags", () => {
      const categoryMapping = getTestCategories();
      categoryMapping[2].readonly = true;
      categoryMapping[3].readonly = true;
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        entries,
      );
      input.entries.forEach((entry) => {
        if (entry.category.name === categoryMapping[2].name) {
          entry.category.projectId = undefined;
        } else if (entry.category.name === categoryMapping[3].name) {
          entry.category.nokoTags = undefined;
        }
      });

      const result = getNokoCallsForDelta(input.entries, []);

      expect(result.creates.length).toBe(4);
      expect(result.idsToDelete.length).toBe(0);

      expect(result.creates).toContainEqual({
        date: "2024-01-22",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-23",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-24",
        minutes: 420,
        project_id: 1,
        description: "#Development",
      });
      expect(result.creates).toContainEqual({
        date: "2024-01-26",
        minutes: 480,
        project_id: 1,
        description: "#Development",
      });
    });
  });
});

//                  | Monday | Tuesday | Wednesday | Thursday | Friday
// Development      | 8h     | 8h      | 7h        | -        | 8h
// Presentation     | -      | -       | 1h        | -        | -
// National holiday | -      | -       | -         | 8h       | -
function getAverageWorkweekEntries(): INokoGetEntryResponse[] {
  return [
    {
      id: 5001,
      date: "2024-01-22", // monday
      user: {
        id: 9000,
      },
      minutes: 480, // 8 hours
      description: "#Development",
      project: {
        id: 1,
      },
      tags: [
        {
          id: 4000,
          formatted_name: "#Development",
        },
      ],
    },
    {
      id: 5002,
      date: "2024-01-23", // tuesday
      user: {
        id: 9000,
      },
      minutes: 480, // 8 hours
      description: "#Development",
      project: {
        id: 1,
      },
      tags: [
        {
          id: 4000,
          formatted_name: "#Development",
        },
      ],
    },
    {
      id: 5003,
      date: "2024-01-24", // wednesday
      user: {
        id: 9000,
      },
      minutes: 420, // 7 hours
      description: "#Development",
      project: {
        id: 1,
      },
      tags: [
        {
          id: 4000,
          formatted_name: "#Development",
        },
      ],
    },
    {
      id: 5004,
      date: "2024-01-24", // wednesday
      user: {
        id: 9000,
      },
      minutes: 60, // 1 hour
      description: "#Presentation",
      project: {
        id: 1,
      },
      tags: [
        {
          id: 4001,
          formatted_name: "#Presentation",
        },
      ],
    },
    {
      id: 5005,
      date: "2024-01-25", // thursday
      user: {
        id: 9000,
      },
      minutes: 480, // 8 hours
      description: "#National-Holiday",
      project: {
        id: 2,
      },
      tags: [
        {
          id: 4002,
          formatted_name: "#National-Holiday",
        },
      ],
    },
    {
      id: 5006,
      date: "2024-01-26", // friday
      user: {
        id: 9000,
      },
      minutes: 480, // 8 hours
      description: "#Development",
      project: {
        id: 1,
      },
      tags: [
        {
          id: 4000,
          formatted_name: "#Development",
        },
      ],
    },
  ];
}

//                  | Monday | Tuesday | Wednesday | Thursday | Friday
// Vacation         | 8h     | 8h      | 8h        | 8h       | 8h
function getVacationWeekEntries(): INokoGetEntryResponse[] {
  return getTestWeekdays()
    .slice(0, 5)
    .map((date, index) => ({
      id: 5010 + index,
      date: toShortIsoDate(date),
      user: {
        id: 9000,
      },
      minutes: 480, // 8 hours
      description: "#Vacation",
      project: {
        id: 3,
      },
      tags: [
        {
          id: 4003,
          formatted_name: "#Vacation",
        },
      ],
    }));
}

function getTestWeekdays(): Date[] {
  return [
    new Date("2024-01-22T00:00:00Z"), // monday
    new Date("2024-01-23T00:00:00Z"), // tuesday
    new Date("2024-01-24T00:00:00Z"), // wednesday
    new Date("2024-01-25T00:00:00Z"), // thursday
    new Date("2024-01-26T00:00:00Z"), // friday
    new Date("2024-01-27T00:00:00Z"), // saturday
    new Date("2024-01-28T00:00:00Z"), // sunday
  ];
}

function getTestDateRange(): DateRange {
  return {
    dates: getTestWeekdays(),
    weekNumber: 4,
    year: 2024,
  };
}

function getTestCategories(): Category[] {
  return [
    {
      order: 1,
      readonly: false,
      name: "Development",
      projectId: 1,
      nokoTags: ["#Development"],
    },
    {
      order: 2,
      readonly: false,
      name: "Vacation",
      projectId: 3,
      nokoTags: ["#Vacation"],
    },
    {
      order: 3,
      readonly: false,
      name: "National holiday",
      projectId: 2,
      nokoTags: ["#National-Holiday"],
    },
    {
      order: 4,
      readonly: false,
      name: "Presentation",
      projectId: 1,
      nokoTags: ["#Presentation"],
    },
  ];
}
