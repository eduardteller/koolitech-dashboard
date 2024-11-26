import { CheckCheck } from 'lucide-react'
import { ReactElement, useRef } from 'react'

interface Props {
  setPlan: (plan: string) => void
  trigger: { func: (trigger: boolean) => void; variable: boolean }
}

const NewPlanModal = ({ trigger, setPlan }: Props): ReactElement => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const handleNewPlan = (): void => {
    // const parse = z
    //   .string()
    //   .min(2, 'Plaani nimi peab olema vähemalt 2 tähemärki pikk')
    //   .max(50, 'Plaani nimi ei tohi olla pikem kui 50 tähemärki')
    //   .safeParse(inputRef.current?.value)
    // if (!parse.success) {
    //   toast.error(parse.error.errors[0].message)
    //   return
    // }
    // window.api.createPlan(inputRef.current?.value as string).then((response) => {
    //   if (response) {
    //     toast.success(`Uus plaan '${inputRef.current?.value}' loodud `)
    //   } else {
    //     toast.error('Viga plaani kustutamisel')
    //   }
    //   ;(document.getElementById('newPlanModal') as HTMLDialogElement).close()
    //   if (inputRef.current) {
    //     inputRef.current.value = ''
    //   }
    //   trigger.func(!trigger.variable)
    //   setPlan('')
    // })
  }
  return (
    <>
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="newPlanModal" className="modal">
        <div className="modal-box">
          <h3 className="border-base border-b pb-2 text-xl font-bold">Loo Uus Plaan</h3>
          <p className="py-4">Anna plaanile nimi:</p>
          <input
            ref={inputRef}
            type="text"
            placeholder="Plaani nimi..."
            className="input input-bordered w-full"
          />
          <div className="modal-action">
            <button onClick={handleNewPlan} className="btn-base btn">
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

export default NewPlanModal
