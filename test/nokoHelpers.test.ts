import { mock } from "vitest-mock-extended";
import { describe, expect, test } from "vitest";
import { INokoClient } from "@/noko-client";
import { saveChangesToNoko } from "@/nokoHelpers";
import { INokoGetEntryResponse } from "@/responses";

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
