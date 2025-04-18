export function capitalizeFirstLetter(text: string): string {
  if (!text) return ''

  return text
    .toLowerCase()
    .split('.')
    .map(sentence => {
      const trimmed = sentence.trim()
      if (!trimmed) return '' // skip empty chunks
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
    }).join('. ')
}