import { ArrowRight, NotepadText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import DeletePlanModal from './Components/Edit/DeletePlanModal'
import NewPlanModal from './Components/Edit/NewPlanModal'
import PlanMenuWrapper from './Components/Edit/PlanMenuWrapper'
import RenamePlanModal from './Components/Edit/RenamePlanModal'
import TableWrapper from './Components/Edit/TableWrapper'
import WeekdayMenuList from './Components/Edit/WeekdayMenuList'

const Edit = (): React.ReactElement => {
  const [activeDay, setActiveDay] = useState(0)
  const [triggerPlanReload, setTriggerPlanReload] = useState(false)
  const [activePlan, setActivePlan] = useState('')
  const [planToDelete, setPlanToDelete] = useState('')
  const [planToRename, setPlanToRename] = useState('')

  // Get the query string from the hash
  const { state } = useLocation()

  useEffect(() => {
    if (state && state.plan) {
      setActivePlan(state.plan)
    }
  }, [state])

  return (
    <>
      <div className="drawer drawer-end h-full w-full lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* <!-- Page content here --> */}
          <div className="mx-auto h-full w-full max-w-4xl p-4 xl:p-8">
            <div className="flex h-full flex-col gap-4 max-md:gap-2">
              <div className="flex w-full flex-row items-center justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold max-md:text-xl">
                  <NotepadText className="max-md:w-5" />
                  <p>Ajakavad</p>
                </h1>
                <label
                  htmlFor="my-drawer-2"
                  className="border-base btn btn-outline drawer-button w-fit self-end lg:hidden"
                >
                  <NotepadText className="h-5 w-5" />
                  Plaanid
                  <ArrowRight className="h-5 w-5" />
                </label>
              </div>
              <ul className="border-base menu menu-horizontal w-full flex-row rounded-xl border bg-base-100">
                <WeekdayMenuList setActiveDay={setActiveDay} activeDay={activeDay} />
              </ul>
              <TableWrapper activePlan={activePlan} activeDay={activeDay}></TableWrapper>
            </div>
          </div>
        </div>
        <div className="drawer-side h-full">
          <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <PlanMenuWrapper
            setRename={setPlanToRename}
            setDelete={setPlanToDelete}
            trigger={{ func: setTriggerPlanReload, variable: triggerPlanReload }}
            active={activePlan}
            setActive={setActivePlan}
          ></PlanMenuWrapper>
        </div>
      </div>
      <DeletePlanModal
        trigger={{ func: setTriggerPlanReload, variable: triggerPlanReload }}
        plan={{ plan: planToDelete, setPlan: setPlanToDelete }}
      ></DeletePlanModal>
      <RenamePlanModal
        trigger={{ func: setTriggerPlanReload, variable: triggerPlanReload }}
        plan={{ plan: planToRename, setPlan: setPlanToRename }}
      ></RenamePlanModal>
      <NewPlanModal
        setPlan={setActivePlan}
        trigger={{ func: setTriggerPlanReload, variable: triggerPlanReload }}
      ></NewPlanModal>
    </>
  )
}

export default Edit
