import { CalendarCheck } from "lucide-react";
import React from "react";
import { daysEstonia } from "../table-actions";

interface PlanItemProps {
  activeDay: number;
  setActiveDay: React.Dispatch<React.SetStateAction<number>>;
}

const PlanItem = ({ activeDay, setActiveDay }: PlanItemProps) => {
  return (
    <>
      {daysEstonia.map((dayCurrent, index) => {
        return (
          <li className="flex-1" key={index}>
            <a
              onClick={() => setActiveDay(index)}
              className={`${index === activeDay ? "active" : ""} flex flex-col items-center gap-2`}
            >
              <CalendarCheck />
              <p className="uppercase md:hidden">{dayCurrent.slice(0, 1)}</p>
              <p className="hidden md:block">{dayCurrent}</p>
            </a>
          </li>
        );
      })}
    </>
  );
};

export default PlanItem;
