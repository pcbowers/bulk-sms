import { useCallback, useState } from "react"

export function useToggle(initialValue = false): [boolean, Function] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(
    (customState?: boolean) => {
      setValue((v) => (customState === undefined ? !v : customState))
    },
    [setValue]
  )

  return [value, toggle]
}
