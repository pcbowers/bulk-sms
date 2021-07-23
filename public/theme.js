const THEME_STORAGE_KEY = "theme"
const DARK_THEME = "dark"
const LIGHT_THEME = "light"

const getTheme = () => {
  return (
    JSON.parse(window.localStorage[THEME_STORAGE_KEY] || false) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? DARK_THEME
      : LIGHT_THEME)
  )
}

document.documentElement.setAttribute(`data-${THEME_STORAGE_KEY}`, getTheme())

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    const theme = getTheme()

    document.documentElement.setAttribute(`data-${THEME_STORAGE_KEY}`, theme)
  })
