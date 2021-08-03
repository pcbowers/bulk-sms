import { useEffect, useState } from "react"
import { useHasMounted } from "../hooks/useHasMounted"
import { useTheme } from "../hooks/useTheme"
import { useToggle } from "../hooks/useToggle"
import Alert from "./Alert"

function ThemeClient({
  delay = 0,
  storageKey = "theme",
  defaultTheme = "system default"
}) {
  const [currentAlert, setCurrentAlert] = useState<{
    alert: string
    alertType?: string
  }>()
  const [firstTime, toggleFirstTime] = useToggle(true)
  const [theme, dispatch, themes] = useTheme({
    delay,
    storageKey,
    defaultTheme
  })

  useEffect(() => {
    if (!firstTime) setCurrentAlert({ alert: `Set theme to ${theme}` })
    else toggleFirstTime()
  }, [theme])

  console.log(currentAlert)

  return (
    <>
      <li>
        <a
          className="flex flex-row gap-1"
          onClick={() => dispatch({ type: "TOGGLE", payload: undefined })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
            <circle cx="8.5" cy="8.5" r=".5" fill="currentColor"></circle>
            <circle cx="15.5" cy="8.5" r=".5" fill="currentColor"></circle>
            <circle cx="15.5" cy="15.5" r=".5" fill="currentColor"></circle>
            <circle cx="8.5" cy="15.5" r=".5" fill="currentColor"></circle>
          </svg>
          <span>Change Theme</span>
        </a>
        <a
          className="flex flex-row gap-1"
          onClick={() => dispatch({ type: "SET", payload: "default" })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5"></path>
          </svg>
          <span>Reset Theme</span>
        </a>
        <a>
          <select
            className="w-full max-w-xs capitalize bg-accent select select-accent text-accent-content"
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
        </a>
      </li>
      {currentAlert && (
        <Alert alert={currentAlert.alert} alertType={currentAlert.alertType} />
      )}
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
