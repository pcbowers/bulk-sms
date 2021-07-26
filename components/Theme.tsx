import { useHasMounted } from "../hooks/useHasMounted"
import { useTheme } from "../hooks/useTheme"

function ThemeClient({
  delay = 0,
  storageKey = "theme",
  defaultTheme = "system default"
}) {
  const [theme, dispatch, themes] = useTheme({
    delay,
    storageKey,
    defaultTheme
  })

  return (
    <>
      <div className="flex flex-row items-center justify-center w-full h-screen gap-1">
        <button
          className="btn"
          onClick={() => dispatch({ type: "TOGGLE", payload: undefined })}
        >
          Toggle Theme
        </button>
        <button
          className="btn"
          onClick={() => dispatch({ type: "SET", payload: "default" })}
        >
          Clear Theme
        </button>
        <select
          className="w-full max-w-xs capitalize select select-bordered"
          value={theme}
          onChange={(e) => dispatch({ type: "SET", payload: e.target.value })}
        >
          {themes.map((curTheme) => {
            return (
              <option key={curTheme} value={curTheme}>
                {curTheme}
              </option>
            )
          })}
        </select>
      </div>
    </>
  )
}

export default function Theme({
  delay = 0,
  storageKey = "theme",
  defaultTheme = "system default"
}) {
  const hasMounted = useHasMounted()

  if (!hasMounted) return <></>

  return (
    <>
      <ThemeClient
        delay={delay}
        storageKey={storageKey}
        defaultTheme={defaultTheme}
      />
    </>
  )
}
