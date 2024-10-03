import { ChangeEvent, useEffect, useState } from "react";

interface TimeProps {
  onTimeChange: (
    time: { hours: string; minutes: string },
    index: number,
  ) => void;
  index: number;
  initial: string;
  error: boolean;
}

const TimePicker = ({ onTimeChange, index, initial, error }: TimeProps) => {
  const [time, setTime] = useState({
    hours: initial.split(":")[0] ?? "",
    minutes: initial.split(":")[1] ?? "",
  });

  useEffect(() => {
    onTimeChange(time, index);
  }, [time]);

  const handleHours = (e: ChangeEvent<HTMLInputElement>) => {
    if (isNaN(Number(e.target.value))) {
      return; // Exit if the input is not a number
    }
    let value = parseInt(e.target.value);

    if (value > 23) value = 23;
    if (value <= 0) value = 0;
    let valueNew = value.toString();
    if (value < 10) valueNew = `0${value}`;
    setTime({ ...time, hours: valueNew });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    const length = e.target.value.length;
    e.target.setSelectionRange(length, length);
  };

  const handleMinutes = (e: ChangeEvent<HTMLInputElement>) => {
    if (isNaN(Number(e.target.value))) {
      return; // Exit if the input is not a number
    }
    let value = parseInt(e.target.value);
    if (value > 59) value = 59;
    if (value <= 0) value = 0;
    let valueNew = value.toString();
    if (value < 10) valueNew = `0${value}`;
    setTime({ ...time, minutes: valueNew });
  };
  return (
    <div
      className={`flex w-full items-center justify-center p-4 ${error ? "bg-error text-error-content" : ""}`}
    >
      <input
        value={time.hours}
        onChange={handleHours}
        className="w-8 rounded-sm bg-base-200 px-1 caret-transparent"
        placeholder="00"
        type="text"
        onFocus={handleFocus}
      />
      <span className="mx-1 text-xl sm:mx-2">:</span>
      <input
        onChange={handleMinutes}
        value={time.minutes}
        className="w-8 rounded-sm bg-base-200 px-1 caret-transparent"
        placeholder="00"
        type="text"
        onFocus={handleFocus}
      />
    </div>
  );
};

export default TimePicker;
