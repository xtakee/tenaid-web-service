export interface Mapper<T, V> {
  map(from: T): V
}
