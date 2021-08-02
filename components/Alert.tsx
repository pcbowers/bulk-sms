import { useRouter } from "next/router"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { useHasMounted } from "../hooks/useHasMounted"
import { useToggle } from "../hooks/useToggle"

export type AlertType = "error" | "success" | "warning" | "info"

export const alerts = {
  error: {
    class: "alert-error",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="flex w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  },
  info: {
    class: "alert-info",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="flex w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  },
  success: {
    class: "alert-success",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )
  },
  warning: {
    class: "alert-warning",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    )
  }
}

const Portal = ({ children }: { children?: JSX.Element }) => {
  const mount = document.getElementById("alerts")
  const el = document.createElement("div")

  useEffect(() => {
    if (mount) mount.appendChild(el)
    return () => {
      if (mount) mount.removeChild(el)
    }
  }, [el, mount])

  return createPortal(children, el)
}

function AlertClient({
  displayLength = 3000,
  alert = "",
  alertType = "info",
  routerUsed = false
}: {
  displayLength?: number
  alert?: string
  alertType?: AlertType
  routerUsed?: boolean
}) {
  const router = useRouter()
  const [show, toggleShow] = useToggle(true)

  const closeAlert = () => {
    if (routerUsed)
      router.replace(router.pathname, undefined, { shallow: true })
    toggleShow(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      closeAlert()
    }, displayLength)

    return () => {
      clearTimeout(timer)
    }
  }, [displayLength, router.pathname])

  if (!show || !alert) return <></>
  return (
    <Portal>
      <div className={`gap-2 alert ${alerts[alertType].class}`}>
        <div className="flex-none">{alerts[alertType].icon}</div>
        <div className="flex-1">
          <label>{alert}</label>
        </div>
        <div className="flex-none">
          <button className="flex btn btn-sm btn-ghost" onClick={closeAlert}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Close
          </button>
        </div>
      </div>
    </Portal>
  )
}

export default function Alert({
  displayLength = 3000,
  alert = "",
  alertType = "info",
  routerUsed = false
}: {
  displayLength?: number
  alert?: string
  alertType?: AlertType
  routerUsed?: boolean
}) {
  const hasMounted = useHasMounted()

  if (!hasMounted) return <></>

  return (
    <>
      <AlertClient
        displayLength={displayLength}
        alert={alert}
        alertType={alertType}
        routerUsed={routerUsed}
      />
    </>
  )
}
