import { useEffect, useRef } from "react"

export function useMediaEvent(mediaQuery, eventName, handler) {
  const handlerRef = useRef()

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const eventListener = (event) => handlerRef.current(event)
    window.matchMedia(mediaQuery).addEventListener(eventName, eventListener)

    return () =>
      window
        .matchMedia(mediaQuery)
        .removeEventListener(eventName, eventListener)
  }, [eventName, mediaQuery])
}
