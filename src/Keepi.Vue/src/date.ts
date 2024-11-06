export type DateRange = { weekNumber: number; year: number; dates: Date[] };

export function getWeekDaysFor(d: Date): DateRange {
  const weekNumber = getWeekNumber(d);
  const dates: Date[] = [];

  // Prior days in the week
  for (let i = 1; i < 7; ++i) {
    const candidate = new Date(d); // nice pun
    candidate.setDate(d.getDate() - i);
    if (getWeekNumber(candidate) === weekNumber) {
      dates.push(candidate);
    } else {
      break;
    }
  }

  dates.reverse();
  dates.push(d);

  for (let i = 1; i < 7; ++i) {
    const candidate = new Date(d);
    candidate.setDate(d.getDate() + i);
    if (getWeekNumber(candidate) === weekNumber) {
      dates.push(candidate);
    } else {
      break;
    }
  }

  return {
    dates: dates,
    weekNumber: weekNumber,
    year: dates.map((d) => d.getFullYear()).sort()[0],
  };
}

// https://stackoverflow.com/a/6117889
export function getWeekNumber(d: Date): number {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getDifferenceInSeconds(a: Date, b: Date): number {
  return Math.abs((a.getTime() - b.getTime()) / 1000);
}
