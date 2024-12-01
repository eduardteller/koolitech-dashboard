import axios from 'axios'
import { Moon, Settings } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { themeChange } from 'theme-change'

interface Props {
  modal: boolean
  setModal: (modal: boolean) => void
}

const SettingsModal = ({ modal, setModal }: Props): React.ReactElement | null => {
  const [licenseTime, setLicenseTime] = useState<number | null>(null)
  const [theme, setTheme] = useState<string>('')

  const fetchLicenseTime = async (): Promise<void> => {
    const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/timer`, {
      withCredentials: true
    })

    if (data) {
      const timeLeft = data.time_left / (1000 * 60 * 60 * 24)
      setLicenseTime(timeLeft)
    }
    // const licenseTime = await window.api.getLicenseTime()
    // setLicenseTime(licenseTime)
  }

  const fetchTheme = async (): Promise<void> => {
    const themeStorage = localStorage.getItem('theme')
    setTheme(themeStorage ?? 'fantasy')
  }

  useEffect(() => {
    themeChange(false)
    fetchTheme()
    fetchLicenseTime()
  }, [modal])

  if (!modal) return null
  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="settingsModal" className="modal modal-open px-4 max-md:px-2">
        <div className="modal-box flex h-1/2 w-full max-w-3xl flex-col justify-between">
          <div className="flex h-full w-full flex-col justify-between">
            <div>
              <h3 className="border-base flex items-center gap-2 border-b pb-2 text-xl font-bold">
                <Settings />
                Seaded
              </h3>
              <div className="flex items-center justify-between py-4 pr-2">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    <Moon size={16} /> Teema
                  </p>
                  <p className="text-sm">Valige rakenduse välimus vastavalt oma eelistustele</p>
                </div>
                <select defaultValue={theme} data-choose-theme className="select select-ghost w-36">
                  <option value="fantasy">Hele</option>
                  <option value="dark">Tume</option>
                </select>
              </div>
            </div>

            <div className="border-base flex justify-between border-t pt-4">
              <div className="text-base-content">
                {licenseTime && <p>Litsents kehtib: {Math.floor(licenseTime)} päeva</p>}
              </div>
              <button onClick={() => setModal(false)} className="btn">
                Tagasi
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default SettingsModal
