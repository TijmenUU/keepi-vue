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
          getTestTagToCategoryMappings(),
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
          getTestTagToCategoryMappings(),
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
          getTestTagToCategoryMappings(),
          [],
        ),
      ).toThrowError(
        "Expected the date range dates to be sorted ascendingly and unique",
      );
    });

    test("entries should be sorted by category input order then by date ascending", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestTagToCategoryMappings(),
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

      expect(result.length).toBe(28);

      expect(result[0].category.name).toBe("Development");
      expect(result[1].category.name).toBe("Development");
      expect(result[2].category.name).toBe("Development");
      expect(result[3].category.name).toBe("Development");
      expect(result[4].category.name).toBe("Development");
      expect(result[5].category.name).toBe("Development");
      expect(result[6].category.name).toBe("Development");

      expect(result[7].category.name).toBe("Vacation");
      expect(result[8].category.name).toBe("Vacation");
      expect(result[9].category.name).toBe("Vacation");
      expect(result[10].category.name).toBe("Vacation");
      expect(result[11].category.name).toBe("Vacation");
      expect(result[12].category.name).toBe("Vacation");
      expect(result[13].category.name).toBe("Vacation");

      expect(result[14].category.name).toBe("National holiday");
      expect(result[15].category.name).toBe("National holiday");
      expect(result[16].category.name).toBe("National holiday");
      expect(result[17].category.name).toBe("National holiday");
      expect(result[18].category.name).toBe("National holiday");
      expect(result[19].category.name).toBe("National holiday");
      expect(result[20].category.name).toBe("National holiday");

      expect(result[21].category.name).toBe("Presentation");
      expect(result[22].category.name).toBe("Presentation");
      expect(result[23].category.name).toBe("Presentation");
      expect(result[24].category.name).toBe("Presentation");
      expect(result[25].category.name).toBe("Presentation");
      expect(result[26].category.name).toBe("Presentation");
      expect(result[27].category.name).toBe("Presentation");

      expect(toShortIsoDate(result[0].date)).toBe("2024-01-22");
      expect(toShortIsoDate(result[7].date)).toBe("2024-01-22");
      expect(toShortIsoDate(result[14].date)).toBe("2024-01-22");
      expect(toShortIsoDate(result[21].date)).toBe("2024-01-22");

      expect(toShortIsoDate(result[1].date)).toBe("2024-01-23");
      expect(toShortIsoDate(result[8].date)).toBe("2024-01-23");
      expect(toShortIsoDate(result[15].date)).toBe("2024-01-23");
      expect(toShortIsoDate(result[22].date)).toBe("2024-01-23");

      expect(toShortIsoDate(result[2].date)).toBe("2024-01-24");
      expect(toShortIsoDate(result[9].date)).toBe("2024-01-24");
      expect(toShortIsoDate(result[16].date)).toBe("2024-01-24");
      expect(toShortIsoDate(result[23].date)).toBe("2024-01-24");

      expect(toShortIsoDate(result[3].date)).toBe("2024-01-25");
      expect(toShortIsoDate(result[10].date)).toBe("2024-01-25");
      expect(toShortIsoDate(result[17].date)).toBe("2024-01-25");
      expect(toShortIsoDate(result[24].date)).toBe("2024-01-25");

      expect(toShortIsoDate(result[4].date)).toBe("2024-01-26");
      expect(toShortIsoDate(result[11].date)).toBe("2024-01-26");
      expect(toShortIsoDate(result[18].date)).toBe("2024-01-26");
      expect(toShortIsoDate(result[25].date)).toBe("2024-01-26");

      expect(toShortIsoDate(result[5].date)).toBe("2024-01-27");
      expect(toShortIsoDate(result[12].date)).toBe("2024-01-27");
      expect(toShortIsoDate(result[19].date)).toBe("2024-01-27");
      expect(toShortIsoDate(result[26].date)).toBe("2024-01-27");

      expect(toShortIsoDate(result[6].date)).toBe("2024-01-28");
      expect(toShortIsoDate(result[13].date)).toBe("2024-01-28");
      expect(toShortIsoDate(result[20].date)).toBe("2024-01-28");
      expect(toShortIsoDate(result[27].date)).toBe("2024-01-28");
    });

    test("average workweek scenario should be mapped correctly", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestTagToCategoryMappings(),
        getAverageWorkweekEntries(),
      );

      expect(result.length).toBe(28);

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Development",
        result,
        [480, 480, 420, 0, 480, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Presentation",
        result,
        [0, 0, 60, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "National holiday",
        result,
        [0, 0, 0, 480, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Vacation",
        result,
        [0, 0, 0, 0, 0, 0, 0],
      );
    });

    test("partial average workweek scenario should be mapped correctly", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestTagToCategoryMappings(),
        // Only include monday until wednesday
        getAverageWorkweekEntries().filter((e) => e.date < "2024-01-25"),
      );

      expect(result.length).toBe(28);

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Development",
        result,
        [480, 480, 420, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Presentation",
        result,
        [0, 0, 60, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "National holiday",
        result,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Vacation",
        result,
        [0, 0, 0, 0, 0, 0, 0],
      );
    });

    test("vacation scenario should be mapped correctly", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestTagToCategoryMappings(),
        getVacationWeekEntries(),
      );

      expect(result.length).toBe(28);

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Development",
        result,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Presentation",
        result,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "National holiday",
        result,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Vacation",
        result,
        [480, 480, 480, 480, 480, 0, 0],
      );
    });

    test("ignores unmapped entries", () => {
      const result = mapToTimeTableEntries(
        getTestDateRange(),
        getTestTagToCategoryMappings(),
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

      expect(result.length).toBe(28);

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Development",
        result,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Presentation",
        result,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "National holiday",
        result,
        [0, 0, 0, 0, 0, 0, 0],
      );

      expectToHaveTimeTableEntriesForProjectWeekDays(
        "Vacation",
        result,
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
      const categoryMapping = getTestTagToCategoryMappings();
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        entries,
      );

      const result = getNokoCallsForDelta(input, []);

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
      const categoryMapping = getTestTagToCategoryMappings();
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        entries,
      );

      const result = getNokoCallsForDelta(
        input,
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
      const categoryMapping = getTestTagToCategoryMappings();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        getVacationWeekEntries(),
      );

      const result = getNokoCallsForDelta(input, getAverageWorkweekEntries());

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
      const categoryMapping = getTestTagToCategoryMappings();

      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        getAverageWorkweekEntries(),
      );

      const result = getNokoCallsForDelta(
        input,
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
      const categoryMapping = getTestTagToCategoryMappings();
      categoryMapping[2].readonly = true;
      categoryMapping[3].readonly = true;
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        entries,
      );

      const result = getNokoCallsForDelta(input, []);

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
      const categoryMapping = getTestTagToCategoryMappings();
      categoryMapping[2].readonly = true;
      categoryMapping[3].readonly = true;
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = mapToTimeTableEntries(
        getTestDateRange(),
        categoryMapping,
        entries,
      );
      input.forEach((entry) => {
        if (entry.category.name === categoryMapping[2].name) {
          entry.category.projectId = undefined;
        } else if (entry.category.name === categoryMapping[3].name) {
          entry.category.nokoTags = undefined;
        }
      });

      const result = getNokoCallsForDelta(input, []);

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

function getTestTagToCategoryMappings(): Category[] {
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
