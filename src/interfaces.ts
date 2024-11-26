import { z } from 'zod'

export const days: (keyof PlanData)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]

export const daysEstonia = [
  'Esmaspäev',
  'Teisipäev',
  'Kolmapäev',
  'Neljapäev',
  'Reede',
  'Laupäev',
  'Pühapäev'
]

export interface PlanName {
  name: string
}

export interface Plans {
  plans: PlanName[]
  enabled: string
  active: string
}

export interface PlanElement {
  id: string
  name: string
  time: string
  desc: string
  audio: string
}

export interface PlanData {
  monday: PlanElement[]
  tuesday: PlanElement[]
  wednesday: PlanElement[]
  thursday: PlanElement[]
  friday: PlanElement[]
  saturday: PlanElement[]
  sunday: PlanElement[]
}

export interface ErrorMatrix {
  monday: boolean[][]
  tuesday: boolean[][]
  wednesday: boolean[][]
  thursday: boolean[][]
  friday: boolean[][]
  saturday: boolean[][]
  sunday: boolean[][]
}

// Create a Zod schema for TableElement
export const TableElementSchema = z.object({
  name: z.string().min(1, 'Nimi puudu!').max(50, 'Nimi on liiga pikk'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Aeg peab olema formaadis HH:MM'),
  desc: z.string().min(1, 'Kirjeldus puudu!').max(100, 'Kirjeldus on liiga pikk'),
  audio: z.optional(z.string())
})
