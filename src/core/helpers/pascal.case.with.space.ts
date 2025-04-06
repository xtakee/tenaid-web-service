
export function toPascalCaseWithSpaces(str: string): string {
  return str
    .replace(/[_\-\s]+/g, ' ') // Normalize separators to single space
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}