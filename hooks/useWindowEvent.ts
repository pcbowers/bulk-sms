import { EventHandler, useEffect, useRef } from "react"

export function useWindowEvent(eventName: string, handler: EventHandler<any>) {
  const handlerRef = useRef<EventHandler<any>>((event: Event) => event)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const eventListener = (event: Event) => handlerRef.current(event)
    window.addEventListener(eventName, eventListener)

    return () => window.removeEventListener(eventName, eventListener)
  }, [eventName])
}
