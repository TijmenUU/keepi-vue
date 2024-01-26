import { TimeTableEntry } from "@/components/TimeTable.vue";
import { toShortIsoDate } from "@/format";
import { INokoPostEntryRequest, INokoPutEntryRequest } from "@/requests";
import { INokoGetEntryResponse } from "@/responses";
import { TagToCategoryMapping, loggableDays } from "@/types";

type DayAndTagMapping = {
  date: string;
  day: string;
  nokoTags: string[];
  category: string;
};

type NokoTimeTableMapping = {
  date: string;
  day: string;
  nokoTags: string[];
  category: string;
  entries: INokoGetEntryResponse[];
  minutes: number;
};

type TimeTableDelta = {
  creates: INokoPostEntryRequest[];
  updates: { id: number; body: INokoPutEntryRequest }[];
  idsToDelete: number[];
};
type DayCategoryDelta = {
  create: INokoPostEntryRequest | null;
  update: { id: number; body: INokoPutEntryRequest } | null;
  idsToDelete: number[];
};

export function convertToTimeTableInput(
  weekDays: Date[],
  categoryMapping: TagToCategoryMapping[],
  entries: INokoGetEntryResponse[]
): TimeTableEntry[] {
  return getNokoToTimeTableMapping(weekDays, categoryMapping, entries).map(
    (m) => ({ category: m.category, day: m.day, minutes: m.minutes })
  );
}

export function getNokoCallsForDelta(
  weekDays: Date[],
  categoryMapping: TagToCategoryMapping[],
  nokoEntries: INokoGetEntryResponse[],
  timeTableEntries: TimeTableEntry[],
  projectId: number
): TimeTableDelta {
  const preUserInputMapping = getNokoToTimeTableMapping(
    weekDays,
    categoryMapping,
    nokoEntries
  );

  const dayCategoryResults: DayCategoryDelta[] = [];
  for (let i = 0; i < preUserInputMapping.length; ++i) {
    const original = preUserInputMapping[i];
    const userInput = timeTableEntries.find(
      (t) => t.category === original.category && t.day === original.day
    );
    if (userInput) {
      dayCategoryResults.push(getDayDelta(original, userInput, projectId));
    } else {
      console.debug(
        `Time table entry for project ${original.category} on ${original.day} seems to be missing?`
      );
    }
  }

  const result: TimeTableDelta = {
    creates: [],
    updates: [],
    idsToDelete: [],
  };
  dayCategoryResults.forEach((dayResult) => {
    if (dayResult.create != null) {
      result.creates.push(dayResult.create);
    }
    if (dayResult.update != null) {
      result.updates.push(dayResult.update);
    }
    if (dayResult.idsToDelete.length > 0) {
      dayResult.idsToDelete.forEach((id) => result.idsToDelete.push(id));
    }
  });
  return result;
}

function getDayDelta(
  original: NokoTimeTableMapping,
  userInput: TimeTableEntry,
  projectId: number
): DayCategoryDelta {
  // No changes
  if (original.minutes === userInput.minutes) {
    return { create: null, update: null, idsToDelete: [] };
  }

  // User removed all time
  if (userInput.minutes <= 0) {
    return {
      create: null,
      update: null,
      idsToDelete: original.entries.map((e) => e.id),
    };
  }

  const description = original.nokoTags.join(" ");
  // User created a first entry
  if (original.entries.length === 0) {
    return {
      create: {
        date: original.date,
        minutes: userInput.minutes,
        project_id: projectId,
        description,
      },
      update: null,
      idsToDelete: [],
    };
  }

  // TODO Maybe make this less destructive? It deletes all but one entry for the same tag combination
  return {
    create: null,
    update: {
      id: original.entries[0].id,
      body: {
        date: original.date,
        minutes: userInput.minutes,
        project_id: projectId,
        description,
      },
    },
    idsToDelete: original.entries.slice(1).map((e) => e.id),
  };
}

function getNokoToTimeTableMapping(
  weekDays: Date[],
  categoryMapping: TagToCategoryMapping[],
  entries: INokoGetEntryResponse[]
): NokoTimeTableMapping[] {
  const dayAndTagMapping = getDayAndTagMapping(weekDays, categoryMapping);
  return dayAndTagMapping.map((dtm) => {
    const filteredEntries = entries.filter(
      (e) =>
        dtm.category &&
        e.date == dtm.date &&
        dtm.nokoTags.length == e.tags.length &&
        dtm.nokoTags.every((mt) =>
          e.tags.some((et) => et.formatted_name === mt)
        )
    );

    return {
      date: dtm.date,
      day: dtm.day,
      nokoTags: dtm.nokoTags,
      category: dtm.category,
      entries: filteredEntries,
      minutes: filteredEntries.reduce<number>(
        (ec, entry) => ec + entry.minutes,
        0
      ),
    };
  });
}

function getDayAndTagMapping(
  weekDays: Date[],
  categoryMapping: TagToCategoryMapping[]
): DayAndTagMapping[] {
  if (weekDays.length !== loggableDays.length) {
    throw new Error(
      "The week days should match the loggable days as they are assumed to be a 1:1 mapping"
    );
  }

  const dayToDateMapping = weekDays.map((d, index) => ({
    date: toShortIsoDate(d),
    day: loggableDays[index],
  }));

  const results: DayAndTagMapping[] = [];
  for (let i = 0; i < dayToDateMapping.length; ++i) {
    for (let j = 0; j < categoryMapping.length; ++j) {
      results.push({
        day: dayToDateMapping[i].day,
        date: dayToDateMapping[i].date,
        nokoTags: categoryMapping[j].nokoTags,
        category: categoryMapping[j].name,
      });
    }
  }

  return results;
}
