import { useEffect, useState } from "react";
import {
    Briefcase,
    CalendarDays,
    Download,
    Edit3,
    Map,
    MapPin,
    Menu,
    Plane,
    Route,
    Share2,
    User,
    Utensils,
} from "lucide-react";
import type { BookingRecord } from "../types";

type Props = {
    item: BookingRecord | null;
    onShare: (id: string) => Promise<void>;
    sharingId: string | null;
};

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const buildPrintableItinerary = (
    item: BookingRecord,
    title: string,
    summary: string,
): string => {
    const days = item.itinerary.days
        .map(
            (day) => `
                <article class="day">
                    <p class="eyebrow">Day ${escapeHtml(String(day.day))}</p>
                    <h2>${escapeHtml(day.title)}</h2>
                    <p class="muted">${escapeHtml(day.location)}</p>
                    <ul>
                        ${day.agenda.map((agendaItem) => `<li>${escapeHtml(agendaItem)}</li>`).join("")}
                    </ul>
                    <div class="notes">
                        ${day.notes.map((note) => `<span>${escapeHtml(note)}</span>`).join("")}
                    </div>
                </article>
            `,
        )
        .join("");

    const checklist = item.itinerary.checklist
        .map((entry) => `<li>${escapeHtml(entry)}</li>`)
        .join("");

    return `
        <!doctype html>
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>${escapeHtml(title)}</title>
                <style>
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        padding: 40px;
                        color: #172033;
                        font-family: Arial, Helvetica, sans-serif;
                        line-height: 1.55;
                    }
                    .hero {
                        border-bottom: 2px solid #d6e0ec;
                        margin-bottom: 24px;
                        padding-bottom: 20px;
                    }
                    .eyebrow {
                        color: #0f8f84;
                        font-size: 12px;
                        font-weight: 700;
                        letter-spacing: 0.18em;
                        margin: 0 0 8px;
                        text-transform: uppercase;
                    }
                    h1 {
                        font-size: 34px;
                        line-height: 1.15;
                        margin: 0 0 12px;
                    }
                    h2 {
                        font-size: 22px;
                        margin: 0;
                    }
                    .summary {
                        color: #475569;
                        font-size: 16px;
                        max-width: 760px;
                    }
                    .meta {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        margin-top: 18px;
                    }
                    .meta span, .notes span {
                        border: 1px solid #cbd5e1;
                        border-radius: 999px;
                        color: #334155;
                        display: inline-block;
                        font-size: 12px;
                        padding: 6px 10px;
                    }
                    .grid {
                        display: grid;
                        gap: 18px;
                    }
                    .day, .card {
                        border: 1px solid #d6e0ec;
                        border-radius: 16px;
                        padding: 22px;
                        break-inside: avoid;
                    }
                    .muted {
                        color: #64748b;
                        margin: 6px 0 16px;
                    }
                    li {
                        margin: 8px 0;
                    }
                    .notes {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                        margin-top: 16px;
                    }
                    @media print {
                        body { padding: 24px; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <section class="hero">
                    <p class="eyebrow">Generated itinerary</p>
                    <h1>${escapeHtml(title)}</h1>
                    <p class="summary">${escapeHtml(summary)}</p>
                    <div class="meta">
                        <span>${escapeHtml(item.itinerary.travelWindow)}</span>
                        <span>${escapeHtml(item.extractedData.documentType)}</span>
                        <span>${escapeHtml(item.documentName)}</span>
                    </div>
                </section>
                <section class="card">
                    <p class="eyebrow">Trip checklist</p>
                    <ul>${checklist}</ul>
                </section>
                <main class="grid" style="margin-top: 18px;">
                    ${days}
                </main>
            </body>
        </html>
    `;
};

