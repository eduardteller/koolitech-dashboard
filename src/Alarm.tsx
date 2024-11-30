import axios from 'axios'
import { Bell, BellRing, CircleAlert, Flame, LogOut, Shield } from 'lucide-react'
import { ReactElement, useState } from 'react'
import AlarmModal from './Components/Edit/Alarm/AlarmModal'

const Alarm = (): ReactElement => {
  const [modal, setModal] = useState(false)
  const [alarm, setAlarm] = useState(false)
  const [selectedAlarmType, setSelectedAlarmType] = useState<string>('fire')

  const stopAudio = async () => {
    const resp = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/alarm-stop`, {
      withCredentials: true
    })

    if (resp.status === 200) {
      setAlarm(false)
    }
  }

  return (
    <>
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-4 xl:p-8">
        <h1 className="flex items-center gap-2 pb-4 text-2xl font-bold">
          <BellRing size={24} />
          Häiresüsteem
        </h1>

        <div className="border-base card mx-auto flex h-full max-h-[640px] w-full max-w-lg flex-col gap-3 rounded-xl border bg-base-100 p-6">
          <div className="flex flex-row items-center gap-2 text-xl font-bold">
            <BellRing className={`h-6 w-6 ${alarm ? 'text-error' : ''}`} />
            <p>Käivita häire</p>
          </div>
          <p className="text-sm font-medium text-base-content/60">
            Tööriist, et käivita kooli häire signaali kaugelt.
          </p>
          {alarm && (
            <div className="flex animate-pulse items-start justify-start gap-4 rounded-lg border border-error p-4 text-error">
              <CircleAlert className="w-4 shrink-0" />
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">Häire on aktiivne!</h3>
                <p className="text-sm">
                  Häiresignaal on praegu aktiivne. Vajutage nuppu uuesti, et see välja lülitada.
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              if (alarm) {
                setAlarm(false)
                stopAudio()
                return
              }
              setModal(true)
            }}
            className={`btn ${alarm ? 'btn-error animate-pulse' : 'btn-outline'} btn-error btn-block`}
          >
            <Bell className="mr-2 h-5 w-5"></Bell>
            {alarm && <p>Peata häiresignaali</p>}
            {!alarm && <p>Käivita häiresignaal</p>}
          </button>
          <div className="border-base flex flex-1 flex-col gap-4 rounded-lg border p-4">
            <div>
              <p className="font-semibold">Häiresignaali tüüp</p>
              <p className="text-sm font-medium text-base-content/60">
                Vali sobiv häiresignaali tüüp
              </p>
            </div>
            <div className="flex h-0 grow flex-col gap-4 overflow-y-auto">
              <label
                htmlFor="alarm-type-1"
                className={`flex ${selectedAlarmType !== 'fire' ? 'cursor-pointer bg-base-100 hover:bg-base-200' : 'bg-base-200'} ${alarm && selectedAlarmType !== 'fire' && 'hidden'} border-base gap-4 rounded-lg border p-4 duration-200`}
              >
                <input
                  type="radio"
                  id="alarm-type-1"
                  className="radio radio-xs mt-1 cursor-default xl:mt-2"
                  checked={selectedAlarmType === 'fire'}
                  onChange={() => setSelectedAlarmType('fire')}
                />
                <div className="flex flex-col gap-1 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 shrink-0 text-red-500" />
                    <p>Tulekahju</p>
                  </div>
                  <p className="text-base-content/60">
                    Hädaolukorra signaal tulekahju korral, mis nõuab kohest evakueerimist
                  </p>
                </div>
              </label>
              <label
                htmlFor="alarm-type-2"
                className={`${selectedAlarmType !== 'evacuation' ? 'cursor-pointer bg-base-100 hover:bg-base-200' : 'bg-base-200'} ${alarm && selectedAlarmType !== 'evacuation' && 'hidden'} border-base flex gap-4 rounded-lg border p-4 duration-200`}
              >
                <input
                  type="radio"
                  id="alarm-type-2"
                  className="radio radio-xs mt-1 xl:mt-2"
                  checked={selectedAlarmType === 'evacuation'}
                  onChange={() => setSelectedAlarmType('evacuation')}
                />
                <div className="flex flex-col gap-1 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <LogOut className="w-5 shrink-0 text-amber-500" />
                    <p>Evakuatsioon</p>
                  </div>
                  <p className="text-base-content/60">
                    Kontrollitud evakuatsiooni signaal hoone tühjendamiseks
                  </p>
                </div>
              </label>
              <label
                htmlFor="alarm-type-3"
                className={`${selectedAlarmType !== 'attack' ? 'cursor-pointer bg-base-100 hover:bg-base-200' : 'bg-base-200'} ${alarm && selectedAlarmType !== 'attack' && 'hidden'} border-base flex gap-4 rounded-lg border p-4 duration-200`}
              >
                <input
                  type="radio"
                  id="alarm-type-3"
                  className="radio radio-xs mt-1 xl:mt-2"
                  checked={selectedAlarmType === 'attack'}
                  onChange={() => setSelectedAlarmType('attack')}
                />
                <div className="flex flex-col gap-1 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 shrink-0 text-blue-500" />
                    <p>Äkkrünnak</p>
                  </div>
                  <p className="text-base-content/60">
                    Kriitiline hoiatus koheste turvaohtude või hädaolukordade puhul
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
      <AlarmModal
        alarmType={selectedAlarmType}
        alarm={{ alarm, setAlarm }}
        modal={{ modal, setModal }}
      ></AlarmModal>
    </>
  )
}

export default Alarm
