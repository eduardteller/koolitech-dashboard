import { Edit, Plus } from 'lucide-react'
import { ReactElement, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { PlanData, PlanElement, days } from '../../table-actions'
import TimePicker from './TimePicker'

interface Props {
  currentElement: string | null
  tableData: PlanData
  day: number
  create: (data: PlanElement) => void
  update: (data: PlanElement) => void
  reload: boolean
}

const ScheduleListModal = ({
  currentElement,
  tableData,
  day,
  create,
  update,
  reload
}: Props): ReactElement => {
  const [name, setName] = useState('')
  const [time, setTime] = useState('')
  const [desc, setDesc] = useState('')
  const [audio, setAudio] = useState('')

  const scheduleElementSchema = z.object({
    name: z
      .string()
      .min(2, 'Nimi peab olema vähemalt 2 tähemärki pikk')
      .max(50, 'Nimi ei tohi olla pikem kui 50 tähemärki'),

    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Aeg peab olema formaadis HH:MM'),

    desc: z
      .string()
      .min(2, 'Kirjeldus peab olema vähemalt 2 tähemärki pikk')
      .max(200, 'Kirjeldus ei tohi olla pikem kui 200 tähemärki'),

    audio: z.string().min(1, 'Heli fail peab olema valitud')
  })

  type ScheduleElement = z.infer<typeof scheduleElementSchema>

  const handleSubmit = (): void => {
    const formData: ScheduleElement = { name, time, desc, audio }
    const result = scheduleElementSchema.safeParse(formData)
    if (!result.success) {
      toast.error(result.error.errors[0].message)
      return
    }
    if (currentElement === null) {
      create({ id: '', name, time, desc, audio })
    } else {
      update({ id: currentElement, name, time, desc, audio })
    }
  }

  useEffect(() => {
    if (currentElement === null) {
      setName('')
      setTime('')
      setDesc('')
      setAudio('default')
      return
    }
    const element = tableData[days[day]].find(
      (element) => element.id === currentElement
    ) as PlanElement
    setName(element.name)
    setTime(element.time)
    setDesc(element.desc)
    setAudio(element.audio === 'Vaikimisi' ? 'default' : element.audio)
  }, [reload])
  return (
    <>
      <dialog id="timesListModal" className="modal">
        <div className="modal-box h-fit w-1/2">
          <form method="dialog">
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
          </form>
          <div className="flex h-full w-full flex-col justify-between gap-4">
            <h3 className="border-base w-full border-b pb-2 text-xl font-bold">
              {currentElement === null ? 'Lisa uus' : 'Muuda'} element
            </h3>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Nimi"
              className="input input-bordered w-full"
            />
            <TimePicker value={time} onChange={setTime}></TimePicker>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="textarea textarea-bordered min-h-20 w-full resize-none"
              placeholder="Kirjeldus"
            ></textarea>
            <button onClick={handleSubmit} className="btn-base btn btn-block">
              {currentElement === null ? (
                <Plus className="mr-2 w-5" />
              ) : (
                <Edit className="mr-2 w-5" />
              )}

              {currentElement === null ? 'Lisa' : 'Muuda'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default ScheduleListModal