const ItineraryView = ({ item, onShare, sharingId }: Props) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [draftTitle, setDraftTitle] = useState("");
    const [draftSummary, setDraftSummary] = useState("");

    useEffect(() => {
        if (!item) {
            setTitle("");
            setSummary("");
            setDraftTitle("");
            setDraftSummary("");
            setMenuOpen(false);
            setEditing(false);
            return;
        }

        setTitle(item.itinerary.title);
        setSummary(item.itinerary.summary);
        setDraftTitle(item.itinerary.title);
        setDraftSummary(item.itinerary.summary);
        setMenuOpen(false);
        setEditing(false);
    }, [item]);

    if (!item) {
        return (
            <section className="grid min-h-[240px] place-items-center rounded-lg border border-white/10 bg-[#182436]/70 p-6 text-center text-slate-300">
                <p>Select an itinerary to inspect its extracted data and trip plan.</p>
            </section>
        );
    }

    const handleApplyEdit = (): void => {
        setTitle(draftTitle.trim() || item.itinerary.title);
        setSummary(draftSummary.trim() || item.itinerary.summary);
        setEditing(false);
    };

    const handleExportPdf = (): void => {
        const printWindow = window.open("", "_blank", "width=980,height=720");

        if (!printWindow) {
            window.print();
            return;
        }

        printWindow.document.open();
        printWindow.document.write(buildPrintableItinerary(item, title, summary));
        printWindow.document.close();
        printWindow.focus();
        window.setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    return (
        <section className="overflow-hidden rounded-lg border border-white/10 bg-[#101a2a]/75">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#273b55]/70 px-5 py-3">
                <div className="relative flex items-center gap-3">
                    <button
                        className="grid size-8 place-items-center rounded-md text-slate-200 hover:bg-white/10"
                        type="button"
                        aria-label="Open itinerary menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((current) => !current)}
                    >
                        <Menu className="size-5" />
                    </button>
                    {menuOpen ? (
                        <div className="absolute top-10 left-0 z-10 w-72 rounded-lg border border-white/10 bg-[#17263a] p-4 text-sm shadow-2xl">
                            <p className="font-semibold text-white">Trip details</p>
                            <div className="mt-3 grid gap-2 text-slate-300">
                                <p>
                                    <span className="text-slate-500">Document:</span>{" "}
                                    {item.documentName}
                                </p>
                                <p>
                                    <span className="text-slate-500">Type:</span>{" "}
                                    {item.extractedData.documentType}
                                </p>
                                <p>
                                    <span className="text-slate-500">Created:</span>{" "}
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                                <p>
                                    <span className="text-slate-500">Status:</span>{" "}
                                    {item.status}
                                </p>
                            </div>
                        </div>
                    ) : null}
                    <h2 className="text-lg font-semibold text-white">
                        Enhanced AI Itinerary View
                    </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="mr-2 hidden items-center gap-2 text-sm text-slate-200 sm:flex">
                        <User className="size-4" />
                        <span>{item.documentName.split(".")[0]}</span>
                    </div>
                    <button
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-white/12 px-3 text-sm text-slate-200 hover:bg-white/10"
                        type="button"
                        onClick={() => setEditing((current) => !current)}
                    >
                        <Edit3 className="size-4" />
                        {editing ? "Close edit" : "Edit"}
                    </button>
                    <button
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-white/12 px-3 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-70"
                        type="button"
                        disabled={sharingId === item._id}
                        onClick={() => void onShare(item._id)}
                    >
                        <Share2 className="size-4" />
                        {sharingId === item._id ? "Sharing" : "Share"}
                    </button>
                    <button
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-[#9bc9ff] px-3 text-sm font-semibold text-[#0f2237] hover:bg-[#b9dcff]"
                        type="button"
                        onClick={handleExportPdf}
                    >
                        <Download className="size-4" />
                        Export to PDF
                    </button>
                </div>
            </header>

            {editing ? (
                <div className="border-b border-white/10 bg-[#142236] p-5">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] lg:items-end">
                        <label className="grid gap-2 text-sm text-slate-300">
                            Itinerary title
                            <input
                                className="h-11 rounded-md border border-white/10 bg-[#0f1828] px-3 text-white outline-none focus:border-[#23d3c3]"
                                value={draftTitle}
                                onChange={(event) => setDraftTitle(event.target.value)}
                            />
                        </label>
                        <label className="grid gap-2 text-sm text-slate-300">
                            Summary
                            <input
                                className="h-11 rounded-md border border-white/10 bg-[#0f1828] px-3 text-white outline-none focus:border-[#23d3c3]"
                                value={draftSummary}
                                onChange={(event) => setDraftSummary(event.target.value)}
                            />
                        </label>
                        <button
                            className="h-11 rounded-md bg-[#23d3c3] px-4 text-sm font-semibold text-[#08201e] hover:bg-[#4de4d7]"
                            type="button"
                            onClick={handleApplyEdit}
                        >
                            Apply changes
                        </button>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                        Edits update this view and exported PDF. Backend saving can be added when you want persistent trip edits.
                    </p>
                </div>
            ) : null}

            <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="relative pl-16">
                    <div className="absolute top-0 bottom-0 left-8 w-px bg-[#6e91b8]" />
                    <div className="space-y-6">
                        {item.itinerary.days.map((day, index) => {
                            const icons = [Plane, MapPin, Briefcase];
                            const DayIcon = icons[index % icons.length];

                            return (
                                <article
                                    className="relative rounded-lg border border-[#5e7898]/60 bg-[#2b4059]/85 p-5 shadow-lg"
                                    key={`${item._id}-${day.day}`}
                                >
                                    <div className="absolute top-7 -left-[72px] w-16 text-right text-sm font-semibold uppercase text-slate-300">
                                        Day {day.day}
                                    </div>
                                    <div className="absolute top-5 -left-[39px] size-7 rounded-full border-4 border-[#18263a] bg-[#6e91b8]" />
                                    <div className="absolute top-7 -left-4 h-5 w-5 rotate-45 border-b border-l border-[#5e7898]/60 bg-[#2b4059]" />

                                    <div className="flex items-start gap-3">
                                        <DayIcon className="mt-0.5 size-7 text-[#9bc9ff]" />
                                        <div>
                                            <h3 className="text-xl font-semibold text-white">
                                                {day.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-300">
                                                {day.location}
                                            </p>
                                        </div>
                                    </div>

                                    <ul className="mt-5 space-y-3 text-base leading-7 text-slate-100">
                                        {day.agenda.map((agendaItem) => (
                                            <li key={agendaItem}>{agendaItem}</li>
                                        ))}
                                    </ul>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {day.notes.map((note) => (
                                            <span
                                                className="rounded-full border border-white/10 bg-[#17263a]/80 px-3 py-1.5 text-xs text-slate-200"
                                                key={note}
                                            >
                                                {note}
                                            </span>
                                        ))}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <aside className="grid content-start gap-4">
                    <section className="rounded-lg border border-[#5e7898]/60 bg-[#2b4059]/80 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Trip Snapshot</h3>
                            <CalendarDays className="size-5 text-[#9bc9ff]" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-100">{title}</p>
                        <div className="mt-4 grid h-32 place-items-center rounded-md bg-[linear-gradient(135deg,#eef3e8,#b8d6c8_40%,#668fa8)] text-[#14304a]">
                            <Route className="size-12" />
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-200">
                            {summary}
                        </p>
                    </section>

                    <section className="rounded-lg border border-[#5e7898]/60 bg-[#2b4059]/80 p-4">
                        <h3 className="text-lg font-semibold text-white">Before you go</h3>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-100">
                            {item.itinerary.checklist.map((entry) => (
                                <li className="flex gap-2" key={entry}>
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#23d3c3]" />
                                    <span>{entry}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-lg border border-[#5e7898]/60 bg-[#2b4059]/80 p-4">
                        <h3 className="text-lg font-semibold text-white">Extracted booking details</h3>
                        <div className="mt-4 grid gap-3 text-sm text-slate-200">
                            <p>
                                <span className="text-slate-400">Destination:</span>{" "}
                                {item.extractedData.probableDestination || "Needs confirmation"}
                            </p>
                            <p>
                                <span className="text-slate-400">Travel window:</span>{" "}
                                {item.itinerary.travelWindow}
                            </p>
                            <p>
                                <span className="text-slate-400">Providers:</span>{" "}
                                {item.extractedData.providers.length
                                    ? item.extractedData.providers.join(", ")
                                    : "None detected"}
                            </p>
                            <p>
                                <span className="text-slate-400">Confirmation codes:</span>{" "}
                                {item.extractedData.confirmationCodes.length
                                    ? item.extractedData.confirmationCodes.join(", ")
                                    : "None detected"}
                            </p>
                        </div>
                    </section>

                    <section className="rounded-lg border border-[#5e7898]/60 bg-[#2b4059]/80 p-4">
                        <h3 className="text-lg font-semibold text-white">Trip Stats</h3>
                        <div className="mt-4 grid gap-3 text-sm text-slate-100">
                            <div className="flex items-center gap-3">
                                <Map className="size-5 text-[#9bc9ff]" />
                                <span>{item.itinerary.destinations.length || 1} destinations</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="size-5 text-[#9bc9ff]" />
                                <span>{item.itinerary.days.length} planned days</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Plane className="size-5 text-[#9bc9ff]" />
                                <span>{item.extractedData.documentType}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Utensils className="size-5 text-[#9bc9ff]" />
                                <span>{item.itinerary.checklist.length} checklist items</span>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
};

export default ItineraryView;
