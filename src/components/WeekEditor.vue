<script setup lang="ts">
import KeepiButton from "@/components/KeepiButton.vue";
import KeepiInput from "@/components/KeepiInput.vue";
import { DateRange } from "@/date";
import { toHoursMinutesNotation, tryParseTimeNotation, toShortDutchDate } from "@/format";
import { INokoGetEntryResponse } from "@/responses";
import { useApplicationStore } from "@/store/application-store";
import { mapToTimeTableEntries, getNokoCallsForDelta } from "@/transformer";
import { LoggableDay, loggableDays, TimeTableEntry } from "@/types";
import { ref, computed } from "vue";

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

const mappedEntries = mapToTimeTableEntries(
  props.dateRange,
  applicationStore.categories,
  props.entries,
);
const timeTableEntries = ref<TimeTableEntry[]>(mappedEntries.entries);
const inputValues = ref<string[]>(
  timeTableEntries.value.map((v) => toHoursMinutesNotation(v.inputMinutes)),
);
const inputValidationMode = ref<"optional-time" | undefined>(undefined);

const onDayInput = (value: string, index: number) => {
  if (index < 0 || index > inputValues.value.length) {
    throw new Error(`Input index ${index} is out of range`);
  }

  inputValues.value[index] = value;

  const parsedValue = tryParseTimeNotation(value) ?? 0;
  timeTableEntries.value[index].inputMinutes = parsedValue;
};

const daySummaries = computed<string[]>(() => {
  const minutesPerDay: number[] = [];
  for (let i = 0; i < loggableDays.length; ++i) {
    const inputeMatches = timeTableEntries.value.filter(
      (v) => v.dayName === loggableDays[i],
    );
    const unmappedMatches = mappedEntries.unmappedEntries.filter(
      (v) => v.dayName === loggableDays[i],
    );
    minutesPerDay.push(
      [...inputeMatches, ...unmappedMatches].reduce<number>((acc, cur) => acc + cur.inputMinutes, 0),
    );
  }

  return minutesPerDay.map((m) => toHoursMinutesNotation(m));
});

const categorySummaries = computed<string[]>(() => {
  const minutesPerProject: number[] = [];
  for (let i = 0; i < applicationStore.categories.length; ++i) {
    const category = applicationStore.categories[i];
    const matches = timeTableEntries.value.filter(
      (v) =>
        v.category.name === category.name &&
        v.category.order === category.order,
    );
    minutesPerProject.push(
      matches.reduce<number>((acc, cur) => acc + cur.inputMinutes, 0),
    );
  }

  return minutesPerProject.map((m) => toHoursMinutesNotation(m));
});

