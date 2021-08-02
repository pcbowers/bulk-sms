import nextConnect from "next-connect"
import {
  ExtendedRequest,
  ExtendedResponse,
  withSession
} from "../lib/middlewares"

export async function getServerSideProps({
  req,
  res
}: {
  req: ExtendedRequest
  res: ExtendedResponse
}) {
  const handler = nextConnect().use(withSession)
  try {
    await handler.run(req, res)
  } catch (error) {
    return {
      redirect: {
        destination: `/?redirect=${encodeURI("server failed")}`,
        permanent: false
      }
    }
  }

  const user = req.session.get("user")

  if (user) {
    return {
      props: {
        isSignedIn: true,
        user: user
      }
    }
  } else {
    return {
      redirect: {
        destination: `/?redirect=${encodeURI("not authorized")}`,
        permanent: false
      }
    }
  }
}

export default function Admin() {
  return <></>
}
