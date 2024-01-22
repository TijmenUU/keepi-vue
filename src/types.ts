export const days: string[] = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
] as const;
export type Day = (typeof days)[number];
