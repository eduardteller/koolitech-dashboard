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
    <div className="border-base flex w-full items-center justify-between rounded-lg border bg-base-100 p-4 duration-200 hover:bg-base-200 max-md:p-2">
      <div className="flex flex-1 flex-row items-center gap-4 overflow-hidden">
        <div className="bg-base flex-shrink-0 rounded-full p-3 max-md:p-2">
          <Clock className="h-5 w-5 text-base-content max-md:h-4 max-md:w-4" />
        </div>
        <div className="flex h-full w-full flex-col justify-between overflow-hidden">
          <p className="text-2xl font-bold text-base-content/80 max-md:text-xl">{time}</p>
          <h3 className="truncate text-lg font-bold max-md:text-base">{name}</h3>
          <p className="truncate text-sm max-md:hidden">{desc}</p>
        </div>
      </div>
      <div className="flex h-full flex-shrink-0 flex-row items-center gap-2">
        <button
          onClick={() => duplicateElement(element.id)}
          className="btn btn-square btn-outline input-bordered max-md:btn-sm"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCurrentElement(element.id)}
          className="btn btn-square btn-outline input-bordered max-md:btn-sm"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => deleteElement(element.id)}
          className="btn btn-square btn-error max-md:btn-sm"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default ScheduleList
