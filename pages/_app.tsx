import { AppProps } from "next/dist/next-server/lib/router/router"
import Head from "next/head"
import { useRouter } from "next/router"
import { SWRConfig } from "swr"
import "tailwindcss/tailwind.css"
import Alert, { alerts, AlertType } from "../components/Alert"
import Navbar from "../components/Navbar"
import "../styles/globals.css"

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url)

    if (!res.ok) {
      const error: { message: string; info?: any; status?: number } = Error(
        "An error occurred while fetching the data."
      )
      error.info = await res.json()
      error.status = res.status
      throw error
    }

    return res.json()
  } catch (error) {
    throw Error(error.message)
  }
}

function manipulateAlert(message: string | string[]) {
  if (Array.isArray(message)) return message.join(",")
  return message
}

function manipulateAlertType(alertType: string | string[]): AlertType {
  const newAlertType = Array.isArray(alertType)
    ? alertType.join(",")
    : alertType

  if (Object.keys(alerts).includes(newAlertType))
    return newAlertType as AlertType
  else return "info"
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { alert = "", alertType = "" } = router.query

  return (
    <SWRConfig
      value={{
        fetcher,
        onError: (err) => {
          console.error(err)
        },
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          if (error.status === 404) return
          if (key === "/api/user") return
          if (retryCount >= 10) return
          setTimeout(() => revalidate({ retryCount }), 5000)
        }
      }}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navbar />
      <Component {...pageProps} />
      <Alert
        alert={manipulateAlert(alert)}
        alertType={manipulateAlertType(alertType)}
        routerUsed={true}
      />
    </SWRConfig>
  )
}

export default MyApp
