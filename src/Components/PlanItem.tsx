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
          <li key={index}>
            <a
              onClick={() => setActiveDay(index)}
              className={`${index === activeDay ? "active" : ""} flex flex-col items-center gap-2 max-[640px]:w-14 max-[420px]:w-12 max-[390px]:w-10 sm:w-20 md:w-24`}
            >
              <CalendarCheck />
              <p className="uppercase sm:text-lg md:hidden">
                {dayCurrent.slice(0, 1)}
              </p>
              <p className="hidden md:block">{dayCurrent}</p>
            </a>
          </li>
        );
      })}
    </>
  );
};

export default PlanItem;
