import { useRef } from "react";
import { days, ErrorMatrix, TableData, TableElement } from "../table-actions";
import TimePicker from "./TimePicker";

interface Props {
  day: number;
  tableData: TableData;
  errorState: ErrorMatrix;
  setTableData: (data: TableData) => void;
}

const Table = ({ day, tableData, setTableData, errorState }: Props) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  //handle name or description change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof TableElement,
  ) => {
    //set new data to the data array
    const newTableData = { ...tableData };
    newTableData[days[day]][index] = {
      ...tableData[days[day]][index],
      [field]: e.target.value,
    };
    setTableData(newTableData);

    // This shit is ugly but works, refocus on the cell when rerendered [name]
    if (field === "name") {
      setTimeout(() => {
        inputRefs.current[index]?.focus();
      }, 0);
    }
  };

  //Pass this function to the time component, fires on change
  const handleTimeChange = (
    newTime: { hours: string; minutes: string },
    index: number,
  ) => {
    const time = `${newTime.hours}:${newTime.minutes}`;
    const newTableData = { ...tableData };
    newTableData[days[day]][index] = {
      ...tableData[days[day]][index],
      time: time,
    };
    setTableData(newTableData);
  };

  if (day < 0 || !tableData[days[day]].length)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="rounded-xl bg-base-200 p-4 text-xl font-bold">
          Andmeid veel ei ole!
        </div>
      </div>
    );
  return (
    <div className="h-full overflow-y-auto border-base-content/20 bg-base-100 p-4">
      <table aria-label="monday" className="w-full">
        <thead className="w-full">
          <tr>
            <th className="list-table-h-tail w-1/4">Nimi</th>
            <th className="list-table-h-tail w-1/4">Aeg</th>
            <th className="list-table-h-tail w-1/4">Kirjeldus</th>
            <th className="list-table-h-tail w-1/4">Helifail</th>
          </tr>
        </thead>
        <tbody>
          {tableData[days[day]].map((element, index) => {
            return (
              <tr key={element.name + index + day}>
                <td className="list-table-tail">
                  <input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    onChange={(e) => handleInputChange(e, index, "name")}
                    value={element.name}
                    className={`h-full w-full p-4 ${errorState[days[day]][index]?.[0] ? "bg-error text-error-content" : ""}`}
                  ></input>
                </td>
                <td className="list-table-tail">
                  <TimePicker
                    error={errorState[days[day]][index]?.[1]}
                    initial={tableData[days[day]][index].time}
                    index={index}
                    onTimeChange={handleTimeChange}
                  />
                </td>
                <td className="list-table-tail">
                  <input
                    onChange={(e) => handleInputChange(e, index, "description")}
                    value={element.description}
                    className={`h-full w-full p-4 ${errorState[days[day]][index]?.[2] ? "bg-error text-error-content" : ""}`}
                  ></input>
                </td>
                <td
                  contentEditable={false}
                  className="list-table-tail bg-base-200 p-4"
                >
                  {element.audio}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
