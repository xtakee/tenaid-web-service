
export function isWithin24Hours(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - inputDate.getTime();

  const hours24 = 24 * 60 * 60 * 1000;

  // Check if the difference is within 24 hours
  return timeDifference <= hours24 && timeDifference >= 0;
}

