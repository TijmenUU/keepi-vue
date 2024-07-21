export const loggableDays: string[] = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
  "zaterdag",
  "zondag",
] as const;
export type LoggableDay = (typeof loggableDays)[number];

export type Category = {
  order: number;
  readonly: boolean;
  projectId: number;
  nokoTags: string[];
  name: string;
};

export type TimeTableEntry = {
  category: Category;
  dayName: LoggableDay;
  date: Date;
  initialMinutes: number;
  inputMinutes: number;
};
