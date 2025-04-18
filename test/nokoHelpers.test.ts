import { mock } from "vitest-mock-extended";
import { describe, expect, test } from "vitest";
import { INokoClient } from "@/noko-client";
import {
  MappedNokoEntry,
  MappedNokoEntryDateMinutePair,
  mapToMinutesPerCategoryForDates,
  saveChangesToNoko,
} from "@/nokoHelpers";
import { INokoGetEntryResponse } from "@/responses";
import { toShortIsoDate } from "@/format";
import { Category } from "@/types";

describe("mapToMinutesPerCategoryForDates", () => {
  test("average workweek scenario should be mapped correctly", () => {
    const result = mapToMinutesPerCategoryForDates(
      getTestWeekdays(),
      getTestCategories(),
      getAverageWorkweekEntries(),
    );

    expect(result.entries.length).toBe(4);
    expect(result.unmappedEntries.length).toBe(7);

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

    expectToHaveUnmappedTimeTableEntriesForProjectWeekDays(
      result.unmappedEntries,
      [0, 0, 0, 0, 0, 0, 0],
    );
  });

  test("average workweek scenario with unmapped entries should be mapped correctly", () => {
    // Remove the categories National holiday and Presentation
    const testCategories = getTestCategories().slice(0, 2);

    const result = mapToMinutesPerCategoryForDates(
      getTestWeekdays(),
      testCategories,
      getAverageWorkweekEntries(),
    );

    //                  | Monday | Tuesday | Wednesday | Thursday | Friday
    // Development      | 8h     | 8h      | 7h        | -        | 8h
    // Presentation     | -      | -       | 1h        | -        | -
    // National holiday | -      | -       | -         | 8h       | -
    expect(result.entries.length).toBe(2);
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

    expectToHaveUnmappedTimeTableEntriesForProjectWeekDays(
      result.unmappedEntries,
      [0, 0, 60, 480, 0, 0, 0],
    );
  });

  test("partial average workweek scenario should be mapped correctly", () => {
    const result = mapToMinutesPerCategoryForDates(
      getTestWeekdays(),
      getTestCategories(),
      // Only include monday until wednesday
      getAverageWorkweekEntries().filter((e) => e.date < "2024-01-25"),
    );

    expect(result.entries.length).toBe(4);
    expect(result.unmappedEntries.length).toBe(7);

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

    expectToHaveUnmappedTimeTableEntriesForProjectWeekDays(
      result.unmappedEntries,
      [0, 0, 0, 0, 0, 0, 0],
    );
  });

  test("vacation scenario should be mapped correctly", () => {
    const result = mapToMinutesPerCategoryForDates(
      getTestWeekdays(),
      getTestCategories(),
      getVacationWeekEntries(),
    );

    expect(result.entries.length).toBe(4);
    expect(result.unmappedEntries.length).toBe(7);

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

    expectToHaveUnmappedTimeTableEntriesForProjectWeekDays(
      result.unmappedEntries,
      [0, 0, 0, 0, 0, 0, 0],
    );
  });

  test("should map unknown project ID to unmapped entries", () => {
    const result = mapToMinutesPerCategoryForDates(
      getTestWeekdays(),
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
      ],
    );

    expect(result.entries.length).toBe(4);
    expect(result.unmappedEntries.length).toBe(7);

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

    expectToHaveUnmappedTimeTableEntriesForProjectWeekDays(
      result.unmappedEntries,
      [480, 0, 0, 0, 0, 0, 0],
    );
  });

  test("should map unknown tag to unmapped entries", () => {
    const result = mapToMinutesPerCategoryForDates(
      getTestWeekdays(),
      getTestCategories(),
      [
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
      ],
    );

    expect(result.entries.length).toBe(4);
    expect(result.unmappedEntries.length).toBe(7);

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

    expectToHaveUnmappedTimeTableEntriesForProjectWeekDays(
      result.unmappedEntries,
      [480, 0, 0, 0, 0, 0, 0],
    );
  });

  test("should map unknown tag combination to unmapped entries", () => {
    const result = mapToMinutesPerCategoryForDates(
      getTestWeekdays(),
      getTestCategories(),
      [
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

    expect(result.entries.length).toBe(4);
    expect(result.unmappedEntries.length).toBe(7);

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

    expectToHaveUnmappedTimeTableEntriesForProjectWeekDays(
      result.unmappedEntries,
      [480, 0, 0, 0, 0, 0, 0],
    );
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

  function expectToHaveTimeTableEntriesForProjectWeekDays(
    categoryName: string,
    timeTableEntries: MappedNokoEntry[],
    minutesPerWeekDay: number[],
  ) {
    const categoryEntries = timeTableEntries.find(
      (r) => r.category.name === categoryName,
    );

    expect(categoryEntries).not.toBe(null);

    expect(categoryEntries?.minutesPerDate.length).toBe(7);

    for (let i = 0; i < 7; ++i) {
      const match = categoryEntries?.minutesPerDate[i];
      if (match == null) {
        throw Error(
          `The mapped entries dit not contain an entry for category ${categoryName}`,
        );
      }

      expect(match.minutes).toBe(minutesPerWeekDay[i]);
    }
  }

  function expectToHaveUnmappedTimeTableEntriesForProjectWeekDays(
    timeTableEntries: MappedNokoEntryDateMinutePair[],
    minutesPerWeekDay: number[],
  ) {
    expect(timeTableEntries.length).toBe(7);

    for (let i = 0; i < 7; ++i) {
      expect(timeTableEntries[i].minutes).toBe(minutesPerWeekDay[i]);
    }
  }
});

describe("saveChangesToNoko", () => {
  test("should update matching noko entry", async () => {
    const nokoClientMock = mock<INokoClient>();

    await saveChangesToNoko({
      nokoClient: nokoClientMock,
      categories: [
        {
          name: "Project 1",
          nokoTags: ["#tag0", "#tag1"],
          order: 0,
          projectId: 50,
          readonly: false,
        },
      ],
      desiredEntries: [
        {
          categoryName: "Project 1",
          minutesPerDate: [
            {
              minutes: 480,
              date: new Date("2025-01-22T00:00:00"),
            },
          ],
        },
      ],
      originalEntries: [getTestNokoEntry()],
    });

    expect(nokoClientMock.updateEntry).toHaveBeenCalledWith(42, {
      date: "2025-01-22",
      minutes: 480,
      description: "#tag0 #tag1",
      project_id: 50,
    });
  });

  test("should preserve original description when updating existing noko entry", async () => {
    const nokoClientMock = mock<INokoClient>();

    const originalNokoEntry = getTestNokoEntry();
    originalNokoEntry.description = "alternative description";

    await saveChangesToNoko({
      nokoClient: nokoClientMock,
      categories: [
        {
          name: "Project 1",
          nokoTags: ["#tag0", "#tag1"],
          order: 0,
          projectId: 50,
          readonly: false,
        },
      ],
      desiredEntries: [
        {
          categoryName: "Project 1",
          minutesPerDate: [
            {
              minutes: 480,
              date: new Date("2025-01-22T00:00:00"),
            },
          ],
        },
      ],
      originalEntries: [originalNokoEntry],
    });

    expect(nokoClientMock.updateEntry).toHaveBeenCalledWith(42, {
      date: "2025-01-22",
      minutes: 480,
      description: "alternative description",
      project_id: 50,
    });
  });

  test("should delete not matching project noko entry", async () => {
    const nokoClientMock = mock<INokoClient>();

    await saveChangesToNoko({
      nokoClient: nokoClientMock,
      categories: [
        {
          name: "Project 1",
          nokoTags: ["#tag0", "#tag1"],
          order: 0,
          projectId: 51, // altered
          readonly: false,
        },
      ],
      desiredEntries: [
        {
          categoryName: "Project 1",
          minutesPerDate: [
            {
              minutes: 480,
              date: new Date("2025-01-22T00:00:00"),
            },
          ],
        },
      ],
      originalEntries: [getTestNokoEntry()],
    });

    expect(nokoClientMock.deleteEntry).toHaveBeenCalledWith(42);
  });

  test("should delete not matching date noko entry", async () => {
    const nokoClientMock = mock<INokoClient>();

    await saveChangesToNoko({
      nokoClient: nokoClientMock,
      categories: [
        {
          name: "Project 1",
          nokoTags: ["#tag0", "#tag1"],
          order: 0,
          projectId: 50,
          readonly: false,
        },
      ],
      desiredEntries: [
        {
          categoryName: "Project 1",
          minutesPerDate: [
            {
              minutes: 480,
              date: new Date("2025-01-23T00:00:00"), // altered
            },
          ],
        },
      ],
      originalEntries: [getTestNokoEntry()],
    });

    expect(nokoClientMock.deleteEntry).toHaveBeenCalledWith(42);
  });

  test("should delete not matching tags noko entry", async () => {
    const nokoClientMock = mock<INokoClient>();

    await saveChangesToNoko({
      nokoClient: nokoClientMock,
      categories: [
        {
          name: "Project 1",
          nokoTags: ["#tag1", "#tag2"],
          order: 0,
          projectId: 50,
          readonly: false,
        },
      ],
      desiredEntries: [
        {
          categoryName: "Project 1",
          minutesPerDate: [
            {
              minutes: 480,
              date: new Date("2025-01-22T00:00:00"),
            },
          ],
        },
      ],
      originalEntries: [getTestNokoEntry()],
    });

    expect(nokoClientMock.deleteEntry).toHaveBeenCalledWith(42);
  });

  test("should create new entry", async () => {
    const nokoClientMock = mock<INokoClient>();

    await saveChangesToNoko({
      nokoClient: nokoClientMock,
      categories: [
        {
          name: "Project 1",
          nokoTags: ["#tag0", "#tag1"],
          order: 0,
          projectId: 50,
          readonly: false,
        },
      ],
      desiredEntries: [
        {
          categoryName: "Project 1",
          minutesPerDate: [
            {
              minutes: 480,
              date: new Date("2025-01-22T00:00:00"),
            },
          ],
        },
      ],
      originalEntries: [],
    });

    expect(nokoClientMock.createEntry).toHaveBeenCalledWith({
      date: "2025-01-22",
      minutes: 480,
      description: "#tag0 #tag1",
      project_id: 50,
    });
  });

  test("should not create new 0 minute entry", async () => {
    const nokoClientMock = mock<INokoClient>();

    await saveChangesToNoko({
      nokoClient: nokoClientMock,
      categories: [
        {
          name: "Project 1",
          nokoTags: ["#tag0", "#tag1"],
          order: 0,
          projectId: 50,
          readonly: false,
        },
      ],
      desiredEntries: [
        {
          categoryName: "Project 1",
          minutesPerDate: [
            {
              minutes: 0,
              date: new Date("2025-01-22T00:00:00"),
            },
          ],
        },
      ],
      originalEntries: [],
    });

    expect(nokoClientMock.createEntry).toHaveBeenCalledTimes(0);
  });

  test("should handle complex scenario", async () => {
    const nokoClientMock = mock<INokoClient>();

    await saveChangesToNoko({
      nokoClient: nokoClientMock,
      categories: [
        {
          name: "Project 1",
          nokoTags: ["#tag0", "#tag1"],
          order: 0,
          projectId: 50,
          readonly: false,
        },
        {
          name: "Project 2",
          nokoTags: ["#tag2"],
          order: 1,
          projectId: 51,
          readonly: false,
        },
        {
          name: "Project 3",
          nokoTags: ["#tag0", "#tag2"],
          order: 2,
          projectId: 52,
          readonly: false,
        },
      ],
      desiredEntries: [
        // Should be created
        {
          categoryName: "Project 1",
          minutesPerDate: [
            {
              minutes: 1,
              date: new Date("2025-01-22T00:00:00"),
            },
          ],
        },
        // Should be updated
        {
          categoryName: "Project 2",
          minutesPerDate: [
            {
              minutes: 2,
              date: new Date("2025-01-22T00:00:00"),
            },
          ],
        },
        // Should be updated
        {
          categoryName: "Project 3",
          minutesPerDate: [
            {
              minutes: 3,
              date: new Date("2025-01-23T00:00:00"),
            },
          ],
        },
        // Should be deleted because it is set to 0 minutes
        {
          categoryName: "Project 1",
          minutesPerDate: [
            {
              minutes: 0,
              date: new Date("2025-01-23T00:00:00"),
            },
          ],
        },
        // Should be ignored as no existing entry exists for it
        {
          categoryName: "Project 2",
          minutesPerDate: [
            {
              minutes: 0,
              date: new Date("2025-01-23T00:00:00"),
            },
          ],
        },
      ],
      originalEntries: [
        {
          id: 43,
          date: "2025-01-22",
          project: {
            id: 51,
          },
          minutes: 480,
          tags: [
            {
              id: 102,
              formatted_name: "#tag2",
            },
          ],
          user: {
            id: 99,
          },
          description: "#tag2",
        },
        {
          id: 44,
          date: "2025-01-23",
          project: {
            id: 52,
          },
          minutes: 360,
          tags: [
            {
              id: 100,
              formatted_name: "#tag0",
            },
            {
              id: 102,
              formatted_name: "#tag2",
            },
          ],
          user: {
            id: 99,
          },
          description: "#tag0 #tag2",
        },
        {
          id: 45,
          date: "2025-01-23",
          project: {
            id: 50,
          },
          minutes: 360,
          tags: [
            {
              id: 100,
              formatted_name: "#tag0",
            },
            {
              id: 101,
              formatted_name: "#tag1",
            },
          ],
          user: {
            id: 99,
          },
          description: "#tag0 #tag1",
        },
      ],
    });

    expect(nokoClientMock.createEntry).toHaveBeenCalledWith({
      date: "2025-01-22",
      minutes: 1,
      description: "#tag0 #tag1",
      project_id: 50,
    });
    expect(nokoClientMock.updateEntry).toHaveBeenCalledWith(43, {
      date: "2025-01-22",
      minutes: 2,
      description: "#tag2",
      project_id: 51,
    });
    expect(nokoClientMock.updateEntry).toHaveBeenCalledWith(44, {
      date: "2025-01-23",
      minutes: 3,
      description: "#tag0 #tag2",
      project_id: 52,
    });
    expect(nokoClientMock.deleteEntry).toHaveBeenCalledWith(45);

    expect(nokoClientMock.createEntry).toBeCalledTimes(1);
    expect(nokoClientMock.updateEntry).toBeCalledTimes(2);
    expect(nokoClientMock.deleteEntry).toBeCalledTimes(1);
  });
});

function getTestNokoEntry(): INokoGetEntryResponse {
  return {
    id: 42,
    date: "2025-01-22",
    project: {
      id: 50,
    },
    minutes: 360,
    tags: [
      {
        id: 100,
        formatted_name: "#tag0",
      },
      {
        id: 101,
        formatted_name: "#tag1",
      },
    ],
    user: {
      id: 99,
    },
    description: "#tag0 #tag1",
  };
}
