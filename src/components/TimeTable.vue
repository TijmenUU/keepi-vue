<script setup lang="ts">
import { toHoursMinutesNotation, tryParseHoursMinutesNotation } from "@/format";
import { LoggableDay, loggableDays } from "@/types";
import { computed, reactive } from "vue";

export type TimeTableEntry = {
  category: string;
  day: LoggableDay;
  minutes: number;
};

const props = defineProps<{
  inputCategories: string[];
  initialValues: TimeTableEntry[];
}>();
const emits = defineEmits<{
  (e: "save", values: TimeTableEntry[]): void;
}>();

const createKey = (category: string, day: string) => `${category}${day}`;

const generateValues = (): Record<string, string> => {
  const result: TimeTableEntry[] = [];
  props.inputCategories.forEach((category) => {
    loggableDays.forEach((day) => {
      result.push({
        category,
        day,
        minutes:
          props.initialValues.find(
            (e) => e.category === category && e.day === day
          )?.minutes ?? 0,
      });
    });
  });

  return result.reduce<Record<string, string>>(
    (acc, entry) => ({
      ...acc,
      [createKey(entry.category, entry.day)]: toHoursMinutesNotation(
        entry.minutes
      ),
    }),
    {}
  );
};

const values: Record<string, string> = reactive(generateValues());

const summaries = computed<Record<string, string>>(() => {
  const aggregates = props.inputCategories.reduce<Record<string, number>>(
    (acc, entry) => ({
      ...acc,
      [entry]: 0,
    }),
    {}
  );

  Object.keys(values).forEach((key) => {
    const value = tryParseHoursMinutesNotation(values[key]);
    if (value != null) {
      const parts = splitKey(key);
      aggregates[parts[0]] += value;
    }
  });

  return props.inputCategories.reduce<Record<string, string>>(
    (acc, entry) => ({
      ...acc,
      [entry]: toHoursMinutesNotation(aggregates[entry]),
    }),
    {}
  );
});

const total = computed<string>(() => {
  const aggregates = props.inputCategories.reduce<Record<string, number>>(
    (acc, entry) => ({
      ...acc,
      [entry]: 0,
    }),
    {}
  );

  Object.keys(values).forEach((key) => {
    const value = tryParseHoursMinutesNotation(values[key]);
    if (value != null) {
      const parts = splitKey(key);
      aggregates[parts[0]] += value;
    }
  });

  return toHoursMinutesNotation(
    props.inputCategories.reduce<number>(
      (acc, entry) =>
        acc + (tryParseHoursMinutesNotation(summaries.value[entry]) ?? 0),
      0
    )
  );
});

const splitKey = (key: string): [string, LoggableDay] => {
  const categoryPart = props.inputCategories.find((c) => key.startsWith(c));
  if (categoryPart == null) {
    throw new Error(`Invalid key ${key}: unknown category`);
  }

  const dayPart = key.substring(categoryPart.length);
  if (!loggableDays.includes(dayPart)) {
    throw new Error(`Invalid key ${key}: unknown day ${dayPart}`);
  }

  return [categoryPart, dayPart];
};

const onSubmit = () => {
  const entries = Object.entries(values);

  const results: TimeTableEntry[] = [];
  for (const [key, value] of entries) {
    const [category, day] = splitKey(key);
    const minutes = !!value ? tryParseHoursMinutesNotation(value) : 0;
    if (minutes == null) {
      throw new Error(`${value} cannot be parsed as 00u00m`);
    }

    results.push({
      category,
      day,
      minutes,
    });
  }

  emits("save", results);
};
</script>

<template>
  <div>
    <div style="max-width: 100vw; overflow-x: scroll">
      <table>
        <tr>
          <th></th>
          <th v-for="day in loggableDays" :key="day">
            {{ day }}
          </th>
          <th></th>
        </tr>

        <tr v-for="category in inputCategories" :key="category">
          <td>{{ category }}</td>
          <td v-for="day in loggableDays" :key="createKey(category, day)">
            <input
              :name="createKey(category, day)"
              type="text"
              v-model="values[createKey(category, day)]"
            />
          </td>
          <td>
            {{ summaries[category] }}
          </td>
        </tr>

        <tr>
          <td></td>
          <td :colspan="loggableDays.length - 1"></td>
          <td>Totaal</td>
          <td style="border-top: 1px white solid">
            {{ total }}
          </td>
        </tr>
      </table>
    </div>

    <div
      style="
        display: flex;
        width: 100%;
        flex-direction: row-reverse;
        padding-top: 10px;
      "
    >
      <button @click="onSubmit">Opslaan</button>
    </div>
  </div>
</template>

<style>
table {
  word-break: keep-all;
}

input {
  width: 80px;
  text-align: center;
}
</style>
