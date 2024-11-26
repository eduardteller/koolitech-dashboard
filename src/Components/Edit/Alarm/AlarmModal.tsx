import { ReactElement } from 'react'

interface Props {
  modal: { modal: boolean; setModal: (modal: boolean) => void }
  alarm: { alarm: boolean; setAlarm: (alarm: boolean) => void }
  alarmType: string
}

const AlarmModal = ({ modal: { modal, setModal }, alarm, alarmType }: Props): ReactElement => {
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
          <button
            onClick={() => {
              setModal(false)
              alarm.setAlarm(true)
              window.api.startAlarm(alarmType)
            }}
            className="btn btn-error"
          >
            Aktiveeri
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default AlarmModal
