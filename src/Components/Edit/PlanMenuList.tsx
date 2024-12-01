import axios from 'axios'
import { Check, Copy, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { ReactElement } from 'react'
import toast from 'react-hot-toast'
import { Plans } from '../../table-actions'

interface Props {
  active: string
  setActive: (active: string) => void
  plans: Plans
  trigger: { func: (trigger: boolean) => void; variable: boolean }
  setDelete: (plan: string) => void
  setRename: (plan: string) => void
}

const PlanMenuList = ({
  active,
  setActive,
  plans,
  trigger,
  setDelete,
  setRename
}: Props): ReactElement => {
  const handleDuplicatePlan = async (plan: string): Promise<void> => {
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/plan/duplicate`,
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

      toast.success(`Plaan ${plan} kopeeritud`)
      trigger.func(!trigger.variable)
    } catch (error) {
      toast.error('Plaani kopeerimine ebaõnnestus')
      console.error(error)
    }
  }

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

      toast.success(`Plaan ${plan} aktiveeritud`)
      trigger.func(!trigger.variable)
    } catch (error) {
      toast.error('Plaani aktiveerimine ebaõnnestus')
      console.error(error)
    }
  }

  return (
    <ul className="menu">
      {plans.plans.map((plan, index) => {
        return (
          <div key={index} className={`relative`}>
            {/* Plan Item */}
            <li>
              <a
                onClick={() => setActive(plan.name)}
                className={`${
                  plan.name === active && 'active'
                } flex w-full flex-row items-center justify-between`}
              >
                <div className="flex w-[168px] flex-row items-center justify-between">
                  <p className="flex-1 truncate">{plan.name}</p>
                  {plan.name === plans.enabled && (
                    <div className="badge badge-neutral badge-sm">Aktiivne</div>
                  )}
                </div>
              </a>
            </li>

            {/* Dropdown Container */}
            <div
              style={{ zIndex: (plans.plans.length - index) * 10 }}
              className={`dropdown dropdown-end absolute right-2 top-1/2 translate-y-[-50%]`}
            >
              <div
                tabIndex={0}
                role="button"
                className={`btn btn-square btn-ghost btn-xs text-base-content shadow-none ${
                  plan.name === active ? 'text-neutral-content' : 'text-base-content'
                }`}
              >
                <MoreVertical size={16} />
              </div>
              <ul
                tabIndex={0}
                className="border-base menu dropdown-content menu-sm w-48 rounded-lg border bg-base-100 p-2 text-base-content"
              >
                {plan.name !== plans.enabled && (
                  <li className="input-bordered border-b pb-1">
                    <a onClick={() => handleEnablePlan(plan.name)}>
                      <Check className="mr-2 h-4 w-4" />
                      Aktiveeri
                    </a>
                  </li>
                )}
                <li className="pt-1">
                  <a onClick={() => handleDuplicatePlan(plan.name)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplikeeri
                  </a>
                </li>
                <li className="pb-1">
                  <a
                    onClick={() => {
                      setRename(plan.name)
                      ;(document.getElementById('renamePlanModal') as HTMLDialogElement).showModal()
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Nimeta ümber
                  </a>
                </li>
                <li className="input-bordered border-t pt-1 text-error hover:text-base-content">
                  <a
                    onClick={() => {
                      setDelete(plan.name)
                      ;(document.getElementById('deletePlanModal') as HTMLDialogElement).showModal()
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Kustuta
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )
      })}
    </ul>
  )
}

export default PlanMenuList
