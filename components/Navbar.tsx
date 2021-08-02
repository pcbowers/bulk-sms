import Link from "next/link"
import Login from "../components/Login"
import { useUser } from "../hooks/useUser"

export default function Navbar() {
  const { user, mutateUser } = useUser()
  const pages = [
    {
      name: "Home",
      adminOnly: false,
      path: "/",
      main: true,
      Icon: <></>
    },
    {
      name: "Home",
      adminOnly: true,
      path: "/admin",
      main: true,
      Icon: <></>
    }
  ]

  if (!user) return <></>

  return (
    <>
      <div className="fixed gap-1 shadow-lg left-1 right-1 top-1 navbar bg-neutral text-neutral-content rounded-box">
        <div className="flex-none px-2">
          <Link
            href={pages.reduce(
              (acc, page) =>
                page.main && page.adminOnly === user.isSignedIn
                  ? page.path
                  : acc,
              ""
            )}
          >
            <a className="text-lg font-bold">Bulk SMS</a>
          </Link>
        </div>
        <div className="flex-1 px-1 mx-2">
          <div className="items-stretch hidden md:flex">
            {user &&
              pages
                .filter(
                  (page) => page.adminOnly === user.isSignedIn && !page.main
                )
                .map((page) => {
                  return (
                    <a
                      key={page.path}
                      className="btn btn-ghost btn-sm rounded-btn"
                    >
                      {page.Icon}
                      {page.name}
                    </a>
                  )
                })}
          </div>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              className="flex btn btn-square md:hidden btn-ghost"
            >
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <ul className="w-40 shadow menu dropdown-content bg-neutral-focus rounded-box">
              {user &&
                pages
                  .filter(
                    (page) => page.adminOnly === user.isSignedIn && !page.main
                  )
                  .map((page) => {
                    return (
                      <li key={page.path}>
                        <a>
                          {page.Icon}
                          {page.name}
                        </a>
                      </li>
                    )
                  })}
            </ul>
          </div>
        </div>
        <div className="flex-none">
          {user && user.isSignedIn && (
            <button className="btn btn-square btn-ghost">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-none">
          {user && user.isSignedIn && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} className="btn btn-circle btn-ghost avatar">
                <div className="w-10 h-10 rounded-full">
                  <img src={user.picture} />
                </div>
              </div>
              <ul className="shadow w-36 menu dropdown-content bg-neutral-focus rounded-box">
                <li>
                  <Link href="/api/signout">
                    <a>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {user && !user.isSignedIn && <Login />}
        </div>
      </div>
    </>
  )
}
