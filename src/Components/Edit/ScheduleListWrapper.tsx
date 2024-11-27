import { days, PlanData } from '../../interfaces'
import ScheduleList from './ScheduleList'

interface Props {
  day: number
  tableData: PlanData
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => void
  setCurrentElement: (index: string | null) => void
}

const ScheduleListWrapper = ({
  day,
  tableData,
  setCurrentElement,
  deleteElement,
  duplicateElement
}: Props): React.ReactElement => {
  if (!tableData[days[day]].length)
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-lg font-bold text-base-content/60">
          Sellel päeval pole ühtegi kellaaega määratud
        </div>
      </div>
    )

  return (
    <>
      {tableData[days[day]].map((element, index) => {
        return (
          <ScheduleList
            key={index}
            setCurrentElement={setCurrentElement}
            element={element}
            deleteElement={deleteElement}
            duplicateElement={duplicateElement}
          ></ScheduleList>
        )
      })}
    </>
  )
}

export default ScheduleListWrapper
