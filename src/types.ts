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

export type TagToCategoryMapping = {
  order: number;
  archived: boolean;
  projectId: number;
  nokoTags: string[];
  name: string;
};

export type TimeTableEntry = {
  category: string;
  day: LoggableDay;
  minutes: number;
};
