/**
 * 
 * @param old 
 * @param items 
 * @returns 
 */
export function mergeArray(old: string[], items: string[]) {
  items.forEach(item => {
    if (!old.includes(item)) old.push(item)
  })

  return old
}