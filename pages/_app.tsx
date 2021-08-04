import { AppProps } from "next/dist/next-server/lib/router/router"
import Head from "next/head"
import { useRouter } from "next/router"
import { SWRConfig } from "swr"
import "tailwindcss/tailwind.css"
import Alert from "../components/Alert"
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
        <meta name="description" content="A way to send SMS messages in bulk" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Component {...pageProps} />
      {alert && <Alert alert={alert} alertType={alertType} routerUsed={true} />}
    </SWRConfig>
  )
}

export default MyApp
