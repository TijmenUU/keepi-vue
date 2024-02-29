<script setup lang="ts">
import KeepiButton from "@/components/KeepiButton.vue";
import KeepiInput from "@/components/KeepiInput.vue";
import { toHoursMinutesNotation, tryParseTimeNotation } from "@/format";
import { LoggableDay, loggableDays } from "@/types";
import { computed, reactive } from "vue";

export type TimeTableEntry = {
  category: string;
  day: LoggableDay;
  minutes: number;
};

const props = defineProps<{
  inputCategories: { name: string; archived: boolean }[];
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
        category: category.name,
        day,
        minutes:
          props.initialValues.find(
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

const values: Record<string, string> = reactive(generateValues());

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
  const aggregates = props.inputCategories.reduce<Record<string, number>>(
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

  return props.inputCategories.reduce<Record<string, string>>(
    (acc, entry) => ({
      ...acc,
      [entry.name]: toHoursMinutesNotation(aggregates[entry.name]),
    }),
    {},
  );
});

const projectTotal = computed<string>(() => {
  const aggregates = props.inputCategories.reduce<Record<string, number>>(
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
    props.inputCategories.reduce<number>(
      (acc, entry) =>
        acc + (tryParseTimeNotation(projectSummaries.value[entry.name]) ?? 0),
      0,
    ),
  );
});

const splitKey = (key: string): [string, LoggableDay] => {
  const categoryPart = props.inputCategories.find((c) =>
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
      projectIndex = props.inputCategories.findIndex(
        (c) => c.name === nameParts[0],
      );
      if (projectIndex > 0) {
        tryFocusOn(
          createKey(props.inputCategories[projectIndex - 1].name, nameParts[1]),
        );
      } else {
        tryFocusOn(
          createKey(
            props.inputCategories[props.inputCategories.length - 1].name,
            nameParts[1],
          ),
        );
      }
      break;

    case "down":
      projectIndex = props.inputCategories.findIndex(
        (c) => c.name === nameParts[0],
      );
      if (projectIndex === props.inputCategories.length - 1) {
        tryFocusOn(createKey(props.inputCategories[0].name, nameParts[1]));
      } else {
        tryFocusOn(
          createKey(props.inputCategories[projectIndex + 1].name, nameParts[1]),
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

const onSubmit = () => {
  const entries = Object.entries(values);

  const results: TimeTableEntry[] = [];
  for (const [key, value] of entries) {
    const [category, day] = splitKey(key);
    const minutes = !!value ? tryParseTimeNotation(value) : 0;
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
    <div>
      <div class="flex justify-center overflow-auto" style="max-width: 100vw">
        <table class="table-auto">
          <tr>
            <th></th>
            <th v-for="day in loggableDays" :key="day">
              {{ day.substring(0, 2) }}
            </th>
            <th></th>
          </tr>

          <tr
            v-for="category in inputCategories"
            :key="category.name"
            v-show="projectSummaries[category.name] != '' || !category.archived"
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
                @keyup.up="onKey('up')"
                @keyup.down="onKey('down')"
                @keyup.left="onKey('left')"
                @keyup.right="onKey('right')"
              />
            </td>
            <td class="text-center text-gray-500">
              <span class="pl-1">{{ projectSummaries[category.name] }}</span>
            </td>
          </tr>

          <tr>
            <td></td>
            <td v-for="day in loggableDays" class="text-center text-gray-500">
              {{ daySummaries[day] }}
            </td>
            <td class="text-center text-gray-500">
              {{ projectTotal }}
            </td>
          </tr>
        </table>
      </div>

      <div class="flex w-full justify-end p-3">
        <KeepiButton @click="onSubmit" variant="green">Opslaan</KeepiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
input {
  width: 60px;
}
</style>
