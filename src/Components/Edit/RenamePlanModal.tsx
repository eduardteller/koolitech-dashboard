import axios from 'axios'
import { CheckCheck } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { z } from 'zod'

interface Props {
  trigger: { func: (trigger: boolean) => void; variable: boolean }
  plan: { plan: string; setPlan: (plan: string) => void }
}

const RenamePlanModal = ({ plan, trigger }: Props): React.ReactElement => {
  const [newPlanName, setNewPlanName] = useState('')
  const handleRenamePlan = async (): Promise<void> => {
    try {
      const parse = z
        .string()
        .min(2, 'Plaani nimi peab olema vähemalt 2 tähemärki pikk')
        .max(50, 'Plaani nimi ei tohi olla pikem kui 50 tähemärki')
        .safeParse(newPlanName)
      if (!parse.success) {
        toast.error(parse.error.errors[0].message)
        throw new Error(parse.error.errors[0].message)
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/plan/rename`,
        { plan: plan.plan, newName: newPlanName },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )

      if (response.status !== 200) {
        throw new Error('Plaani kustutamine ebaõnnestus')
      }

      toast.success('Plaan ümber nimetatud')
      ;(document.getElementById('renamePlanModal') as HTMLDialogElement).close()
      // window.location.reload()
      trigger.func(!trigger.variable)
      plan.setPlan(newPlanName)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    setNewPlanName(plan.plan)
  }, [plan.plan])
  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="renamePlanModal" className="modal overflow-hidden">
        <div className="modal-box">
          <h3 className="border-base border-b pb-2 text-xl font-bold">Nimeta ümber</h3>
          <p className="py-4">{`Andke plaanile '${plan.plan}' uus nimi.`}</p>
          <input
            type="text"
            placeholder="Uus plaani nimi..."
            className="input input-bordered w-full"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
          />
          <div className="modal-action">
            <button
              disabled={plan.plan === newPlanName}
              onClick={handleRenamePlan}
              className="btn-base btn"
            >
              OK
              <CheckCheck />
            </button>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Tagasi</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default RenamePlanModal
