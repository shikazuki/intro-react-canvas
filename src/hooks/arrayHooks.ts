import { useState } from "react";

interface useArrayState<T> {
  add: (item: T) => void;
  replace: (func: (item: T) => T) => void;
}

export function useArray<T>(): [T[], useArrayState<T>] {
  const [items, setItems] = useState<Array<T>>([]);

  return [
    items,
    {
      add: (item: T) => setItems([...items, item]),
      replace: func => setItems(items.map(func)),
    }
  ]
}
