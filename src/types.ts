export const loggableDays: string[] = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
] as const;
export type LoggableDay = (typeof loggableDays)[number];
