<script setup lang="ts">
import { toHoursMinutesNotation, tryParseHoursMinutesNotation } from "@/format";
import { LoggableDay, loggableDays } from "@/types";
import { reactive } from "vue";

export type saveEntry = { category: string; day: LoggableDay; minutes: number };

const props = defineProps<{
  inputCategories: string[];
  initialValues: saveEntry[];
}>();
const emits = defineEmits<{
  (e: "save", values: saveEntry[]): void;
}>();

const createKey = (category: string, day: string) => `${category}${day}`;

const generateValues = (): Record<string, string> => {
  const result: saveEntry[] = [];
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

  const results: saveEntry[] = [];
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
    <table>
      <tr>
        <th></th>
        <th v-for="day in loggableDays" :key="day">
          {{ day }}
        </th>
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
      </tr>
    </table>

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
