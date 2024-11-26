import { CalendarCheck } from 'lucide-react'
import React from 'react'
import { daysEstonia } from '../../table-actions'

interface PlanItemProps {
  activeDay: number
  setActiveDay: React.Dispatch<React.SetStateAction<number>>
}

const WeekdayMenuList = ({ activeDay, setActiveDay }: PlanItemProps): React.ReactElement => {
  return (
    <>
      {daysEstonia.map((dayCurrent, index) => {
        return (
          <li className="min-w-0 flex-1" key={index}>
            <a
              onClick={() => setActiveDay(index)}
              className={`${
                index === activeDay ? 'active' : ''
              } flex w-full flex-col items-center gap-2 px-2`}
            >
              <CalendarCheck className="shrink-0" />
              <p className="w-full truncate text-center uppercase md:hidden">
                {dayCurrent.slice(0, 1)}
              </p>
              <p className="hidden w-full truncate text-center md:block">{dayCurrent}</p>
            </a>
          </li>
        )
      })}
    </>
  )
}

export default WeekdayMenuList
