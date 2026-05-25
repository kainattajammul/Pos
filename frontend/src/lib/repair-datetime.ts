/** Display format: `17 05, 2024 (02:09 PM)` */
export function formatTaskDueDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hourStr = String(hours).padStart(2, "0");

  return `${day} ${month}, ${year} (${hourStr}:${minutes} ${period})`;
}

export function parseTaskDueDateTime(value: string): Date | null {
  const match = value.match(
    /^(\d{1,2})\s+(\d{1,2}),\s*(\d{4})\s*\((\d{1,2}):(\d{2})\s*(AM|PM)\)$/i,
  );
  if (!match) return null;

  const [, day, month, year, hour, minute, period] = match;
  let h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  if (period.toUpperCase() === "PM" && h !== 12) h += 12;
  if (period.toUpperCase() === "AM" && h === 12) h = 0;

  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), h, m);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const DEFAULT_TASK_DUE_AT = new Date(2024, 4, 17, 14, 9);

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
