import axios from 'axios'
import { NotepadText, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PlanData, PlanElement, days, daysEstonia } from '../../table-actions'
import ScheduleListModal from './ScheduleListModal'
import PlanDataWrapper from './ScheduleListWrapper'

interface Props {
  activeDay: number
  activePlan: string
}

const emptyPlan: PlanData = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: []
}

const TableWrapper = ({ activeDay, activePlan }: Props): React.ReactElement => {
  const [tableData, setTableData] = useState<PlanData>({ ...emptyPlan })
  const [currentElement, setCurrentElement] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [reload, setReload] = useState<boolean>(false)
  const [reloadModal, setReloadModal] = useState<boolean>(false) // yes shits nasty but it works

  const showTheModal = (vari: string | null): void => {
    setCurrentElement(vari)
    setReloadModal(!reloadModal)
    ;(document.getElementById('timesListModal') as HTMLDialogElement).showModal()
  }

  const deleteElement = async (id: string): Promise<void> => {
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/plan-data/delete`,
        { id: id },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      if (resp.status !== 200) {
        toast.error('Elementi kustutamine ebaõnnestus')
        throw new Error('Failed to delete element')
      }
      toast.success('Element on kustutatud')
      setReload(!reload)
      ;(document.getElementById('timesListModal') as HTMLDialogElement)?.close()
    } catch (error) {
      console.error(error)
    }
  }

  const duplicateElement = async (id: string): Promise<void> => {
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/plan-data/duplicate`,
        { id: id },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      if (resp.status !== 200) {
        toast.error('Elementi kopeerimine ebaõnnestus')
        throw new Error('Failed to copy element')
      }
      toast.success('Element on kopeeritud')
      setReload(!reload)
      ;(document.getElementById('timesListModal') as HTMLDialogElement)?.close()
    } catch (error) {
      console.error(error)
    }
  }

  const createElement = async (data: PlanElement): Promise<void> => {
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/plan-data/create`,
        { plan: activePlan, day: days[activeDay], data: data },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      if (resp.status !== 200) {
        toast.error('Elementi loomine ebaõnnestus')
        throw new Error('Failed to create element')
      }
      toast.success('Element on loodud')
      setReload(!reload)
      ;(document.getElementById('timesListModal') as HTMLDialogElement)?.close()
    } catch (error) {
      console.error(error)
    }
  }

  const updateElement = async (data: PlanElement): Promise<void> => {
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/plan-data/update`,
        { data: data },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      if (resp.status !== 200) {
        toast.error('Elementi update ebaõnnestus')
        throw new Error('Failed to updated element')
      }
      toast.success('Element updated')
      setReload(!reload)
      ;(document.getElementById('timesListModal') as HTMLDialogElement)?.close()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true)
      const resp = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/plan-data/fetch?plan=${activePlan}`,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )

      if (resp.status !== 200) {
        throw new Error('Failed to fetch data')
      }
      // console.log(resp.data)
      setTableData(resp.data.data as PlanData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activePlan, reload])

  if (loading)
    return (
      <div className="border-base card flex w-full flex-1 flex-col items-center justify-center gap-4 overflow-hidden border bg-base-100 p-4">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    )

  if (!activePlan)
    return (
      <div className="border-base card flex w-full flex-1 flex-col items-center justify-center overflow-hidden border bg-base-100 p-4">
        <div className="flex h-full flex-col items-center justify-center gap-8 px-16 text-center text-lg font-bold text-base-content/60">
          <NotepadText size={72} className="opacity-60" />
          <p>
            Vali olemasolev plaan või loo uus plaan, et alustada kella aegade seadistamist.
          </p>{' '}
        </div>
      </div>
    )

  return (
    <>
      <div className="border-base card flex flex-1 flex-col gap-4 overflow-hidden rounded-lg border bg-base-100 p-4">
        <h1 className="border-base border-b p-4 text-center text-xl font-bold uppercase">
          {activePlan}
          {' - '}
          {daysEstonia[activeDay]}
        </h1>
        <div className="mx-auto flex h-0 w-full max-w-3xl grow flex-col gap-4 overflow-y-auto">
          <PlanDataWrapper
            day={activeDay}
            tableData={tableData}
            deleteElement={deleteElement}
            duplicateElement={duplicateElement}
            setCurrentElement={showTheModal}
          />
        </div>

        <div className="border-base flex flex-row items-center justify-center gap-2 border-t pt-4">
          <button
            onClick={() => {
              showTheModal(null)
            }}
            className="btn-base btn btn-wide"
          >
            <Plus className="mr-2 w-5" />
            Lisa Uus
          </button>
        </div>
      </div>
      <ScheduleListModal
        currentElement={currentElement}
        day={activeDay}
        tableData={tableData}
        create={createElement}
        update={updateElement}
        reload={reloadModal}
      />
    </>
  )
}

export default TableWrapper
