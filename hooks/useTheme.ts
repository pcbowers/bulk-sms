/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, useEffect } from "react"
import { StickyReducerAction, useStickyReducer } from "./useStickyReducer"

const SYSTEM_THEME = "system default"

export function useTheme({
  delay = 0,
  storageKey = "theme",
  defaultTheme = SYSTEM_THEME,
  themes = [
    SYSTEM_THEME,
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula"
  ]
}): [theme: string, dispatch: Dispatch<StickyReducerAction>, themes: string[]] {
  const getSystemTheme = () => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
    return "light"
  }

  const getTheme = () => {
    return theme === SYSTEM_THEME ? getSystemTheme() : theme
  }

  const reducer = (
    prevTheme: string,
    action = { type: "TOGGLE", payload: "" }
  ) => {
    switch (action.type) {
      case "TOGGLE":
        return themes[(themes.indexOf(prevTheme) + 1) % themes.length || 1]
      case "SET":
        return themes.includes(action.payload) ? action.payload : SYSTEM_THEME
      case "STORAGE_CHANGE":
        return themes.includes(action.payload) ? action.payload : SYSTEM_THEME
    }
  }

  const [theme, dispatch, ,] = useStickyReducer(
    reducer,
    defaultTheme,
    storageKey
  )

  useEffect(() => {
    setTimeout(() => {
      document.documentElement.setAttribute(`data-${storageKey}`, getTheme())
    }, delay)
  }, [theme, delay, storageKey])

  return [theme, dispatch, themes]
}
