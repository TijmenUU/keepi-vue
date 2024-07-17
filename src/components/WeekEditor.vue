<script setup lang="ts">
import KeepiButton from "@/components/KeepiButton.vue";
import KeepiInput from "@/components/KeepiInput.vue";
import { DateRange } from "@/date";
import { toHoursMinutesNotation, tryParseTimeNotation } from "@/format";
import { INokoGetEntryResponse } from "@/responses";
import { useApplicationStore } from "@/store/application-store";
import { convertToTimeTableInput, getNokoCallsForDelta } from "@/transformer";
import { LoggableDay, loggableDays } from "@/types";
import { ref, computed, reactive } from "vue";

type TimeTableEntry = {
  category: string;
  day: LoggableDay;
  minutes: number;
};

const isSaving = ref(false);

const props = defineProps<{
  dateRange: DateRange;
  entries: INokoGetEntryResponse[];
  disabled: boolean;
}>();

const emits = defineEmits<{
  (e: "reload"): void;
}>();

const applicationStore = useApplicationStore();
const nokoClient = applicationStore.getNokoClient();

const initialValues: TimeTableEntry[] = convertToTimeTableInput(
  props.dateRange.dates,
  applicationStore.categories,
  props.entries,
);

const createKey = (category: string, day: string) => `${category}${day}`;

const generateValues = (
  initialValues: TimeTableEntry[],
): Record<string, string> => {
  const result: TimeTableEntry[] = [];
  applicationStore.categories.forEach((category) => {
    loggableDays.forEach((day) => {
      result.push({
        category: category.name,
        day,
        minutes:
          initialValues.find(
            (e) => e.category === category.name && e.day === day,
          )?.minutes ?? 0,
      });
    });
  });

  return result.reduce<Record<string, string>>(
    (acc, entry) => ({
      ...acc,
      [createKey(entry.category, entry.day)]: toHoursMinutesNotation(
        entry.minutes,
      ),
    }),
    {},
  );
};

const values: Record<string, string> = reactive(generateValues(initialValues));
const validationMode = ref<"optional-time" | undefined>(undefined);

const daySummaries = computed<Record<string, string>>(() => {
  const aggregates = loggableDays.reduce<Record<string, number>>(
    (acc, day) => ({
      ...acc,
      [day]: 0,
    }),
    {},
  );

  Object.keys(values).forEach((key) => {
    const value = tryParseTimeNotation(values[key]);
    if (value != null) {
      const parts = splitKey(key);
      aggregates[parts[1]] += value;
    }
  });

  return loggableDays.reduce<Record<string, string>>(
    (acc, day) => ({
      ...acc,
      [day]: toHoursMinutesNotation(aggregates[day]),
    }),
    {},
  );
});

const projectSummaries = computed<Record<string, string>>(() => {
  const aggregates = applicationStore.categories.reduce<Record<string, number>>(
    (acc, entry) => ({
      ...acc,
      [entry.name]: 0,
    }),
    {},
  );

  Object.keys(values).forEach((key) => {
    const value = tryParseTimeNotation(values[key]);
    if (value != null) {
      const parts = splitKey(key);
      aggregates[parts[0]] += value;
    }
  });

  return applicationStore.categories.reduce<Record<string, string>>(
    (acc, entry) => ({
      ...acc,
      [entry.name]: toHoursMinutesNotation(aggregates[entry.name]),
    }),
    {},
  );
});

const projectTotal = computed<string>(() => {
  const aggregates = applicationStore.categories.reduce<Record<string, number>>(
    (acc, entry) => ({
      ...acc,
      [entry.name]: 0,
    }),
    {},
  );

  Object.keys(values).forEach((key) => {
    const value = tryParseTimeNotation(values[key]);
    if (value != null) {
      const parts = splitKey(key);
      aggregates[parts[0]] += value;
    }
  });

  return toHoursMinutesNotation(
    applicationStore.categories.reduce<number>(
      (acc, entry) =>
        acc + (tryParseTimeNotation(projectSummaries.value[entry.name]) ?? 0),
      0,
    ),
  );
});

