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
  projectId: number;
  nokoTags: string[];
  name: string;
};
