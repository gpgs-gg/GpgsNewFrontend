const getDaysCount = (
  clientDoj,
  clientLastDate,
  billMonth,
  billYear
) => {
  if (!clientDoj) return 0;

  // YYYY-MM-DD extract
  const dojStr = new Date(clientDoj)
    .toISOString()
    .split("T")[0];

  const [year, month, day] = dojStr
    .split("-")
    .map(Number);

  // First Month
  if (month === billMonth && year === billYear) {
    return 30 - Math.min(day, 30) + 1;
  }

  // Last Month
  if (clientLastDate) {
    const lastStr = new Date(clientLastDate)
      .toISOString()
      .split("T")[0];

    const [lastYear, lastMonth, lastDay] =
      lastStr.split("-").map(Number);

    if (
      lastMonth === billMonth &&
      lastYear === billYear
    ) {
      return Math.min(lastDay, 30);
    }
  }

  return 30;
};