const today = computed<LoggableDay | null>(() => {
  const today = new Date();
  const dateIndex = props.dateRange.dates.findIndex(
    (d) =>
      d.getUTCFullYear() === today.getUTCFullYear() &&
      d.getUTCMonth() === today.getUTCMonth() &&
      d.getUTCDate() === today.getUTCDate(),
  );
  if (dateIndex < 0) {
    return null;
  }
  return loggableDays[dateIndex];
});

const splitKey = (key: string): [string, LoggableDay] => {
  const categoryPart = applicationStore.categories.find((c) =>
    key.startsWith(c.name),
  );
  if (categoryPart == null) {
    throw new Error(`Invalid key ${key}: unknown category`);
  }

  const dayPart = key.substring(categoryPart.name.length);
  if (!loggableDays.includes(dayPart)) {
    throw new Error(`Invalid key ${key}: unknown day ${dayPart}`);
  }

  return [categoryPart.name, dayPart];
};

const onKey = (direction: "up" | "down" | "left" | "right") => {
  if (!(document.activeElement instanceof HTMLInputElement)) {
    return;
  }

  const currentInputName = document.activeElement.name;
  if (!currentInputName) {
    return;
  }

  const nameParts = splitKey(currentInputName);
  let projectIndex = -1;
  let dayIndex = -1;
  switch (direction) {
    case "up":
      projectIndex = applicationStore.categories.findIndex(
        (c) => c.name === nameParts[0],
      );
      if (projectIndex > 0) {
        tryFocusOn(
          createKey(
            applicationStore.categories[projectIndex - 1].name,
            nameParts[1],
          ),
        );
      } else {
        tryFocusOn(
          createKey(
            applicationStore.categories[applicationStore.categories.length - 1]
              .name,
            nameParts[1],
          ),
        );
      }
      break;

    case "down":
      projectIndex = applicationStore.categories.findIndex(
        (c) => c.name === nameParts[0],
      );
      if (projectIndex === applicationStore.categories.length - 1) {
        tryFocusOn(
          createKey(applicationStore.categories[0].name, nameParts[1]),
        );
      } else {
        tryFocusOn(
          createKey(
            applicationStore.categories[projectIndex + 1].name,
            nameParts[1],
          ),
        );
      }
      break;

    case "left":
      dayIndex = loggableDays.findIndex((d) => d === nameParts[1]);
      if (dayIndex > 0) {
        tryFocusOn(createKey(nameParts[0], loggableDays[dayIndex - 1]));
      } else {
        tryFocusOn(
          createKey(nameParts[0], loggableDays[loggableDays.length - 1]),
        );
      }
      break;

    case "right":
      dayIndex = loggableDays.findIndex((d) => d === nameParts[1]);
      if (dayIndex === loggableDays.length - 1) {
        tryFocusOn(createKey(nameParts[0], loggableDays[0]));
      } else {
        tryFocusOn(createKey(nameParts[0], loggableDays[dayIndex + 1]));
      }
      break;
  }
};

function tryFocusOn(name: string) {
  const hits = document.getElementsByName(name);
  if (hits.length > 0) {
    hits[0].focus();
  }
}

const onPasteCopiedTimeTableValues = () => {
  if (applicationStore.copiedTimeTableValues == null) {
    return;
  }

  Object.keys(applicationStore.copiedTimeTableValues).forEach((key) => {
    if (values[key] != null) {
      values[key] = applicationStore.copiedTimeTableValues![key];
    } else {
      console.debug(
        `Tried to copy ${key} value ${applicationStore.copiedTimeTableValues![key]} but it does not exist in the time table!`,
      );
    }
  });
};

const onSubmit = () => {
  const entries = Object.entries(values);

  const results: TimeTableEntry[] = [];
  for (const [key, value] of entries) {
    const [category, day] = splitKey(key);
    const minutes = !!value ? tryParseTimeNotation(value) : 0;
    if (minutes == null) {
      validationMode.value = "optional-time";
      throw new Error(`${value} cannot be parsed as 00u00m`);
    }

    results.push({
      category,
      day,
      minutes,
    });
  }

  onSave(results);
};

