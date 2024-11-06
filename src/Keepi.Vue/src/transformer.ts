import { DateRange } from "@/date";
import { toShortIsoDate } from "@/format";
import { INokoPostEntryRequest } from "@/requests";
import { INokoGetEntryResponse } from "@/responses";
import {
  Category,
  TimeTableEntry,
  TimeTableEntryCategory,
  loggableDays,
} from "@/types";

type DeltaInNokoApiCalls = {
  creates: INokoPostEntryRequest[];
  idsToDelete: number[];
};
type DayCategoryDelta = {
  create: INokoPostEntryRequest | null;
  idsToDelete: number[];
};

export function getNokoCallsForDelta(
  timeTableEntries: TimeTableEntry[],
  nokoEntries: INokoGetEntryResponse[],
): DeltaInNokoApiCalls {
  const categoryResultsPerDay: DayCategoryDelta[] = [];
  timeTableEntries.forEach((entry) => {
    if (entry.category.readonly) {
      console.debug(
        `Ignoring any changes made to the readonly category ${entry.category}.`,
      );
      return;
    }
    if (entry.category.projectId == null || entry.category.nokoTags == null) {
      console.debug(
        `Ignoring any changes made to the category ${entry.category} without a project ID and/or Noko tags.`,
      );
      return;
    }

    const entryDateAsIsoDate = toShortIsoDate(entry.date);
    const entryOriginalNokoEntries = nokoEntries.filter(
      (ne) =>
        ne.date === entryDateAsIsoDate && isForCategory(ne, entry.category),
    );

    const originalMinutes = entryOriginalNokoEntries.reduce<number>(
      (sum, current) => sum + current.minutes,
      0,
    );
    if (originalMinutes === entry.inputMinutes) {
      console.debug(
        `No changes in minutes for ${entry.category.name} on ${entryDateAsIsoDate}`,
      );
    } else {
      let createRequest: INokoPostEntryRequest | null = null;
      if (entry.inputMinutes > 0) {
        createRequest = {
          date: entryDateAsIsoDate,
          description: entry.category.nokoTags.join(" "),
          minutes: entry.inputMinutes,
          project_id: entry.category.projectId,
        };
      }
      categoryResultsPerDay.push({
        create: createRequest,
        idsToDelete: entryOriginalNokoEntries.map((ne) => ne.id),
      });
    }
  });

  const result: DeltaInNokoApiCalls = {
    creates: [],
    idsToDelete: [],
  };
  categoryResultsPerDay.forEach((dayResult) => {
    if (dayResult.create != null) {
      result.creates.push(dayResult.create);
    }
    if (dayResult.idsToDelete.length > 0) {
      dayResult.idsToDelete.forEach((id) => result.idsToDelete.push(id));
    }
  });
  return result;
}

export function mapToTimeTableEntries(
  dateRange: DateRange,
  categories: Category[],
  nokoEntries: INokoGetEntryResponse[],
): { entries: TimeTableEntry[]; unmappedEntries: TimeTableEntry[] } {
  if (dateRange.dates.length !== loggableDays.length) {
    throw Error(
      `Expected the date range to be 1 week, but it was ${dateRange.dates.length} day(s)`,
    );
  }
  for (let i = 0; i < dateRange.dates.length; ++i) {
    for (let j = i + 1; j < dateRange.dates.length; ++j) {
      if (dateRange.dates[i].getTime() >= dateRange.dates[j].getTime()) {
        throw Error(
          "Expected the date range dates to be sorted ascendingly and unique",
        );
      }
    }
  }

  let mappedNokoEntryIds: number[] = [];
  const timeTableEntries: TimeTableEntry[] = [];
  categories.forEach((category) => {
    dateRange.dates.forEach((date, dateIndex) => {
      const entryIsoDate = toShortIsoDate(date);

      const matchingNokoEntries = nokoEntries.filter(
        (ne) => ne.date === entryIsoDate && isForCategory(ne, category),
      );
      mappedNokoEntryIds = [
        ...mappedNokoEntryIds,
        ...matchingNokoEntries.map((ne) => ne.id),
      ];

      const initialMinutes = matchingNokoEntries.reduce<number>(
        (acc, current) => acc + current.minutes,
        0,
      );
      timeTableEntries.push({
        date: date,
        category: category,
        dayName: loggableDays[dateIndex],
        initialMinutes: initialMinutes,
        inputMinutes: initialMinutes,
      });
    });
  });

  const unmappedNokoEntries = nokoEntries.filter(
    (ne) => !mappedNokoEntryIds.includes(ne.id),
  );
  if (unmappedNokoEntries.length === 0) {
    return {
      entries: timeTableEntries,
      unmappedEntries: [],
    };
  }

  return {
    entries: timeTableEntries,
    unmappedEntries: dateRange.dates.map((date, dateIndex) => {
      const entryIsoDate = toShortIsoDate(date);
      const totalMinutes = unmappedNokoEntries
        .filter((ne) => ne.date === entryIsoDate)
        .reduce<number>((acc, entry) => acc + entry.minutes, 0);
      return {
        date: date,
        dayName: loggableDays[dateIndex],
        category: {
          name: "Unmapped",
          order: Number.MAX_SAFE_INTEGER,
          readonly: true,
        },
        initialMinutes: totalMinutes,
        inputMinutes: totalMinutes,
      };
    }),
  };
}

function isForCategory(
  nokoEntry: INokoGetEntryResponse,
  category: Category | TimeTableEntryCategory,
): boolean {
  return (
    category.projectId != null &&
    category.nokoTags != null &&
    nokoEntry.project.id === category.projectId &&
    areTagsEqual(nokoEntry, category)
  );
}

function areTagsEqual(
  nokoEntry: INokoGetEntryResponse,
  category: Category | TimeTableEntryCategory,
): boolean {
  if (
    category.nokoTags == null ||
    nokoEntry.tags.length !== category.nokoTags.length
  ) {
    return false;
  }

  for (let i = 0; i < nokoEntry.tags.length; ++i) {
    if (!category.nokoTags.includes(nokoEntry.tags[i].formatted_name)) {
      return false;
    }
  }

  return true;
}
