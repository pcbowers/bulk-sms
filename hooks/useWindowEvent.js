import { useEffect, useRef } from "react"

export function useWindowEvent(eventName, handler) {
  const handlerRef = useRef()

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const eventListener = (event) => handlerRef.current(event)
    window.addEventListener(eventName, eventListener)

    return () => window.removeEventListener(eventName, eventListener)
  }, [eventName])
}