const onSave = async (userInput: TimeTableEntry[]): Promise<void> => {
  if (isSaving.value) {
    return;
  }

  isSaving.value = true;
  let madeChanges = false;
  try {
    const delta = getNokoCallsForDelta(
      props.dateRange.dates,
      applicationStore.categories,
      props.entries,
      userInput,
    );
    for (let i = 0; i < delta.creates.length; ++i) {
      console.debug("Creating Noko entry", delta.creates[i]);
      await nokoClient.createEntry(delta.creates[i]);
      madeChanges = true;
    }
    for (let i = 0; i < delta.updates.length; ++i) {
      console.debug("Updating Noko entry", delta.updates[i]);
      await nokoClient.updateEntry(delta.updates[i].id, delta.updates[i].body);
      madeChanges = true;
    }
    for (let i = 0; i < delta.idsToDelete.length; ++i) {
      console.debug("Deleting Noko entry", delta.idsToDelete[i]);
      await nokoClient.deleteEntry(delta.idsToDelete[i]);
      madeChanges = true;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isSaving.value = false;
  }

  if (madeChanges) {
    emits("reload");
  }
};
</script>

<template>
  <div
    class="relative transition duration-200"
    :class="{ 'blur-sm': isSaving || props.disabled }"
  >
    <div
      class="absolute left-0 top-0 z-10 h-full w-full cursor-not-allowed"
      v-if="isSaving || props.disabled"
    ></div>

    <div>
      <div>
        <div class="flex justify-center" style="max-width: 100vw">
          <table class="table-auto">
            <tr>
              <th></th>
              <th v-for="day in loggableDays" :key="day">
                <span>{{ day.substring(0, 2) }}</span>
                <span
                  class="text-blue-500"
                  :class="{ invisible: day !== today }"
                  :title="`Het is vandaag ${day}`"
                  >*</span
                >
              </th>
              <th></th>
            </tr>

            <tr
              v-for="category in applicationStore.categories"
              :key="category.name"
              v-show="
                projectSummaries[category.name] != '' || !category.archived
              "
            >
              <td>
                <span class="pr-1">{{ category.name }}</span>
              </td>
              <td
                v-for="day in loggableDays"
                :key="createKey(category.name, day)"
              >
                <KeepiInput
                  :name="createKey(category.name, day)"
                  v-model="values[createKey(category.name, day)]"
                  :readonly="category.archived"
                  :tabindex="category.archived ? -1 : 0"
                  :input-validation="validationMode"
                  style="width: 65px"
                  @keyup.up="onKey('up')"
                  @keyup.down="onKey('down')"
                  @keyup.left="onKey('left')"
                  @keyup.right="onKey('right')"
                />
              </td>
              <td class="text-center text-gray-500">
                <div style="min-width: 65px">
                  <span class="pl-1">
                    {{ projectSummaries[category.name] }}
                  </span>
                </div>
              </td>
            </tr>

            <tr>
              <td></td>
              <td v-for="day in loggableDays" class="text-center text-gray-500">
                <div class="min-h-6">
                  <span>
                    {{ daySummaries[day] }}
                  </span>
                </div>
              </td>
              <td class="text-center text-gray-500">
                <div class="min-h-6" style="min-width: 65px">
                  <span>
                    {{ projectTotal }}
                  </span>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <div class="grid w-full grid-cols-3 space-x-2 p-3">
          <div></div>

          <div class="flex justify-center space-x-3">
            <button
              title="Kopieer week"
              class="mr-1"
              @click="applicationStore.copiedTimeTableValues = { ...values }"
            >
              <svg
                data-slot="icon"
                aria-hidden="true"
                fill="none"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>

            <button
              title="Plak week"
              :disabled="!applicationStore.copiedTimeTableValues"
              :class="{
                'cursor-not-allowed text-gray-600':
                  !applicationStore.copiedTimeTableValues,
              }"
              @click="onPasteCopiedTimeTableValues"
            >
              <svg
                data-slot="icon"
                aria-hidden="true"
                fill="none"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>
          </div>

          <div class="flex justify-end">
            <KeepiButton class="self-end" @click="onSubmit" variant="green">
              Opslaan
            </KeepiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
