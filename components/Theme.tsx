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
      <div className="min-h-screen hero bg-base-100">
        <div className="text-center hero-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Theme Toggles</h1>
            <p className="mb-5">
              <select
                className="w-full max-w-xs capitalize select select-bordered"
                value={theme}
                onChange={(e) =>
                  dispatch({ type: "SET", payload: e.target.value })
                }
              >
                {themes.map((curTheme) => {
                  return (
                    <option key={curTheme} value={curTheme}>
                      {curTheme}
                    </option>
                  )
                })}
              </select>
            </p>
            <button
              className="mr-2 btn btn-primary"
              onClick={() => dispatch({ type: "TOGGLE", payload: undefined })}
            >
              Toggle Theme
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => dispatch({ type: "SET", payload: "default" })}
            >
              Clear Theme
            </button>
          </div>
        </div>
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