const grandTotal = computed<string>(() => {
  const totalMinutes = timeTableEntries.value.reduce<number>(
    (acc, cur) => acc + cur.inputMinutes,
    0,
  ) + mappedEntries.unmappedEntries.reduce<number>(
    (acc, cur) => acc + cur.inputMinutes,
    0,
  );
  return toHoursMinutesNotation(totalMinutes);
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

const onKey = (direction: "up" | "down") => {
  if (!(document.activeElement instanceof HTMLInputElement)) {
    return;
  }

  const currentInputName = document.activeElement.name;
  if (
    !currentInputName ||
    currentInputName.match(/^dayinput-[0-9]+$/) == null
  ) {
    console.debug(
      `Ignoring input key event on unexpected input with name ${currentInputName}`,
    );
    return;
  }

  const currentEntryIndex = parseInt(currentInputName.split("-")[1]);
  let newIndex = currentEntryIndex;
  switch (direction) {
    case "up":
      newIndex -= loggableDays.length;
      if (newIndex < 0) {
        newIndex += inputValues.value.length;
      }
      break;

    case "down":
      newIndex = (newIndex + loggableDays.length) % inputValues.value.length;
      break;
  }

  tryFocusOn(`dayinput-${newIndex}`);
};

function tryFocusOn(name: string) {
  const hits = document.getElementsByName(name);
  if (hits.length > 0) {
    hits[0].focus();
  } else {
    console.debug(`Attempted focus on ${name} yielded no elements`);
  }
}

const onCopyTimeTableValues = () => {
  const firstReadOnlyCategoryIndex = applicationStore.categories.findIndex(
    (c) => c.readonly,
  );
  if (firstReadOnlyCategoryIndex >= 0) {
    applicationStore.copiedTimeTableValues = inputValues.value.slice(
      0,
      firstReadOnlyCategoryIndex * loggableDays.length,
    );
  } else {
    applicationStore.copiedTimeTableValues = inputValues.value.slice();
  }
};

const onPasteCopiedTimeTableValues = () => {
  if (applicationStore.copiedTimeTableValues == null) {
    return;
  }
  if (
    applicationStore.copiedTimeTableValues.length > inputValues.value.length
  ) {
    console.error(
      "Copied values cannot fit in the current set of inputs",
      applicationStore.copiedTimeTableValues,
      inputValues.value,
    );
    return;
  }

  applicationStore.copiedTimeTableValues.forEach((copy, index) => {
    onDayInput(copy, index);
  });
};

const getInputIndex = (categoryIndex: number, dayIndex: number): number => {
  if (categoryIndex < 0 || categoryIndex > applicationStore.categories.length) {
    throw new Error(`Category index value ${categoryIndex} is out of range`);
  }
  if (dayIndex < 0 || dayIndex > loggableDays.length) {
    throw new Error(`Day index value ${dayIndex} is out of range`);
  }

  return categoryIndex * loggableDays.length + dayIndex;
};

const onSubmit = async () => {
  if (isSaving.value) {
    return;
  }

  isSaving.value = true;
  let madeChanges = false;
  try {
    const delta = getNokoCallsForDelta(timeTableEntries.value, props.entries);
    for (let i = 0; i < delta.creates.length; ++i) {
      console.debug("Creating Noko entry", delta.creates[i]);
      await nokoClient.createEntry(delta.creates[i]);
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
              <th v-for="(day, index) in loggableDays" :key="day">
                <span :title="toShortDutchDate(dateRange.dates[index])">{{ day.substring(0, 2) }}</span>
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
              v-for="(category, categoryIndex) in applicationStore.categories"
              :key="category.name"
            >
              <td>
                <span
                  class="pr-1"
                  :class="{ 'text-gray-500': category.readonly }"
                  >{{ category.name }}</span
                >
              </td>

              <td
                v-for="(_, dayIndex) in loggableDays"
                :key="`${category.name}-${dayIndex}`"
              >
                <KeepiInput
                  :name="`dayinput-${getInputIndex(categoryIndex, dayIndex)}`"
                  :model-value="
                    inputValues[getInputIndex(categoryIndex, dayIndex)]
                  "
                  @update:model-value="
                    onDayInput($event, getInputIndex(categoryIndex, dayIndex))
                  "
                  :readonly="category.readonly"
                  :tabindex="category.readonly ? -1 : 0"
                  :input-validation="inputValidationMode"
                  class="text-center"
                  :class="{ 'text-gray-500': category.readonly }"
                  style="width: 65px"
                  @keyup.up="onKey('up')"
                  @keyup.down="onKey('down')"
                />
              </td>

              <td class="text-center text-gray-500">
                <div style="min-width: 65px">
                  <span class="pl-1">
                    {{ categorySummaries[categoryIndex] }}
                  </span>
                </div>
              </td>
            </tr>

            <tr class="text-gray-500" v-if="mappedEntries.unmappedEntries.length > 0">
              <td>Overige</td>

              <td
                v-for="(_, index) in loggableDays"
                class="text-center"
              >
                <div class="min-h-6">
                  {{ toHoursMinutesNotation(mappedEntries.unmappedEntries[index].inputMinutes) }}
                </div>
              </td>

              <td class="text-center">
                <div class="min-h-6" style="min-width: 65px">
                  {{ toHoursMinutesNotation(mappedEntries.unmappedEntries.reduce<number>((acc, cur) => acc + cur.inputMinutes, 0)) }}
                </div>
              </td>
            </tr>

            <tr>
              <td></td>

              <td
                v-for="(_, index) in loggableDays"
                class="text-center text-gray-500"
              >
                <div class="min-h-6">
                  <span>
                    {{ daySummaries[index] }}
                  </span>
                </div>
              </td>

              <td class="text-center text-gray-500">
                <div class="min-h-6" style="min-width: 65px">
                  <span>
                    {{ grandTotal }}
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
              @click="onCopyTimeTableValues"
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
