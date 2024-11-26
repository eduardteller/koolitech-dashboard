import axios from 'axios'
import { CirclePlus, NotepadText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Plans } from '../../table-actions'
import PlanMenuList from './PlanMenuList'

interface Props {
  active: string
  setActive: (active: string) => void
  trigger: { func: (trigger: boolean) => void; variable: boolean }
  setDelete: (plan: string) => void
  setRename: (plan: string) => void
}

const testData = {
  plans: [],
  enabled: '',
  active: ''
}

const PlanMenuWrapper = ({
  active,
  setActive,
  trigger,
  setDelete,
  setRename
}: Props): React.ReactElement => {
  const [plans, setPlans] = useState<Plans>({ ...testData })
  const [loading, setLoading] = useState(false)

  const fetchPlans = async (): Promise<void> => {
    try {
      setLoading(true)
      const url = import.meta.env.VITE_BASE_URL
      const resp = await axios.get(`${url}/api/plan/list`, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      setPlans(resp.data as Plans)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [trigger.variable])

  if (loading) {
    return (
      <div className="menu flex h-full w-60 items-center justify-center bg-base-200 p-4">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    )
  }

  return (
    <div className="h-full w-60 bg-base-100 pb-4 pt-3">
      <div className="flex h-full w-full flex-col">
        <div className="px-4">
          <h1 className="border-base flex items-start gap-2 border-b pb-2 text-xl font-bold">
            <NotepadText />
            <p>Plaanid</p>
          </h1>
        </div>

        <div className="flex w-full flex-1 flex-col justify-between">
          <PlanMenuList
            setDelete={setDelete}
            setRename={setRename}
            trigger={trigger}
            active={active}
            setActive={setActive}
            plans={plans}
          ></PlanMenuList>
          <div className="flex flex-col items-center justify-start gap-2 px-4 pb-16">
            <button
              onClick={() =>
                (document.getElementById('newPlanModal') as HTMLDialogElement).showModal()
              }
              className="btn-base btn btn-block"
            >
              <CirclePlus className="mr-2" />
              Uus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanMenuWrapper
