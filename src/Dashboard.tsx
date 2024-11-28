import axios from 'axios'
import {
  Bell,
  Calendar,
  CalendarClock,
  CirclePlus,
  Clock,
  LayoutDashboard,
  NotepadText,
  Pencil,
  SlidersHorizontal
} from 'lucide-react'
import { ReactElement, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Plans } from './table-actions'

const daysToEstonian: { [key: string]: string } = {
  Monday: 'Esmaspäev',
  Tuesday: 'Teisipäev',
  Wednesday: 'Kolmapäev',
  Thursday: 'Neljapäev',
  Friday: 'Reede',
  Saturday: 'Laupäev',
  Sunday: 'Pühapäev'
}

const Dashboard = (): ReactElement => {
  const [times, setTimes] = useState<{
    plan: string
    day: string
    times: { time: string; name: string }[]
  } | null>(null)
  const [plans, setPlans] = useState<Plans | null>(null)
  const [reload, setReload] = useState(false)

  const handleEnablePlan = async (plan: string): Promise<void> => {
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/plan/enable`,
        {
          plan: plan
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )

      if (resp.status !== 200) {
        throw new Error('Failed to duplicate plan')
      }

      setReload(!reload)
    } catch (error) {
      toast.error('Plaani aktiveerimine ebaõnnestus')
      console.error(error)
    }
  }

  const fetchDashboardData = async (): Promise<string | null> => {
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/plan/list`, {
      withCredentials: true
    })

    const data = res.data as Plans

    if (data) {
      setPlans(data as Plans)
    }

    return data.enabled
  }

  const fetchTimes = async (plan: string | null): Promise<void> => {
    if (!plan) return
    const day = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase()

    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/times?plan=${plan}&day=${day}`,
      {
        withCredentials: true
      }
    )

    const data = res.data as {
      plan: string
      day: string
      times: { time: string; name: string }[]
    }

    if (data) {
      setTimes(data)
    }
  }

  useEffect(() => {
    fetchDashboardData().then((plan) => {
      fetchTimes(plan)
    })
  }, [reload])

  if (!times || !plans)
    return (
      <div className="mx-auto h-full max-w-5xl p-4 xl:p-8">
        <div className="flex h-full flex-col gap-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <LayoutDashboard size={24} />
            Töölaud
          </h1>
          <div className="flex h-full w-full flex-row gap-4">
            <div className="border-base card flex h-full w-[50%] flex-col rounded-xl border bg-base-100 p-6"></div>
            <div className="flex h-full max-h-full w-[50%] flex-col gap-4">
              <div className="border-base card h-fit w-full gap-4 rounded-xl border bg-base-100 p-6"></div>
              <div className="border-base card flex h-full w-full flex-col rounded-xl border bg-base-100 p-6"></div>
            </div>
          </div>
        </div>
      </div>
    )

  return (
    <div className="mx-auto h-full max-w-5xl p-4 xl:p-8">
      <div className="flex h-full flex-col gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <LayoutDashboard size={24} />
          Töölaud
        </h1>
        <div className="flex h-full w-full flex-row gap-4">
          <div className="border-base card flex h-full w-[50%] flex-col rounded-xl border bg-base-100 p-6">
            <div className="pb-2">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <CalendarClock />
                Tänane ajakava
              </h2>
              <h3 className="w-full truncate text-sm font-medium text-base-content/60">
                Plaan: {times.plan} • Nädalapäev: {daysToEstonian[times.day]}
              </h3>
            </div>
            {times.times.length < 1 && (
              <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
                <div className="text-lg font-bold text-base-content/60">Plaan on tühi</div>
              </div>
            )}
            {times.times.length > 0 && (
              <div className="flex h-0 w-full grow flex-col gap-4 overflow-auto py-4 text-lg">
                {times.times.map((entry, index) => (
                  <div
                    key={index}
                    className="border-base flex max-w-full shrink-0 items-center gap-4 rounded-lg border p-3 duration-200 hover:bg-base-200"
                  >
                    <div className="bg-base flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                      <Clock className="h-5 w-5 text-base-content" />
                    </div>
                    <div className="max-w-[80%]">
                      <p className="font-semibold">{entry.time}</p>
                      <p className="truncate text-sm">{entry.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex h-full max-h-full w-[50%] flex-col gap-4">
            <div className="border-base card h-fit w-full gap-4 rounded-xl border bg-base-100 p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <SlidersHorizontal />
                Kiired toimingud
              </h2>

              <div className="flex flex-col items-center gap-2">
                <div className="border-base flex w-full flex-col gap-2 rounded-lg border p-4">
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      <Calendar className="w-4" />
                      Aktiivne plaan
                    </p>
                    <p className="text-sm font-medium text-base-content/60">
                      Muuda aktiivset plaani
                    </p>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <Clock className="h-4 w-4" />
                    </div>
                    <select
                      defaultValue={plans.enabled}
                      onChange={(e) => {
                        handleEnablePlan(e.target.value)
                      }}
                      className="select input-bordered w-full rounded-lg pl-9"
                    >
                      {plans.plans.map((plan, i) => (
                        <option key={plan.name + i}>{plan.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Link to={'/edit'} className="btn btn-neutral btn-block space-x-2">
                  <CirclePlus size={16} />
                  Lisa/Muuda plaan
                </Link>
                <Link to={'/alarm'} className="btn btn-outline btn-error btn-block space-x-2">
                  <Bell className="w-4"></Bell>
                  Häiresüsteem
                </Link>
              </div>
            </div>
            <div className="border-base card flex h-full w-full flex-col rounded-xl border bg-base-100 p-6">
              <h2 className="flex items-center gap-2 pb-4 text-xl font-bold">
                <NotepadText />
                Plaanide ülevaade
              </h2>
              <div className="flex h-0 grow flex-col gap-2 overflow-y-auto">
                {plans.plans.map((plan, i) => (
                  <div
                    key={i} // Ensure each plan has a unique 'id'
                    className={`${plans.enabled === plan.name ? 'bg-base-200' : 'bg-base-100 hover:bg-base-200'} border-base flex shrink-0 flex-row items-center justify-between overflow-hidden rounded-lg border p-3 duration-200`}
                  >
                    {/* Plan Name Section */}
                    <div className="flex items-center gap-2 truncate">
                      <Calendar className="h-4 w-4 flex-none shrink-0" />
                      <span className="truncate font-medium">{plan.name}</span>
                    </div>

                    {/* Action Section */}
                    <div className="flex shrink-0 items-center">
                      {plans.enabled === plan.name && (
                        <p className="truncate pr-1 text-sm font-medium text-base-content/60">
                          Aktiivne
                        </p>
                      )}

                      <Link
                        to={'/edit'}
                        state={{ plan: plan.name }}
                        className="btn btn-ghost btn-sm flex items-center"
                      >
                        <Pencil className="w-4" />
                        Muuda
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
