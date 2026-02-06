"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { CheckSquare, ClipboardList, Home, LogOut, Menu, Database, ChevronDown, ChevronRight, Zap, FileText, X, Play, Pause, KeyRound, Video, Calendar } from 'lucide-react'
import sbhLogo from '../../assets/logo.png'

export default function AdminLayout({ children, darkMode, toggleDarkMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDataSubmenuOpen, setIsDataSubmenuOpen] = useState(false)
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [profileImage, setProfileImage] = useState(null)


  // Check authentication on component mount
  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username')
    const storedRole = sessionStorage.getItem('role')
    const storedEmail = sessionStorage.getItem('email')
    const storedImage = sessionStorage.getItem('profileImage')

    if (!storedUsername) {
      // Redirect to login if not authenticated
      navigate("/login")
      return
    }

    setUsername(storedUsername)
    setUserRole(storedRole || "user")
    setUserEmail(storedEmail || "")
    setProfileImage(storedImage)

    // Listen for profile image updates from Dashboard
    const handleImageUpdate = () => {
      const newImage = sessionStorage.getItem('profileImage')
      setProfileImage(newImage)
    }

    window.addEventListener('profileImageUpdated', handleImageUpdate)

    return () => {
      window.removeEventListener('profileImageUpdated', handleImageUpdate)
    }
  }, [navigate])



  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('role')
    sessionStorage.removeItem('department')
    sessionStorage.removeItem('email')
    navigate("/login")
  }


  // Filter dataCategories based on user role
  const dataCategories = [
    //{ id: "main", name: "PURAB", link: "/dashboard/data/main" },
    { id: "sales", name: "Checklist", link: "/dashboard/data/sales" },
    // { id: "service", name: "Service", link: "/dashboard/data/service" },
    //{ id: "account", name: "RKL", link: "/dashboard/data/account" },
    //{ id: "warehouse", name: "REFRASYNTH", link: "/dashboard/data/warehouse" },
    //{ id: "delegation", name: "Delegation", link: "/dashboard/data/delegation" },
    //{ id: "purchase", name: "Slag Crusher", link: "/dashboard/data/purchase" },
    //{ id: "director", name: "Hr", link: "/dashboard/data/director" },
    //{ id: "managing-director", name: "PURAB", link: "/dashboard/data/managing-director" },
    // { id: "coo", name: "COO", link: "/dashboard/data/coo" },
    // { id: "jockey", name: "Jockey", link: "/dashboard/data/jockey" },
  ]

  // Update the routes array based on user role
  const routes = [
    {
      href: "/dashboard/admin",
      label: "Dashboard",
      icon: Database,
      active: location.pathname === "/dashboard/admin",
      showFor: ["admin", "user"] // Show for both roles
    },
    {
      href: "/dashboard/delegation",
      label: "Delegation",
      icon: ClipboardList,
      active: location.pathname === "/dashboard/delegation",
      showFor: ["admin", "user"] // Only show for admin
    },
    {
      href: "/dashboard/data/sales",
      label: "Checklist",
      icon: Database,
      active: location.pathname === "/dashboard/data/sales",
      showFor: ["admin", "user"] // Show for both roles
    },
    {
      href: "/dashboard/assign-task",
      label: "Assign Task",
      icon: CheckSquare,
      active: location.pathname === "/dashboard/assign-task",
      showFor: ["admin"] // Only show for admin
    },
    {
      href: "/dashboard/quick-task",
      label: "Unique Task",
      icon: Zap,
      active: location.pathname === "/dashboard/quick-task",
      showFor: ["admin", "user"] // Only show for admin
    },
    {
      href: "/dashboard/calendar",
      label: "Calendar",
      icon: Calendar,
      active: location.pathname === "/dashboard/calendar",
      showFor: ["admin", "user"] // Show for both roles
    },
    {
      href: "/dashboard/license",
      label: "License",
      icon: KeyRound,
      active: location.pathname === "/dashboard/license",
      showFor: ["admin", "user"] // show both
    },
    {
      href: "/dashboard/traning-video",
      label: "Training Video",
      icon: Video,
      active: location.pathname === "/dashboard/traning-video",
      showFor: ["admin", "user"] //  show both
    },
  ]

  const getAccessibleDepartments = () => {
    const userRole = sessionStorage.getItem('role') || 'user'
    return dataCategories.filter(cat =>
      !cat.showFor || cat.showFor.includes(userRole)
    )
  }

  // Filter routes based on user role
  const getAccessibleRoutes = () => {
    const userRole = sessionStorage.getItem('role') || 'user'
    return routes.filter(route =>
      route.showFor.includes(userRole)
    )
  }

  // Check if the current path is a data category page
  const isDataPage = location.pathname.includes("/dashboard/data/")

  // If it's a data page, expand the submenu by default
  useEffect(() => {
    if (isDataPage && !isDataSubmenuOpen) {
      setIsDataSubmenuOpen(true)
    }
  }, [isDataPage, isDataSubmenuOpen])

  // Get accessible routes and departments
  const accessibleRoutes = getAccessibleRoutes()
  const accessibleDepartments = getAccessibleDepartments()

  // License Modal Component
  const LicenseModal = () => {
    // Function to convert YouTube URL to embed URL
    const getYouTubeEmbedUrl = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`
        : url;
    };


  }

  return (
    <div
      className={`flex h-screen overflow-hidden bg-slate-50`}
    >
      {/* Sidebar for desktop */}
      <aside className="hidden w-56 flex-shrink-0 bg-white md:flex md:flex-col shadow-xl z-10 transition-all duration-300">
        <div className="flex h-20 items-center justify-center border-b border-slate-100 px-6">
          <Link
            to="/dashboard/admin"
            className="flex items-center gap-2 font-semibold text-blue-700 transform hover:scale-105 transition-transform duration-200"
          >
            <img src={sbhLogo} alt="Checklist & Delegation" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <ul className="space-y-2">
            {accessibleRoutes.map((route) => (
              <li key={route.label}>
                {route.submenu ? (
                  <div className="group">
                    <button
                      onClick={() => setIsDataSubmenuOpen(!isDataSubmenuOpen)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group-hover:bg-slate-50 ${route.active
                        ? "bg-blue-600 bg-gradient-to-r from-[#3b82f6] to-[#a855f7] text-white shadow-md border-2 border-slate-900"
                        : "text-gray-700 hover:text-blue-600 hover:translate-x-1"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${route.active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500"} transition-colors`}>
                          <route.icon className="h-4 w-4" />
                        </div>
                        {route.label}
                      </div>
                      {isDataSubmenuOpen ? (
                        <ChevronDown className={`h-4 w-4 ${route.active ? "text-white" : "text-slate-400"}`} />
                      ) : (
                        <ChevronRight className={`h-4 w-4 ${route.active ? "text-white" : "text-slate-400"}`} />
                      )}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDataSubmenuOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                      <ul className="ml-4 space-y-1 border-l-2 border-slate-100 pl-3">
                        {accessibleDepartments.map((category) => (
                          <li key={category.id}>
                            <Link
                              to={
                                category.link ||
                                `/dashboard/data/${category.id}`
                              }
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${location.pathname ===
                                (category.link ||
                                  `/dashboard/data/${category.id}`)
                                ? "bg-blue-50 text-blue-700 font-medium translate-x-1"
                                : "text-slate-500 hover:text-blue-600 hover:bg-slate-50 hover:translate-x-1"
                                }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={route.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group ${route.active
                      ? "bg-blue-600 bg-gradient-to-r from-[#3b82f6] to-[#a855f7] text-white shadow-md border-2 border-slate-900"
                      : "text-gray-700 hover:bg-slate-50 hover:text-blue-600 hover:translate-x-1"
                      }`}
                  >
                    <div className={`p-1.5 rounded-lg ${route.active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500"} transition-colors`}>
                      <route.icon className="h-4 w-4" />
                    </div>
                    {route.label}
                    {route.active && <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse"></div>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Sidebar Footer Removed */}
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden absolute left-4 top-3 z-50 text-blue-700 p-2 rounded-md hover:bg-blue-100"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </button>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex h-14 items-center border-b border-blue-200 px-4 bg-gradient-to-r from-blue-100 to-purple-100">
              <Link
                to="/dashboard/admin"
                className="flex items-center gap-2 font-semibold text-blue-00"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <img src={sbhLogo} alt="Checklist & Delegation" className="h-14 w-auto object-contain" />
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto p-2 bg-white">
              <ul className="space-y-1">
                {accessibleRoutes.map((route) => (
                  <li key={route.label}>
                    {route.submenu ? (
                      <div>
                        <button
                          onClick={() =>
                            setIsDataSubmenuOpen(!isDataSubmenuOpen)
                          }
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${route.active
                            ? "bg-blue-600 bg-gradient-to-r from-[#3b82f6] to-[#a855f7] text-white shadow-md border-2 border-slate-900"
                            : "text-gray-700 hover:bg-blue-50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <route.icon
                              className={`h-4 w-4 ${route.active ? "text-white" : ""
                                }`}
                            />
                            {route.label}
                          </div>
                          {isDataSubmenuOpen ? (
                            <ChevronDown className={`h-4 w-4 ${route.active ? "text-white" : ""}`} />
                          ) : (
                            <ChevronRight className={`h-4 w-4 ${route.active ? "text-white" : ""}`} />
                          )}
                        </button>
                        {isDataSubmenuOpen && (
                          <ul className="mt-1 ml-6 space-y-1 border-l border-blue-100 pl-2">
                            {accessibleDepartments.map((category) => (
                              <li key={category.id}>
                                <Link
                                  to={
                                    category.link ||
                                    `/dashboard/data/${category.id}`
                                  }
                                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${location.pathname ===
                                    (category.link ||
                                      `/dashboard/data/${category.id}`)
                                    ? "bg-blue-50 text-blue-700 font-medium"
                                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {category.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={route.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${route.active
                          ? "bg-blue-600 bg-gradient-to-r from-[#3b82f6] to-[#a855f7] text-white shadow-md border-2 border-slate-900"
                          : "text-gray-700 hover:bg-blue-50"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <route.icon
                          className={`h-4 w-4 ${route.active ? "text-white" : ""
                            }`}
                        />
                        {route.label}
                        {route.active && <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse"></div>}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            {/* Mobile Sidebar Footer Removed */}
          </div>
        </div>
      )}

      {/* License Modal */}
      {isLicenseModalOpen && <LicenseModal />}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-blue-200 bg-white px-4 md:px-6 transition-all duration-300">
          <div className="flex md:hidden w-8"></div>
          <h1 className="text-sm md:text-xl font-bold flex items-center gap-2">
            <span style={{
              textAlign: "center",
              background: 'linear-gradient(to right, #9333EA, #DB2777)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              {(() => {
                const hour = new Date().getHours()
                let greeting = "Good Morning"
                if (hour >= 12 && hour < 18) greeting = "Good Afternoon"
                else if (hour >= 18) greeting = "Good Evening"

                return `${greeting}, ${username ? username.toUpperCase() : "USER"}!`
              })()}
            </span>
            <span className="animate-bounce inline-block">👋</span>
          </h1>

          {/* Profile Section - Refined (Flatter & Compact) */}
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <span className="text-sm">
                    {username ? username.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-700 leading-tight">
                  {username || "User"}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  {userRole === "admin" ? "Admin" : "Staff"}
                </p>
              </div>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 mx-0.5 hidden md:block"></div>
            <div className="flex items-center gap-0.5">
              {toggleDarkMode && (
                <button
                  onClick={toggleDarkMode}
                  className="p-1.5 rounded-full text-slate-500 hover:text-blue-600 hover:bg-white transition-colors"
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {darkMode ? <Zap className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5 fill-current" />}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full text-slate-500 hover:text-red-600 hover:bg-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          {children}
          <div className="fixed left-0 right-0 bottom-6 flex justify-center z-10 pointer-events-none">
            <div className="px-6 py-2.5 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 pointer-events-auto hover:scale-105 transition-all duration-300">
              <a
                href="https://zentrix-dv.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
                  Powered by <span className="font-bold text-indigo-600 group-hover:text-indigo-700">Zentrix</span>
                </span>
              </a>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}
