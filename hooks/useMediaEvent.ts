import { EventHandler, useEffect, useRef } from "react"

export function useMediaEvent(
  mediaQuery: string,
  eventName: string,
  handler: EventHandler<any>
) {
  const handlerRef = useRef<EventHandler<any>>((event: Event) => event)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const eventListener: EventListener = (event) => handlerRef.current(event)
    window.matchMedia(mediaQuery).addEventListener(eventName, eventListener)

    return () =>
      window
        .matchMedia(mediaQuery)
        .removeEventListener(eventName, eventListener)
  }, [eventName, mediaQuery])
}
