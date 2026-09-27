export function nowBrasilia(): Date {
  return new Date();
}

export function calculateNextBillingDate(dateCreated: string, currentDueDate: string): string {
  // Extract date part only
  const createdDatePart = dateCreated.split('T')[0];
  const dueDatePart = currentDueDate.split('T')[0];

  const originalDay = parseInt(createdDatePart.split('-')[2], 10);
  let [year, month] = dueDatePart.split('-').map(Number);

  // Add 1 month
  month += 1;
  if (month > 12) {
      month = 1;
      year += 1;
  }

  // Find the last day of the new month
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  
  // Keep original day if possible, else cap it at last day of the month
  const nextDay = Math.min(originalDay, lastDayOfMonth);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${year}-${pad(month)}-${pad(nextDay)}`;
}
