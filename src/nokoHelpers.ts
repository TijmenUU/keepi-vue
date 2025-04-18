import { toShortIsoDate } from "@/format";
import type { INokoClient } from "@/noko-client";
import type { INokoGetEntryResponse } from "@/responses";
import type { Category } from "@/types";

export async function saveChangesToNoko(options: {
  nokoClient: INokoClient;
  originalEntries: INokoGetEntryResponse[];
  desiredEntries: {
    categoryName: string;
    minutesPerDate: { minutes: number; date: Date }[];
  }[];
  categories: Category[];
}): Promise<void> {
  const toUpdate = options.desiredEntries
    .map((de) => {
      const category = options.categories.find(
        (c) => c.name === de.categoryName,
      );
      if (category == null) {
        throw new Error(
          `Category ${de.categoryName} does not exist in configuration`,
        );
      }

      return de.minutesPerDate.map((mpd) => ({
        category,
        date: toShortIsoDate(mpd.date),
        minutes: mpd.minutes,
      }));
    })
    .reduce((previous, current) => {
      current.forEach((c) => previous.push(c));
      return previous;
    }, []);

  for (let i = 0; i < options.originalEntries.length; ++i) {
    const originalEntry = options.originalEntries[i];
    const toUpdateIndex = toUpdate.findIndex(
      (u) =>
        u.date === originalEntry.date &&
        isForCategory(originalEntry, u.category),
    );

    if (toUpdateIndex < 0) {
      await options.nokoClient.deleteEntry(originalEntry.id);
      continue;
    }

    const newMinutes = toUpdate[toUpdateIndex].minutes;
    if (newMinutes !== originalEntry.minutes) {
      if (newMinutes > 0) {
        await options.nokoClient.updateEntry(originalEntry.id, {
          date: originalEntry.date,
          minutes: toUpdate[toUpdateIndex].minutes,
          description: originalEntry.description,
          project_id: originalEntry.project.id,
        });
      } else {
        await options.nokoClient.deleteEntry(originalEntry.id);
      }
    }

    toUpdate.splice(toUpdateIndex, 1);
  }

  for (let i = 0; i < toUpdate.length; ++i) {
    const toCreate = toUpdate[i];

    if (toCreate.minutes < 1) {
      continue;
    }

    await options.nokoClient.createEntry({
      date: toCreate.date,
      description: toCreate.category.nokoTags.join(" "),
      minutes: toCreate.minutes,
      project_id: toCreate.category.projectId,
    });
  }
}

function isForCategory(
  nokoEntry: INokoGetEntryResponse,
  category: Category,
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
  category: Category,
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
