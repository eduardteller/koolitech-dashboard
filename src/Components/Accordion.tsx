import { Ban, ChevronDown, ChevronUp, OctagonAlert } from "lucide-react";
import { useRef, useState } from "react";

const Accordion = () => {
  const [activeIndex, setActiveIndex] = useState<boolean>(false);
  const contentRefs = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div
        className={`mb-4 w-full overflow-hidden rounded-xl border border-base-content/20 bg-base-100`}
      >
        <button
          onClick={() => setActiveIndex(!activeIndex)}
          className={`flex w-full items-center justify-between p-2 text-left`}
        >
          <div className="card flex w-full flex-row items-center justify-center gap-2 rounded-lg bg-error px-4 py-2">
            <p>Ühendus kooli arvutiga: Offline</p>
            <Ban className="h-5 w-5" />
          </div>
          <span className="transition-transform duration-300">
            {activeIndex ? (
              <ChevronUp className="ml-1" />
            ) : (
              <ChevronDown className="ml-1" />
            )}
          </span>
        </button>
        <div
          ref={contentRefs}
          style={{
            maxHeight: activeIndex ? contentRefs.current?.scrollHeight : 0,
          }}
          className="transition-max-height overflow-hidden duration-300 ease-in-out"
        >
          <div className="bg-base-100 px-2 pb-2">
            <div className="card w-full flex-row items-center justify-center gap-2 rounded-lg bg-warning px-4 py-2 text-sm">
              <p>Koik muudatused salvestuvad ainult pilve!</p>
              <OctagonAlert className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Accordion;
