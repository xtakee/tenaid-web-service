export function searchable(input: string, minLength = 2): string[] {
  if (!input) return []
  const substrings = new Set<string>() // Use a Set to prevent duplicates

  for (let i = 0; i < input.length; i++) {
    for (let len = minLength; len <= input.length - i; len++) {
      const sub = input.slice(i, i + len).toLowerCase();
      if (!sub.includes(' ')) substrings.add(sub)
    }
  }

  return Array.from(substrings)
}