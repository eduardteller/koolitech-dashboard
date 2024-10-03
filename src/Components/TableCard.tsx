import { CirclePlus, CircleX, Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  ErrorMatrix,
  TableData,
  TableElement,
  TableElementSchema,
  days,
  daysEstonia,
} from "../table-actions";
import Table from "./Table";

interface Props {
  activeDay: number;
  activePlan: string;
}

const testData = {
  monday: [
    {
      name: "1. Tund",
      time: "12:12",
      description: "1. Tund",
      audio: "1. Tund",
    },
    {
      name: "2. Tund",
      time: "13:13",
      description: "2. Tund",
      audio: "2. Tund",
    },
  ],
  tuesday: [],
  wednesday: [
    {
      name: "3. Tund",
      time: "13:13",
      description: "3. Tund",
      audio: "3. Tund",
    },
    {
      name: "3. Tund",
      time: "13:13",
      description: "3. Tund",
      audio: "3. Tund",
    },
  ],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

const initialErrorMatrix = {
  monday: Array.from({ length: testData.monday.length }, () =>
    Array(3).fill(false),
  ),
  tuesday: Array.from({ length: testData.tuesday.length }, () =>
    Array(3).fill(false),
  ),
  wednesday: Array.from({ length: testData.wednesday.length }, () =>
    Array(3).fill(false),
  ),
  thursday: Array.from({ length: testData.thursday.length }, () =>
    Array(3).fill(false),
  ),
  friday: Array.from({ length: testData.friday.length }, () =>
    Array(3).fill(false),
  ),
  saturday: Array.from({ length: testData.saturday.length }, () =>
    Array(3).fill(false),
  ),
  sunday: Array.from({ length: testData.sunday.length }, () =>
    Array(3).fill(false),
  ),
};

const TableCard = ({ activeDay, activePlan }: Props) => {
  const [tableData, setTableData] = useState<TableData>({ ...testData });
  const [loading, setLoading] = useState(true);
  const [errorState, setError] = useState<ErrorMatrix>({
    ...initialErrorMatrix,
  });
  //Push to the current day table
  const addNewRow = () => {
    const newTableData = { ...tableData };
    const newErrorMatrix = { ...errorState };

    newTableData[days[activeDay]].push({
      name: "",
      time: "",
      description: "",
      audio: "Vaikimisi",
    });
    newErrorMatrix[days[activeDay]].push([false, false, false]);

    setTableData(newTableData);
    setError(newErrorMatrix);
  };

  //Pop last row of current day table
  const removeRow = () => {
    const newTableData = { ...tableData };
    const newErrorMatrix = { ...errorState };

    newTableData[days[activeDay]].pop();
    newErrorMatrix[days[activeDay]].pop();

    setTableData(newTableData);
    setError(newErrorMatrix);
  };

  const errorCheckTable = (): boolean => {
    const error: {
      error: z.ZodError<{
        name: string;
        time: string;
        description: string;
        audio?: string | undefined;
      }>;
      index: number;
    }[] = [];
    const errorMatrixNew = errorState[days[activeDay]].map(() => [
      false,
      false,
      false,
    ]);

    //Parse the rows and record errors to array
    for (const value of tableData[days[activeDay]]) {
      const errorNew = TableElementSchema.safeParse(value);
      if (!errorNew.success)
        error.push({
          error: errorNew.error,
          index: tableData[days[activeDay]].indexOf(value),
        });
    }

    //if no errors then clear errorMatrix and return success
    if (error.length <= 0) {
      toast.success("Andmed on korrektsed");
      setError({
        ...errorState,
        [days[activeDay]]: Array.from(
          { length: tableData[days[activeDay]].length },
          () => Array(3).fill(false),
        ),
      });
      return true;
    }

    //If errros then set the error matrix
    const errorMessage: string[] = [];
    for (const item of error) {
      const errorDict = ["name", "time", "description", "audio"];
      item.error.errors.forEach((err) => {
        const field = err.path[0] as keyof TableElement;
        const fieldIndex = errorDict.indexOf(field);
        if (fieldIndex !== -1) {
          errorMatrixNew[item.index][fieldIndex] = true;
        }
        errorMessage.push(err.message);
      });
    }

    //Create a array, where each message is unique and then show toasts
    [...new Set(errorMessage)].forEach((error) => toast.error(error));
    setError({ ...errorState, [days[activeDay]]: errorMatrixNew });

    return false;
  };

  interface ApiData {
    Nimi: string;
    Aeg: string;
    Kirjeldus: string;
    Helifail: string;
    Id: number;
  }

  useEffect(() => {
    const url = import.meta.env.VITE_BASE_URLL;
    console.log(activePlan);

    setLoading(true);
    fetch(url + "/api/preset-data?name=" + activePlan, {
      method: "GET",
    })
      .then((response) => {
        response.json().then((data) => {
          console.log(data);
          const innerData = data.data;
          // setPlans({ ...data });
          setTableData({
            monday: innerData.Mondays.map((item: ApiData) => {
              return {
                name: item.Nimi,
                time: item.Aeg ?? "",
                audio: item.Helifail,
                description: item.Kirjeldus,
              };
            }),

            tuesday: innerData.Tuesdays.map((item: ApiData) => {
              return {
                name: item.Nimi,
                time: item.Aeg ?? "",
                audio: item.Helifail,
                description: item.Kirjeldus,
              };
            }),

            wednesday: innerData.Wednesdays.map((item: ApiData) => {
              return {
                name: item.Nimi,
                time: item.Aeg ?? "",
                audio: item.Helifail,
                description: item.Kirjeldus,
              };
            }),

            thursday: innerData.Thursdays.map((item: ApiData) => {
              return {
                name: item.Nimi,
                time: item.Aeg ?? "",
                audio: item.Helifail,
                description: item.Kirjeldus,
              };
            }),

            friday: innerData.Fridays.map((item: ApiData) => {
              return {
                name: item.Nimi,
                time: item.Aeg ?? "",
                audio: item.Helifail,
                description: item.Kirjeldus,
              };
            }),
            saturday: innerData.Saturdays.map((item: ApiData) => {
              return {
                name: item.Nimi,
                time: item.Aeg ?? "",
                audio: item.Helifail,
                description: item.Kirjeldus,
              };
            }),

            sunday: innerData.Sundays.map((item: ApiData) => {
              return {
                name: item.Nimi,
                time: item.Aeg ?? "",
                audio: item.Helifail,
                description: item.Kirjeldus,
              };
            }),
          });
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activePlan]);

  if (loading)
    return (
      <div className="card flex h-[640px] w-full flex-col items-center justify-center gap-4 overflow-hidden border border-base-content/20 bg-base-100 p-4 lg:mr-60">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );

  return (
    <div className="card flex h-[640px] w-full flex-col items-center justify-between gap-4 overflow-hidden border border-base-content/20 bg-base-100 p-4 lg:mr-60">
      <h1 className="mt-4 text-center text-xl font-bold uppercase">
        {"Tavaplaan - "}
        {daysEstonia[activeDay]}
      </h1>
      <div className="w-full flex-1 overflow-x-auto rounded-sm border border-base-content/20">
        <Table
          tableData={tableData}
          setTableData={setTableData}
          errorState={errorState}
          day={activeDay}
        />
      </div>

      <div className="flex w-full flex-row items-center justify-center gap-2">
        <button
          onClick={() => errorCheckTable()}
          className="btn btn-secondary min-[468px]:w-32"
        >
          <p className="max-[468px]:hidden">Salvesta</p> <Save />
        </button>
        <button
          onClick={() => addNewRow()}
          className="btn btn-secondary min-[468px]:w-32"
          id="row-btn"
        >
          <p className="max-[468px]:hidden">Lisa </p> <CirclePlus />
        </button>
        <button
          onClick={() => removeRow()}
          className="btn btn-secondary min-[468px]:w-32"
          id="delete-btn"
        >
          <p className="max-[468px]:hidden">Kustuta </p> <CircleX />
        </button>
      </div>
    </div>
  );
};

export default TableCard;
