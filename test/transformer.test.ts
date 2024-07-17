import { toShortIsoDate } from "@/format";
import { INokoGetEntryResponse } from "@/responses";
import { convertToTimeTableInput, getNokoCallsForDelta } from "@/transformer";
import { TagToCategoryMapping, TimeTableEntry, loggableDays } from "@/types";
import { describe, expect, test } from "vitest";

describe("transformer", () => {
  describe("convertToTimeTableInput", () => {
    test("average workweek scenario should be mapped correctly", () => {
      const result = convertToTimeTableInput(
        getTestWeekdays(),
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
      const result = convertToTimeTableInput(
        getTestWeekdays(),
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
      const result = convertToTimeTableInput(
        getTestWeekdays(),
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
      const result = convertToTimeTableInput(
        getTestWeekdays(),
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
      category: string,
      timeTableEntries: TimeTableEntry[],
      minutesPerWeekDay: number[],
    ) {
      const categoryEntries = timeTableEntries.filter(
        (r) => r.category === category,
      );
      expect(categoryEntries.length).toBe(7);

      if (minutesPerWeekDay.length != loggableDays.length) {
        throw Error(
          `Unexpected length of minutes per workday. Expected ${loggableDays.length} (1 per workday) but received ${minutesPerWeekDay.length}`,
        );
      }
      if (categoryEntries.length != loggableDays.length) {
        throw Error(
          `Unexpected number of entries for ${category}. Expected ${loggableDays.length} (1 per workday) but received ${categoryEntries.length}`,
        );
      }

      for (let i = 0; i < loggableDays.length; ++i) {
        expect(categoryEntries).toContainEqual({
          category,
          day: loggableDays[i],
          minutes: minutesPerWeekDay[i],
        });
      }
    }
  });

  // If these test fail be sure to first check if the convertToTimeTableInput
  // tests pass as it is used to create scenarios as input for these tests
  describe("getNokoCallsForDelta", () => {
    test("empty workweek to complete workweek should produce expected delta", () => {
      const weekDays = getTestWeekdays();
      const categoryMapping = getTestTagToCategoryMappings();
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = convertToTimeTableInput(weekDays, categoryMapping, entries);

      const result = getNokoCallsForDelta(weekDays, categoryMapping, [], input);

      expect(result.creates.length).toBe(6);
      expect(result.idsToDelete.length).toBe(0);
      expect(result.updates.length).toBe(0);

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
      const weekDays = getTestWeekdays();
      const categoryMapping = getTestTagToCategoryMappings();
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = convertToTimeTableInput(weekDays, categoryMapping, entries);

      const result = getNokoCallsForDelta(
        weekDays,
        categoryMapping,
        // Only include monday until wednesday
        entries.filter((e) => e.date < "2024-01-25"),
        input,
      );

      expect(result.creates.length).toBe(2);
      expect(result.idsToDelete.length).toBe(0);
      expect(result.updates.length).toBe(0);

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
      const weekDays = getTestWeekdays();
      const categoryMapping = getTestTagToCategoryMappings();

      // The complete average workweek scenario
      const input = convertToTimeTableInput(
        weekDays,
        categoryMapping,
        getVacationWeekEntries(),
      );

      const result = getNokoCallsForDelta(
        weekDays,
        categoryMapping,
        getAverageWorkweekEntries(),
        input,
      );

      expect(result.idsToDelete.length).toBe(6);
      expect(result.idsToDelete).toContain(5001);
      expect(result.idsToDelete).toContain(5002);
      expect(result.idsToDelete).toContain(5003);
      expect(result.idsToDelete).toContain(5004);
      expect(result.idsToDelete).toContain(5005);
      expect(result.idsToDelete).toContain(5006);

      expect(result.updates.length).toBe(0);

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
      const weekDays = getTestWeekdays();
      const categoryMapping = getTestTagToCategoryMappings();

      const input = convertToTimeTableInput(
        weekDays,
        categoryMapping,
        getAverageWorkweekEntries(),
      );

      const result = getNokoCallsForDelta(
        weekDays,
        categoryMapping,
        // All average workweek devlopment entry minutes halved scenario
        getAverageWorkweekEntries().map((e) => {
          if (e.description === "#Development") {
            e.minutes /= 2;
          }
          return e;
        }),
        input,
      );

      expect(result.creates.length).toBe(0);
      expect(result.idsToDelete.length).toBe(0);
      expect(result.updates.length).toBe(4);

      expect(result.updates).toContainEqual({
        id: 5001,
        body: {
          date: "2024-01-22",
          minutes: 480,
          project_id: 1,
          description: "#Development",
        },
      });
      expect(result.updates).toContainEqual({
        id: 5002,
        body: {
          date: "2024-01-23",
          minutes: 480,
          project_id: 1,
          description: "#Development",
        },
      });
      expect(result.updates).toContainEqual({
        id: 5003,
        body: {
          date: "2024-01-24",
          minutes: 420,
          project_id: 1,
          description: "#Development",
        },
      });
      expect(result.updates).toContainEqual({
        id: 5006,
        body: {
          date: "2024-01-26",
          minutes: 480,
          project_id: 1,
          description: "#Development",
        },
      });
    });

    test("ignores unmapped entries", () => {
      const input: TimeTableEntry[] = [
        { category: "Developments", day: "maandag", minutes: 480 },
        { category: "Developmen", day: "maandag", minutes: 480 },
      ];
      const result = getNokoCallsForDelta(
        getTestWeekdays(),
        getTestTagToCategoryMappings(),
        [],
        input,
      );

      expect(result.creates.length).toBe(0);
      expect(result.idsToDelete.length).toBe(0);
      expect(result.updates.length).toBe(0);
    });

    test("ignores archived categories", () => {
      const weekDays = getTestWeekdays();
      const categoryMapping = getTestTagToCategoryMappings();
      categoryMapping[2].archived = true;
      categoryMapping[3].archived = true;
      const entries = getAverageWorkweekEntries();

      // The complete average workweek scenario
      const input = convertToTimeTableInput(weekDays, categoryMapping, entries);

      const result = getNokoCallsForDelta(weekDays, categoryMapping, [], input);

      expect(result.creates.length).toBe(4);
      expect(result.idsToDelete.length).toBe(0);
      expect(result.updates.length).toBe(0);

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

function getTestTagToCategoryMappings(): TagToCategoryMapping[] {
  return [
    {
      order: 1,
      archived: false,
      name: "Development",
      projectId: 1,
      nokoTags: ["#Development"],
    },
    {
      order: 2,
      archived: false,
      name: "Vacation",
      projectId: 3,
      nokoTags: ["#Vacation"],
    },
    {
      order: 3,
      archived: false,
      name: "National holiday",
      projectId: 2,
      nokoTags: ["#National-Holiday"],
    },
    {
      order: 4,
      archived: false,
      name: "Presentation",
      projectId: 1,
      nokoTags: ["#Presentation"],
    },
  ];
}
