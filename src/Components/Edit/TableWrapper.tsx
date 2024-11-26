import axios from 'axios'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PlanData, PlanElement, daysEstonia } from '../../table-actions'
import ScheduleListModal from './ScheduleListModal'
import TimesList from './ScheduleListWrapper'

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
  const [currentElement, setCurrentElement] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [reload, setReload] = useState<boolean>(false)
  const [reloadModal, setReloadModal] = useState<boolean>(false) // yes shits nasty but it works

  const showTheModal = (vari: number | null): void => {
    setCurrentElement(vari)
    setReloadModal(!reloadModal)
    ;(document.getElementById('timesListModal') as HTMLDialogElement).showModal()
  }

  const deleteElement = async (id: string): Promise<void> => {
    // const resp = await window.api.deletePlanElement(activePlan, id)
    // if (resp.status !== 200) {
    //   toast.error('Elementi kustutamine ebaõnnestus')
    //   return
    // }
    // toast.success('Element on kustutatud')
    // setReload(!reload)
  }

  const duplicateElement = async (id: string): Promise<void> => {
    // const resp = await window.api.duplicatePlanElement(activePlan, id)
    // if (!resp) {
    //   toast.error('Elementi dubleerimine ebaõnnestus')
    //   return
    // }
    // toast.success('Element on dubleeritud')
    // setReload(!reload)
  }

  const createElement = async (data: PlanElement): Promise<void> => {
    // const resp = await window.api.createPlanElement(activePlan, days[activeDay], data)
    // if (!resp) {
    //   toast.error('Elementi loomine ebaõnnestus')
    //   return
    // }
    // toast.success('Element on loodud')
    // setReload(!reload)
    // ;(document.getElementById('timesListModal') as HTMLDialogElement)?.close()
  }

  const updateElement = async (data: PlanElement): Promise<void> => {
    // const resp = await window.api.updatePlanElement(activePlan, data)
    // if (!resp) {
    //   toast.error('Elementi uuendamine ebaõnnestus')
    //   return
    // }
    // toast.success('Element on uuendatud')
    // setReload(!reload)
    // ;(document.getElementById('timesListModal') as HTMLDialogElement)?.close()
  }

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true)
      const resp = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/plan-data?plan=${activePlan}`,
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
        <div className="text-center text-lg font-bold text-base-content/60">
          <p>Vali olemasolev plaan või loo uus plaan, et alustada kella aegade seadistamist.</p>{' '}
        </div>
      </div>
    )

  return (
    <>
      <div className="border-base card flex h-full flex-col gap-4 overflow-hidden rounded-lg border bg-base-100 p-4">
        <h1 className="border-base border-b p-4 text-center text-xl font-bold uppercase">
          {activePlan}
          {' - '}
          {daysEstonia[activeDay]}
        </h1>
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 overflow-y-auto">
          <TimesList
            deleteElement={deleteElement}
            duplicateElement={duplicateElement}
            setCurrentElement={showTheModal}
            tableData={tableData}
            day={activeDay}
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
        setReload={setReloadModal}
      />
    </>
  )
}

export default TableWrapper
