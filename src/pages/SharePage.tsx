import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ItineraryView from "../components/ItineraryView";
import { fetchSharedBooking } from "../lib/api";
import type { BookingRecord } from "../types";

const SharePage = () => {
    const { shareId } = useParams();
    const [item, setItem] = useState<BookingRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadShared = async (): Promise<void> => {
            if (!shareId) {
                setError("Missing share id");
                setLoading(false);
                return;
            }

            try {
                const booking = await fetchSharedBooking(shareId);
                setItem(booking);
            } catch (loadError) {
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Unable to fetch shared itinerary"
                );
            } finally {
                setLoading(false);
            }
        };

        void loadShared();
    }, [shareId]);

    return (
        <main className="relative mx-auto min-h-screen max-w-[1240px] overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-[18%] bg-[linear-gradient(180deg,rgba(177,194,216,0.16),rgba(92,109,132,0.08))] [clip-path:polygon(38%_0,100%_0,72%_100%,0_100%)]" />
            <div className="pointer-events-none absolute top-0 bottom-0 left-[19%] w-px bg-white/6" />

            <header className="relative z-10 grid gap-5 rounded-[28px] border border-white/8 bg-slate-900/20 px-5 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:px-7 lg:px-8">
                <div className="max-w-3xl">
                    <span className="text-[11px] font-medium tracking-[0.34em] text-mint uppercase">
                        Shared itinerary
                    </span>
                    <h1 className="mt-3 max-w-[11ch] text-4xl font-semibold leading-[0.92] tracking-[-0.05em] text-stone-50 sm:text-5xl lg:max-w-[12ch]">
                        View a shared travel plan
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                        This is a read-only version of the itinerary, designed for quick
                        review and easy sharing with friends, family, or teammates.
                    </p>
                </div>
                <div className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/4 px-6 text-sm font-medium text-slate-200">
                    View only
                </div>
            </header>

            {loading ? (
                <div className="relative z-10 mt-5 rounded-[24px] border border-white/8 bg-slate-900/45 p-6 text-slate-300 backdrop-blur-xl">
                    Loading shared itinerary...
                </div>
            ) : null}
            {error ? (
                <div className="relative z-10 mt-5 rounded-[24px] border border-rose-400/20 bg-rose-400/10 p-6 text-rose-200 backdrop-blur-xl">
                    {error}
                </div>
            ) : null}
            {!loading && !error ? (
                <div className="relative z-10 mt-5 grid gap-5">
                    <ItineraryView
                        item={item}
                        onShare={async () => undefined}
                        sharingId={null}
                    />
                </div>
            ) : null}
        </main>
    );
};

export default SharePage;
