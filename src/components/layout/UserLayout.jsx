"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

const UserLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  // Check authentication on component mount
  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username')

    if (!storedUsername) {
      // Redirect to login if no username found
      navigate('/login')
      return
    }

    setUsername(storedUsername)
    setIsAdmin(storedUsername.toLowerCase() === 'admin')
  }, [navigate])

  // Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem('username')
    navigate('/login')
  }

  const routes = isAdmin
    ? [
      { href: "/admin/dashboard", label: "Dashboard", icon: "home" },
      { href: "/admin/assign-task", label: "Assign Task", icon: "check-square" },
      { href: "/admin/tasks", label: "All Tasks", icon: "clipboard-list" },
    ]
    : [
      { href: "/user/dashboard", label: "Dashboard", icon: "home" },
      { href: "/user/tasks", label: "My Tasks", icon: "clipboard-list" },
      { href: "/user/completed-tasks", label: "Completed Tasks", icon: "check-square" },
      { href: "/user/profile", label: "Profile", icon: "user" },
    ]

  const getIcon = (iconName) => {
    switch (iconName) {
      case "home":
        return <i className="fas fa-home w-4 h-4"></i>
      case "clipboard-list":
        return <i className="fas fa-clipboard-list w-4 h-4"></i>
      case "check-square":
        return <i className="fas fa-check-square w-4 h-4"></i>
      case "user":
        return <i className="fas fa-user w-4 h-4"></i>
      case "cog":
        return <i className="fas fa-cog w-4 h-4"></i>
      default:
        return <i className="fas fa-circle w-4 h-4"></i>
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-teal-950">
      {/* Sidebar for desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-green-200 dark:border-teal-800 bg-white dark:bg-gray-950 md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-green-200 dark:border-teal-800 px-4 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900">
          <Link
            to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
            className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300"
          >
            <i className="fas fa-clipboard-list h-5 w-5 text-green-600 dark:text-green-400"></i>
            <span>Checklist & Delegation</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {routes.map((route) => (
              <li key={route.href}>
                <Link
                  to={route.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${location.pathname === route.href
                    ? "bg-gradient-to-r from-green-100 to-teal-100 text-green-700 dark:from-green-900 dark:to-teal-900 dark:text-green-300"
                    : "text-gray-700 hover:bg-green-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                >
                  {getIcon(route.icon)}
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-green-200 dark:border-teal-800 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {isAdmin ? 'Admin' : 'Staff Member'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {username}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
            >
              <i className="fas fa-sign-out-alt h-4 w-4"></i>
              <span className="sr-only">Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out md:hidden`}
      >
        <div className="flex h-14 items-center border-b border-green-200 dark:border-teal-800 px-4 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900">
          <Link
            to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
            className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className="fas fa-clipboard-list h-5 w-5 text-green-600 dark:text-green-400"></i>
            <span>Checklist & Delegation</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 bg-white dark:bg-gray-950">
          <ul className="space-y-1">
            {routes.map((route) => (
              <li key={route.href}>
                <Link
                  to={route.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${location.pathname === route.href
                    ? "bg-gradient-to-r from-green-100 to-teal-100 text-green-700 dark:from-green-900 dark:to-teal-900 dark:text-green-300"
                    : "text-gray-700 hover:bg-green-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {getIcon(route.icon)}
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-green-200 dark:border-teal-800 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {isAdmin ? 'Admin' : 'Staff Member'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {username}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
            >
              <i className="fas fa-sign-out-alt h-4 w-4"></i>
              <span className="sr-only">Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-green-200 dark:border-teal-800 bg-white dark:bg-gray-950 px-4 md:px-6">
          <button
            className="md:hidden text-green-700 dark:text-green-300"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <i className="fas fa-bars h-5 w-5"></i>
            <span className="sr-only">Toggle menu</span>
          </button>
          <h1 className="text-lg font-semibold text-green-700 dark:text-green-300">
            {isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-12">{children}</main>
        <div className="fixed left-0 md:left-64 right-0 bottom-6 flex justify-center z-10 pointer-events-none">
          <div className="px-6 py-2.5 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 pointer-events-auto hover:scale-105 transition-all duration-300">
            <a
              href="https://zentrix-dv.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
                Powered by <span className="font-bold text-green-600 group-hover:text-green-700">Zentrix</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLayout