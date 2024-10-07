import { z } from "zod";

export const daysEstonia = [
  "Esmaspäev",
  "Teisipäev",
  "Kolmapäev",
  "Neljapäev",
  "Reede",
  "Laupäev",
  "Pühapäev",
];

export const days: (keyof TableData)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export interface TableElement {
  name: string;
  time: string;
  desc: string;
  audio: string;
}

export interface TableData {
  monday: TableElement[];
  tuesday: TableElement[];
  wednesday: TableElement[];
  thursday: TableElement[];
  friday: TableElement[];
  saturday: TableElement[];
  sunday: TableElement[];
}

export interface ErrorMatrix {
  monday: boolean[][];
  tuesday: boolean[][];
  wednesday: boolean[][];
  thursday: boolean[][];
  friday: boolean[][];
  saturday: boolean[][];
  sunday: boolean[][];
}

// Create a Zod schema for TableElement
export const TableElementSchema = z.object({
  name: z.string().min(1, "Nimi puudu!").max(50, "Nimi on liiga pikk"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Aeg peab olema formaadis HH:MM"),
  desc: z
    .string()
    .min(1, "Kirjeldus puudu!")
    .max(100, "Kirjeldus on liiga pikk"),
  audio: z.optional(z.string()),
});
