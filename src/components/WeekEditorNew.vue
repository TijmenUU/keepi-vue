<script setup lang="ts">
import KeepiButton from "@/components/KeepiButton.vue";
import WeekEditorNewInput from "@/components/WeekEditorNewInput.vue";
import WeekViewDayLabel from "@/components/WeekViewDayLabel.vue";
import { areDatesEqual, type DateRange } from "@/date";
import { toHoursMinutesNotation, tryParseTimeNotation } from "@/format";
import {
  mapToMinutesPerCategoryForDates,
  type MappedNokoEntryDateMinutePair,
} from "@/nokoHelpers";
import { useCustomSubmit } from "@/regleHelpers";
import type { INokoGetEntryResponse } from "@/responses";
import { useApplicationStore } from "@/store/application-store";
import { useRegle } from "@regle/core";
import { withMessage } from "@regle/rules";
import { computed } from "vue";

const props = defineProps<{
  dateRange: DateRange;
  nokoEntries: INokoGetEntryResponse[];
}>();

const emits = defineEmits<{
  (
    e: "submit",
    value: { categoryName: string; minutesPerDate: number[] }[],
  ): void;
}>();

const applicationStore = useApplicationStore();

const categories = applicationStore.categories
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((c) => c.name);

const minutesPerDatePerCategory = mapToMinutesPerCategoryForDates(
  props.dateRange.dates,
  applicationStore.categories,
  props.nokoEntries,
);

const mapEntriesToMinutesPerDate = (
  entries: MappedNokoEntryDateMinutePair[],
): number[] => {
  return props.dateRange.dates.map((d) =>
    entries
      .filter((ce) => areDatesEqual(ce.date, d))
      .reduce((previous, current) => current.minutes + previous, 0),
  );
};

const { r$ } = useRegle(
  {
    days: categories
      .map((c) => {
        const categoryEntries = minutesPerDatePerCategory.entries.filter(
          (e) => e.category.name === c,
        );
        return mapEntriesToMinutesPerDate(
          categoryEntries
            .map((ce) => ce.minutesPerDate)
            .reduce((previous, current) => {
              current.forEach((i) => previous.push(i));
              return previous;
            }, []),
        );
      })
      .reduce<{ minutes: string }[]>((previous, current) => {
        current.forEach((v) =>
          previous.push({ minutes: toHoursMinutesNotation(v) }),
        );
        return previous;
      }, []),
  },
  {
    days: {
      $each: {
        minutes: {
          isValidNotation: withMessage((value) => {
            return (
              value == null ||
              typeof value !== "string" ||
              value === "" ||
              tryParseTimeNotation(value) != null
            );
          }, "Geen geldige tijd"),
        },
      },
    },
  },
);

const categoryTotals = computed<Record<string, number>>(() => {
  const result: Record<string, number> = {};
  categories.forEach((c, index) => {
    const start = 0 + index * 7;
    const end = start + 7;
    result[c] = r$.$value.days
      .slice(start, end)
      .map((v) => tryParseTimeNotation(v.minutes) ?? 0)
      .reduce((previous, current) => previous + current);
  });

  return result;
});

const unmappedMinutesPerDate = mapEntriesToMinutesPerDate(
  minutesPerDatePerCategory.unmappedEntries,
);
const unmappedMinutes = {
  monday: unmappedMinutesPerDate[0],
  tuesday: unmappedMinutesPerDate[1],
  wednesday: unmappedMinutesPerDate[2],
  thursday: unmappedMinutesPerDate[3],
  friday: unmappedMinutesPerDate[4],
  saturday: unmappedMinutesPerDate[5],
  sunday: unmappedMinutesPerDate[6],
};

const unmappedMinutesTotal =
  unmappedMinutes.monday +
  unmappedMinutes.tuesday +
  unmappedMinutes.wednesday +
  unmappedMinutes.thursday +
  unmappedMinutes.friday +
  unmappedMinutes.saturday +
  unmappedMinutes.sunday;

const dayTotals = computed<{
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}>(() => {
  const totalsPerDay = [0, 0, 0, 0, 0, 0, 0];
  r$.$value.days.forEach((value, index) => {
    const minutes = tryParseTimeNotation(value.minutes);
    if (minutes != null) {
      totalsPerDay[index % 7] += minutes;
    }
  });
  return {
    monday: totalsPerDay[0],
    tuesday: totalsPerDay[1],
    wednesday: totalsPerDay[2],
    thursday: totalsPerDay[3],
    friday: totalsPerDay[4],
    saturday: totalsPerDay[5],
    sunday: totalsPerDay[6],
  };
});

const grandTotal = computed<number>(() => {
  return (
    dayTotals.value.monday +
    dayTotals.value.tuesday +
    dayTotals.value.wednesday +
    dayTotals.value.thursday +
    dayTotals.value.friday +
    dayTotals.value.saturday +
    dayTotals.value.sunday
  );
});

