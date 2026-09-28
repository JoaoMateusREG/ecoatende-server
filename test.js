function getNextDueDate(dateCreated, currentDueDate) {
    const originalDay = parseInt(dateCreated.split('-')[2]);
    let [year, month, day] = currentDueDate.split('-').map(Number);
    
    // add 1 month
    month += 1;
    if (month > 12) {
        month = 1;
        year += 1;
    }
    
    // last day of the new month
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    
    // use original day, but capped to last day of month
    const nextDay = Math.min(originalDay, lastDayOfMonth);
    
    const pad = (n) => n.toString().padStart(2, '0');
    return \\-\-\\;
}
console.log(getNextDueDate('2024-01-31', '2024-02-28')); // should be 2024-03-31
console.log(getNextDueDate('2024-01-31', '2024-04-30')); // should be 2024-05-31
console.log(getNextDueDate('2024-02-29', '2025-02-28')); // should be 2025-03-29
