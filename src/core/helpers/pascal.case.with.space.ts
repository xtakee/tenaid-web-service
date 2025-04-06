export { }

declare global {
  interface String {
    toPascalCaseWithSpaces(): string
  }
}

String.prototype.toPascalCaseWithSpaces = function (): string {
  return this
    .replace(/[_\-\s]+/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}