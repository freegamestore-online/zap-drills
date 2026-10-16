/** Today's date in UTC as YYYY-MM-DD. UTC so everyone worldwide gets the same day. */
export function utcDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** The UTC date before `date` (YYYY-MM-DD), across month and year boundaries. */
export function previousUtcDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1, day - 1)).toISOString().slice(0, 10);
}