const { onSubmit, forceShowError } = useCustomSubmit({
  submitCallback: () => {
    emits(
      "submit",
      categories.map((categoryName, categoryIndex) => ({
        categoryName: categoryName,
        minutesPerDate: props.dateRange.dates.map(
          (date, dateIndex) =>
            tryParseTimeNotation(
              r$.$value.days[categoryIndex * 7 + dateIndex].minutes,
            ) ?? 0,
        ),
      })),
    );
  },
});
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col gap-2 overflow-x-scroll overflow-y-hidden">
      <div class="grid grid-cols-[repeat(10,minmax(4rem,1fr))] gap-2 font-bold">
        <span class="col-span-2">Categorie</span>
        <WeekViewDayLabel
          v-for="date in dateRange.dates"
          :key="date.getTime()"
          :date="date"
        />
        <span>Totalen</span>
      </div>

      <div
        class="grid grid-cols-[repeat(10,minmax(4rem,1fr))] gap-2"
        v-for="(category, index) in categories"
        :key="category"
      >
        <span class="col-span-2 truncate overflow-hidden text-gray-500">
          {{ category }}
        </span>
        <WeekEditorNewInput
          v-model="r$.$value.days[0 + index * 7].minutes"
          :field="r$.$fields.days.$each[0 + index * 7].$fields.minutes"
          :force-show-error="forceShowError"
        />
        <WeekEditorNewInput
          v-model="r$.$value.days[1 + index * 7].minutes"
          :field="r$.$fields.days.$each[1 + index * 7].$fields.minutes"
          :force-show-error="forceShowError"
        />
        <WeekEditorNewInput
          v-model="r$.$value.days[2 + index * 7].minutes"
          :field="r$.$fields.days.$each[2 + index * 7].$fields.minutes"
          :force-show-error="forceShowError"
        />
        <WeekEditorNewInput
          v-model="r$.$value.days[3 + index * 7].minutes"
          :field="r$.$fields.days.$each[3 + index * 7].$fields.minutes"
          :force-show-error="forceShowError"
        />
        <WeekEditorNewInput
          v-model="r$.$value.days[4 + index * 7].minutes"
          :field="r$.$fields.days.$each[4 + index * 7].$fields.minutes"
          :force-show-error="forceShowError"
        />
        <WeekEditorNewInput
          v-model="r$.$value.days[5 + index * 7].minutes"
          :field="r$.$fields.days.$each[5 + index * 7].$fields.minutes"
          :force-show-error="forceShowError"
        />
        <WeekEditorNewInput
          v-model="r$.$value.days[6 + index * 7].minutes"
          :field="r$.$fields.days.$each[6 + index * 7].$fields.minutes"
          :force-show-error="forceShowError"
        />
        <span class="text-center text-gray-500">
          {{ toHoursMinutesNotation(categoryTotals[category]) }}
        </span>
      </div>

      <div
        class="grid grid-cols-[repeat(10,minmax(4rem,1fr))] gap-2 text-gray-500"
        v-if="unmappedMinutesTotal > 0"
      >
        <span class="col-span-2">Overige</span>
        <span>{{ toHoursMinutesNotation(unmappedMinutes.monday) }}</span>
        <span>{{ toHoursMinutesNotation(unmappedMinutes.tuesday) }}</span>
        <span>{{ toHoursMinutesNotation(unmappedMinutes.wednesday) }}</span>
        <span>{{ toHoursMinutesNotation(unmappedMinutes.thursday) }}</span>
        <span>{{ toHoursMinutesNotation(unmappedMinutes.friday) }}</span>
        <span>{{ toHoursMinutesNotation(unmappedMinutes.saturday) }}</span>
        <span>{{ toHoursMinutesNotation(unmappedMinutes.sunday) }}</span>
        <span>{{ toHoursMinutesNotation(unmappedMinutesTotal) }}</span>
      </div>

      <div
        class="grid min-h-6 grid-cols-[repeat(10,minmax(4rem,1fr))] gap-2 text-center text-gray-500"
      >
        <span class="col-span-2"></span>
        <span>{{ toHoursMinutesNotation(dayTotals.monday) }}</span>
        <span>{{ toHoursMinutesNotation(dayTotals.tuesday) }}</span>
        <span>{{ toHoursMinutesNotation(dayTotals.wednesday) }}</span>
        <span>{{ toHoursMinutesNotation(dayTotals.thursday) }}</span>
        <span>{{ toHoursMinutesNotation(dayTotals.friday) }}</span>
        <span>{{ toHoursMinutesNotation(dayTotals.saturday) }}</span>
        <span>{{ toHoursMinutesNotation(dayTotals.sunday) }}</span>
        <span>
          {{ toHoursMinutesNotation(grandTotal) }}
        </span>
      </div>
    </div>

    <div class="text-right">
      <KeepiButton variant="green" @click="onSubmit">Opslaan</KeepiButton>
    </div>
  </div>
</template>
