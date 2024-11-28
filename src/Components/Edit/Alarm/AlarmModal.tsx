import axios from 'axios'
import { ReactElement } from 'react'

interface Props {
  modal: { modal: boolean; setModal: (modal: boolean) => void }
  alarm: { alarm: boolean; setAlarm: (alarm: boolean) => void }
  alarmType: string
}

const AlarmModal = ({ modal: { modal, setModal }, alarm, alarmType }: Props): ReactElement => {
  const handleAlarm = async () => {
    const resp = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/alarm-start?type=${alarmType}`,
      {
        withCredentials: true
      }
    )

    if (resp.status === 200) {
      setModal(false)
      alarm.setAlarm(true)
    }
  }

  return (
    <dialog className={`modal ${modal ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="border-base border-base border-b pb-2 text-xl font-bold">
          Kinnita häiresignaali aktiveerimine
        </h3>
        <p className="py-4">Kas olete kindel, et soovite häiresignaali aktiveerida?</p>
        <div className="modal-action">
          {/* if there is a button in form, it will close the modal */}
          <button onClick={() => setModal(false)} className="btn">
            Tühista
          </button>
          <button onClick={handleAlarm} className="btn btn-error">
            Aktiveeri
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default AlarmModal
