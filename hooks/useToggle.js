import { useCallback, useState } from "react"

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback((customState) => {
    setValue((v) => (customState === undefined ? !v : customState))
  }, [])

  return [value, toggle]
}
