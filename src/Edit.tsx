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
      <div className="drawer drawer-end drawer-open h-full w-full">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* <!-- Page content here --> */}
          <div className="mx-auto h-full w-full max-w-4xl px-4 pb-4 pt-2 xl:pb-8 xl:pt-8">
            <div className="flex h-full flex-col gap-4">
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
