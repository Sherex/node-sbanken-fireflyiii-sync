export function subtractYears (date: Date, numberOfYears: number): Date {
  const newDate = new Date(date.getTime())
  newDate.setFullYear(newDate.getFullYear() - numberOfYears)
  return newDate
}

export function getISODate (date: Date): string {
  return date.toISOString().split('T')[0]
}
