export function searchable(input: string, minLength = 3): string {
  const maxLength = input.length;
  const substrings: string[] = [];

  for (let len = minLength; len <= maxLength; len++) {
    for (let i = 0; i <= input.length - len; i++) {
      const sub: string = input.slice(i, i + len)
      if (sub.length >= minLength && !sub.includes(' ')) substrings.push(sub)
    }
  }
  return substrings.join(' ');
}