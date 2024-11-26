import axios from 'axios'
import { Trash2 } from 'lucide-react'
import React from 'react'
import toast from 'react-hot-toast'

interface Props {
  trigger: { func: (trigger: boolean) => void; variable: boolean }
  plan: { plan: string; setPlan: (plan: string) => void }
}

const DeletePlanModal = ({ plan, trigger }: Props): React.ReactElement => {
  const handleDeletePlan = async (): Promise<void> => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/plan/delete`,
        { plan: plan.plan },
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

      toast.success('Plaan kustutatud')
      ;(document.getElementById('deletePlanModal') as HTMLDialogElement).close()

      trigger.func(!trigger.variable)

      plan.setPlan('')
    } catch (error) {
      toast.error(`${error}`)
    }
  }
  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="deletePlanModal" className="modal overflow-hidden">
        <div className="modal-box">
          <h3 className="border-base border-b pb-2 text-xl font-bold">Kustuta Plaan</h3>
          <p className="py-4">{`Kas olete kindel, et tahate kustutada plaani '${plan.plan}'?`}</p>
          <div className="modal-action">
            <button onClick={handleDeletePlan} className="btn btn-error">
              Kustuta
              <Trash2 size={16} />
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

export default DeletePlanModal
