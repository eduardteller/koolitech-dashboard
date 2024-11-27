import { Clock, Copy, Edit, Trash2 } from 'lucide-react'
import { ReactElement } from 'react'
import { PlanElement } from '../../table-actions'

interface Props {
  element: PlanElement
  setCurrentElement: (index: string | null) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => void
}

const ScheduleList = ({
  element,
  setCurrentElement,
  deleteElement,
  duplicateElement
}: Props): ReactElement => {
  const { name, time, desc } = element
  return (
    <div className="border-base flex h-28 w-full items-center justify-between rounded-lg border bg-base-100 p-4 duration-200 hover:bg-base-200">
      <div className="flex flex-1 flex-row items-center gap-4 overflow-hidden">
        <div className="bg-base flex-shrink-0 rounded-full p-3">
          <Clock className="h-5 w-5 text-base-content" />
        </div>
        <div className="flex h-full w-full flex-col justify-between overflow-hidden py-4">
          <p className="text-2xl font-bold text-base-content/80">{time}</p>
          <h3 className="truncate text-lg font-bold">{name}</h3>
          <p className="truncate text-sm">{desc}</p>
        </div>
      </div>
      <div className="flex h-full flex-shrink-0 flex-row items-center gap-2">
        <button
          onClick={() => duplicateElement(element.id)}
          className="btn btn-square btn-outline input-bordered"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCurrentElement(element.id)}
          className="btn btn-square btn-outline input-bordered"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={() => deleteElement(element.id)} className="btn btn-square btn-error">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default ScheduleList
