import { Siren } from "lucide-react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Accordion from "./Components/Accordion";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import PlanItem from "./Components/PlanItem";
import PlanList from "./Components/PlanList";
import TableCard from "./Components/TableCard";

const Dashboard = () => {
  const [activeDay, setActiveDay] = useState(0);
  const [activePlan, setActivePlan] = useState("");

  return (
    <>
      <div>
        <Toaster></Toaster>
      </div>
      <Header />
      <main className="min-h-screen bg-base-200 font-inter">
        <div className="drawer lg:drawer-open">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {/* <!-- Page content here --> */}
            <div className="mx-auto flex max-w-4xl flex-col items-center justify-start p-4">
              <div className="w-full max-w-96 min-[1280px]:mr-60">
                <Accordion></Accordion>
              </div>

              <ul className="border-base-content-20 menu menu-horizontal mb-4 w-full flex-row justify-between rounded-xl border border-base-content/20 bg-base-100 min-[1280px]:mr-60">
                <PlanItem setActiveDay={setActiveDay} activeDay={activeDay} />
              </ul>

              <TableCard
                activePlan={activePlan}
                activeDay={activeDay}
              ></TableCard>
              <div className="card mb-8 mt-24 w-full border border-base-content/20 bg-base-100 p-4 min-[1280px]:mr-60">
                <div className="flex h-full w-full flex-col items-center justify-start gap-8 py-12 text-center">
                  <h1 className="text-4xl font-extrabold">Käivita häire</h1>
                  <p className="">
                    Tööriist, et käivita kooli häire signaali kaugelt.
                  </p>
                  <button
                    className="btn btn-error btn-lg"
                    // onClick={my_modal_3.showModal()}
                  >
                    Häiresignaal <Siren />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="drawer-side border-r border-base-100">
            <label
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <PlanList active={activePlan} setActive={setActivePlan}></PlanList>
          </div>
        </div>

        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
                ✕
              </button>
            </form>
            <div className="flex h-full w-full flex-col items-center justify-between p-4">
              <h2 className="mb-4 text-center text-xl font-semibold">
                Uue Plaani Nimi
              </h2>
              <input
                type="text"
                id="input-new-plan"
                placeholder="Anna plaanile nimi"
                className="input input-bordered w-2/3"
              />
              <div className="flex items-center justify-center">
                <button id="saveButton" className="btn btn-secondary mt-4 w-32">
                  Ok
                </button>
              </div>
            </div>
          </div>
        </dialog>

        {/* <!-- You can open the modal using ID.showModal() method --> */}
        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
                ✕
              </button>
            </form>
            <div className="flex h-full w-full flex-col items-center justify-between">
              <h2 className="mb-2 w-full border-b border-base-content pb-2 text-center text-2xl">
                Tähelepanu!
              </h2>
              <p className="text-center text-lg">
                Vajutades nuppu, saadetakse häire signaal arvutisse, kus asub
                tarkvara. See omakorda käivitab helisignaali, mis kostub valitud
                heliallikast.
              </p>
              <div className="mt-4 flex w-full flex-col items-center justify-center gap-2">
                <button
                  id="fireBtn"
                  className="btn btn-error w-48 text-error-content"
                >
                  Tulekahju häire 🔥
                </button>
                <button
                  id="evacBtn"
                  className="btn btn-error w-48 text-error-content"
                >
                  Evakuatsioon häire 🆘
                </button>
                <button
                  id="intruderBtn"
                  className="btn btn-error w-48 text-error-content"
                >
                  Äkkrünnak häire 🚨
                </button>
              </div>
            </div>
          </div>
        </dialog>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
