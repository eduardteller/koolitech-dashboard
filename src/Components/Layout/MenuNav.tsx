import { CalendarClock, NotebookPen, Settings, Siren } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { themeChange } from 'theme-change'
import Header from '../Header'
import SettingsModal from '../Settings/SettingsModal'

const MenuNav = (): React.ReactElement => {
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    themeChange(false)
  }, [])

  return (
    <>
      <div>
        <Toaster></Toaster>
      </div>
      <div className="flex h-screen w-full flex-col font-inter">
        <Header></Header>
        <div className="w-full flex-1">
          <div className="drawer h-full lg:drawer-open">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content h-full">
              {/* Page content here */}
              <main className="h-full w-full bg-base-200">
                <Outlet />
              </main>
            </div>
            <div className="drawer-side h-full">
              <label
                htmlFor="my-drawer-3"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <ul className="menu h-full w-60 justify-between bg-base-100 max-lg:pt-24">
                <div>
                  <li className="menu-title">Menüü</li>
                  <li>
                    <Link className={`${location.pathname === '/' ? 'active' : null}`} to="/">
                      <CalendarClock />
                      <p>Töölaud</p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`${location.pathname === '/edit' ? 'active' : null}`}
                      to="/edit"
                    >
                      <NotebookPen />
                      <p>Loo / Muuda Plaanid</p>
                    </Link>
                  </li>

                  <li>
                    <Link
                      className={`${location.pathname === '/alarm' ? 'active' : null}`}
                      to="/alarm"
                    >
                      <Siren />
                      <p>Häire</p>
                    </Link>
                  </li>
                </div>
                <div>
                  <li>
                    <a
                      onClick={() => setShowModal(true)}
                      className={`${location.pathname === '/settings' ? 'active' : null}`}
                    >
                      <Settings />
                      <p>Seaded</p>
                    </a>
                  </li>
                </div>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* <Footer></Footer> */}
      <SettingsModal modal={showModal} setModal={setShowModal} />
    </>
  )
}

export default MenuNav
