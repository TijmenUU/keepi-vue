export function toShortIsoDate(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export function toShortDutchDate(d: Date): string {
  return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getFullYear()}`;
}

export function toHoursMinutesNotation(minutes: number): string {
  if (minutes < 0) {
    throw new Error("Negative values are not supported");
  }

  const minutesUnit = "m";
  const hoursUnit = "u";

  const hours = Math.floor(minutes / 60);
  const minutesRemainder = minutes - hours * 60;
  let result = "";
  if (hours > 0) {
    result += `${hours}${hoursUnit}`;
  }
  if (minutesRemainder > 0) {
    result += `${minutesRemainder}${minutesUnit}`;
  }

  return result;
}

export function tryParseTimeNotation(userValue: string): number | null {
  let result = tryParseSuffixTimeNotation(userValue);
  if (result != null) {
    return result;
  }

  result = tryParseColonTimeNotation(userValue);
  if (result != null) {
    return result;
  }

  const trimmedValue = userValue.trim();
  if (/^[0-9]+?$/.test(trimmedValue)) {
    // example: 1
    const hours = parseInt(trimmedValue);
    return hours * 60;
  }

  return null;
}

export function tryParseSuffixTimeNotation(userValue: string): number | null {
  const trimmedValue = userValue.trim();
  if (/^[0-9]+(h|u)(\s)*[0-9]+m$/.test(trimmedValue)) {
    // example: 1h30m
    const splitByhours = trimmedValue.split(/h|u/);
    const hours = parseInt(splitByhours[0]);
    const minutesPart = splitByhours[1].trim();
    const minutes = parseInt(minutesPart.substring(0, minutesPart.length - 1));

    return minutes + hours * 60;
  } else if (/^[0-9]+(h|u)$/.test(trimmedValue)) {
    // example: 1h
    const hours = parseInt(trimmedValue.substring(0, trimmedValue.length - 1));
    return hours * 60;
  } else if (/^[0-9]+m$/.test(trimmedValue)) {
    // example: 30m
    const minutes = parseInt(
      trimmedValue.substring(0, trimmedValue.length - 1),
    );
    return minutes;
  }

  return null;
}

export function tryParseColonTimeNotation(userValue: string): number | null {
  const trimmedValue = userValue.trim();
  if (/^[0-9]?[0-9]:[0-5][0-9]$/.test(trimmedValue)) {
    // example: 9:35 or 0:30
    const values = trimmedValue.split(":");
    const hours = parseInt(values[0]);
    const minutes = parseInt(values[1]);

    return minutes + hours * 60;
  }

  return null;
}
