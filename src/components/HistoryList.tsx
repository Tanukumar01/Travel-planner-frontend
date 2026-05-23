import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { BookingRecord } from "../types";

type Props = {
    items: BookingRecord[];
    selectedId: string | null;
    onSelect: (id: string) => void;
};

const HistoryList = ({ items, selectedId, onSelect }: Props) => (
    <section>
        <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Recent History</h2>
            <div className="flex items-center gap-2">
                <button
                    className="grid size-8 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300"
                    type="button"
                    aria-label="Previous history"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <button
                    className="grid size-8 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-200"
                    type="button"
                    aria-label="Next history"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
            {items.length === 0 ? (
                <div className="grid h-[220px] min-w-[250px] place-items-center rounded-lg border border-white/10 bg-[#243447]/70 px-5 text-center">
                    <div>
                        <p className="text-base font-medium text-stone-100">
                            No itineraries yet.
                        </p>
                        <span className="mt-2 block text-sm text-slate-400">
                            Uploaded trips will appear here.
                        </span>
                    </div>
                </div>
            ) : (
                items.map((item, index) => (
                    <button
                        type="button"
                        key={item._id}
                        className={`min-w-[250px] rounded-lg border p-3 text-left transition hover:-translate-y-0.5 ${
                            selectedId === item._id
                                ? "border-[#23d3c3]/70 bg-[#12645e]/70"
                                : "border-white/10 bg-[#243447]/75 hover:bg-[#2d4055]/85"
                        }`}
                        onClick={() => onSelect(item._id)}
                    >
                        <div
                            className={`grid h-28 place-items-center rounded-md ${
                                index % 2 === 0
                                    ? "bg-[linear-gradient(135deg,#dce8dc,#8dbdb9_45%,#2f6f83)]"
                                    : "bg-[linear-gradient(135deg,#b9daf0,#297e96_45%,#0f4f5b)]"
                            } text-[#142235]`}
                        >
                            <MapPin className="size-8" />
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <strong className="line-clamp-2 block text-base font-semibold leading-snug text-stone-100">
                                    {item.itinerary.title}
                                </strong>
                                <p className="mt-1 text-sm text-slate-300">
                                    {item.itinerary.travelWindow}
                                </p>
                            </div>
                            <span className="shrink-0 text-sm text-slate-300">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <span className="mt-3 inline-flex rounded-full bg-[#23d3c3]/15 px-3 py-1 text-xs font-medium text-[#65e7dc]">
                            {item.status}
                        </span>
                    </button>
                ))
            )}
        </div>
    </section>
);

export default HistoryList;
