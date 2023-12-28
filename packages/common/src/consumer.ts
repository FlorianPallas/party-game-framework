export interface Consumer<T> {
  consume(element: T): boolean;
}
