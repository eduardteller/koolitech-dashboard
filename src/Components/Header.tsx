import { Menu } from 'lucide-react'

const Header = () => {
  return (
    <header className="border-base top-0 z-50 h-20 border-b bg-base-100" id="header">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex h-full items-center justify-start gap-4">
          <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost drawer-button lg:hidden">
            <Menu className="inline-block h-6 w-6" />
          </label>
          <a
            href="https://koolitech.ee/"
            id="logo-btn"
            className="font-inter text-xl font-black uppercase"
          >
            Kooli
            <span className="text-base-content/60 duration-200 hover:text-base-content">Tech</span>
            {/* <p> | E-Kell</p> */}
          </a>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-ghost hidden md:inline">Kontakt</button>
          {/* <button className="btn btn-ghost hidden md:inline">Meist</button> */}
        </div>
      </div>
    </header>
  )
}

export default Header
