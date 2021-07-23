import { useEffect, useState } from "react"
import { useToggle } from "./useToggle"
import { useWindowEvent } from "./useWindowEvent"

export function useStickyState(defaultValue, storageKey) {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(storageKey)
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
  })
  const [canStore, toggleCanStore] = useToggle(true)

  const handler = (e) => {
    if (
      e.storageArea === window.localStorage &&
      e.key === storageKey &&
      e.newValue !== value
    ) {
      if (e.newValue === null) toggleCanStore()
      setValue(JSON.parse(e.newValue))
    }
  }

  useWindowEvent("storage", handler)

  useEffect(() => {
    if (canStore) window.localStorage.setItem(storageKey, JSON.stringify(value))
    if (!canStore) toggleCanStore()
  }, [storageKey, value])

  return [value, setValue]
}
