import Image from "next/image"
import Link from "next/link"
import Login from "../components/Login"
import { UserData, useUser } from "../hooks/useUser"
import Theme from "./Theme"

interface Pages {
  name: string
  adminOnly: boolean
  path: string
  main: boolean
  icon: JSX.Element
}

function MobileAdminButtons({
  user,
  pages
}: {
  user: UserData | undefined
  pages: Pages[]
}) {
  return (
    <>
      {user &&
        pages
          .filter((page) => page.adminOnly === user.isSignedIn && !page.main)
          .map((page) => {
            return (
              <li key={page.path}>
                <Link href={page.path}>
                  <a className="flex flex-row gap-1">
                    {page.icon}
                    {page.name}
                  </a>
                </Link>
              </li>
            )
          })}{" "}
    </>
  )
}

function DesktopAdminButtons({
  user,
  pages
}: {
  user: UserData | undefined
  pages: Pages[]
}) {
  return (
    <>
      {user &&
        pages
          .filter((page) => page.adminOnly === user.isSignedIn && !page.main)
          .map((page) => {
            return (
              <Link key={page.path} href={page.path}>
                <a className="flex flex-row gap-1 btn btn-ghost btn-sm rounded-btn">
                  {page.icon}
                  {page.name}
                </a>
              </Link>
            )
          })}
    </>
  )
}

export default function Navbar() {
  const { user, mutateUser } = useUser()
  const pages = [
    {
      name: "Home",
      adminOnly: false,
      path: "/",
      main: true,
      icon: <></>
    },
    {
      name: "Home",
      adminOnly: true,
      path: "/admin",
      main: true,
      icon: <></>
    },
    {
      name: "Contacts",
      adminOnly: true,
      path: "/contacts",
      main: false,
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )
    },
    {
      name: "Broadcasts",
      adminOnly: true,
      path: "/broadcasts",
      main: false,
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
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      )
    },
    {
      name: "Flows",
      adminOnly: true,
      path: "/flows",
      main: false,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
        </svg>
      )
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
        <div className="flex-none px-1 mx-2 xs:flex-1">
          <div className="items-stretch hidden md:flex">
            <DesktopAdminButtons user={user} pages={pages} />
          </div>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              className="flex btn btn-square btn-sm md:hidden btn-ghost"
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
            <ul
              tabIndex={0}
              className="w-40 shadow menu dropdown-content bg-neutral-focus rounded-box"
            >
              <MobileAdminButtons user={user} pages={pages} />
            </ul>
          </div>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-square btn-sm btn-ghost">
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
                <path d="M12 21a9 9 0 1 1 0 -18a9 8 0 0 1 9 8a4.5 4 0 0 1 -4.5 4h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"></path>
                <circle cx="7.5" cy="10.5" r=".5" fill="currentColor"></circle>
                <circle cx="12" cy="7.5" r=".5" fill="currentColor"></circle>
                <circle cx="16.5" cy="10.5" r=".5" fill="currentColor"></circle>
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="w-48 shadow menu dropdown-content bg-neutral-focus rounded-box"
            >
              <Theme />
            </ul>
          </div>
        </div>
        <div className="flex-none">
          {user && user.isSignedIn && (
            <button className="btn btn-square btn-sm btn-ghost">
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
                  <Image
                    src={user.picture}
                    className="rounded-full"
                    layout="fill"
                    objectFit="cover"
                    alt="avatar"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="shadow w-44 menu dropdown-content bg-neutral-focus rounded-box"
              >
                <li>
                  <Link href="/api/signout">
                    <a className="flex flex-row gap-1">
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sign Out</span>
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/api/cleanup">
                    <a className="flex flex-row gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                      <span>Check Health</span>
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
