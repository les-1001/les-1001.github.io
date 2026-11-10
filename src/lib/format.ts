export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const statusLabel = {
  live: "Live",
  "in-progress": "In progress",
  upcoming: "Upcoming",
  planned: "Planned",
} as const;
