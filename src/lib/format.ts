export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatMonth = (ym: string) => {
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
};

// "May 2026 – Aug 2026", or "Oct 2026 – Present" when there's no end.
export function formatPeriod(start?: string, end?: string): string | undefined {
  if (!start) return undefined;
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}

export const statusLabel = {
  live: "Live",
  "in-progress": "In progress",
  upcoming: "Upcoming",
  planned: "Planned",
} as const;
