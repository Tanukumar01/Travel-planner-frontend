import { useEffect, useState } from "react";
import {
    BriefcaseBusiness,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    FolderOpen,
    Home,
    LogOut,
    Settings,
    ShieldCheck,
    Trash2,
    UserCircle,
} from "lucide-react";
import HistoryList from "../components/HistoryList";
import ItineraryView from "../components/ItineraryView";
import UploadPanel from "../components/UploadPanel";
import { useAuth } from "../context/AuthContext";
import {
    createShareLink,
    deleteBooking,
    fetchBookingById,
    fetchBookings,
    uploadDocument,
} from "../lib/api";
import type { BookingRecord } from "../types";

type WorkspaceView = "home" | "trips" | "documents" | "settings";

const DashboardPage = () => {
    const { user, token, logout } = useAuth();
    const [items, setItems] = useState<BookingRecord[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<BookingRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [shareNotice, setShareNotice] = useState("");
    const [actionNotice, setActionNotice] = useState("");
    const [sharingId, setSharingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<WorkspaceView>("home");

    useEffect(() => {
        const loadBookings = async (): Promise<void> => {
            if (!token) {
                return;
            }

            setLoading(true);
            try {
                const nextItems = await fetchBookings(token);
                setItems(nextItems);
                if (nextItems[0]) {
                    setSelectedId((current) => current ?? nextItems[0]._id);
                }
            } finally {
                setLoading(false);
            }
        };

        void loadBookings();
    }, [token]);

    useEffect(() => {
        const loadBooking = async (): Promise<void> => {
            if (!token || !selectedId) {
                setSelectedItem(null);
                return;
            }

            const booking = await fetchBookingById(token, selectedId);
            setSelectedItem(booking);
        };

        void loadBooking();
    }, [selectedId, token]);

    const refreshAfterUpload = async (file: File): Promise<void> => {
        if (!token) {
            throw new Error("Missing auth token");
        }

        const created = await uploadDocument(token, file);
        const nextItems = await fetchBookings(token);
        setItems(nextItems);
        setSelectedId(created._id);
        setSelectedItem(created);
    };

    const handleShare = async (id: string): Promise<void> => {
        if (!token) {
            return;
        }

        setSharingId(id);
        setShareNotice("");

        try {
            const payload = await createShareLink(token, id);
            await navigator.clipboard.writeText(payload.appShareUrl);
            setShareNotice(`Share link copied: ${payload.appShareUrl}`);
        } catch (error) {
            setShareNotice(error instanceof Error ? error.message : "Unable to share");
        } finally {
            setSharingId(null);
        }
    };

    const handleDelete = async (id: string): Promise<void> => {
        if (!token) {
            return;
        }

        const itemToDelete = items.find((item) => item._id === id);
        const confirmed = window.confirm(
            `Delete "${itemToDelete?.documentName ?? "this document"}" and its generated itinerary?`
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(id);
        setActionNotice("");

        try {
            await deleteBooking(token, id);
            const nextItems = items.filter((item) => item._id !== id);
            setItems(nextItems);

            if (selectedId === id) {
                const nextSelected = nextItems[0]?._id ?? null;
                setSelectedId(nextSelected);
                setSelectedItem(nextItems[0] ?? null);
            }

            setActionNotice("Document and generated itinerary deleted.");
        } catch (error) {
            setActionNotice(error instanceof Error ? error.message : "Unable to delete document");
        } finally {
            setDeletingId(null);
        }
    };

    const activeTrip = selectedItem ?? items[0] ?? null;
    const firstName = user?.name?.split(" ")[0] ?? "Traveler";

    const navItems = [
        { label: "Home", icon: Home, view: "home" as const },
        { label: "My Trips", icon: BriefcaseBusiness, view: "trips" as const },
        { label: "Documents", icon: FolderOpen, view: "documents" as const },
        { label: "Settings", icon: Settings, view: "settings" as const },
    ];

    const handleSelectTrip = (id: string): void => {
        setSelectedId(id);
        setActiveView("trips");
    };

    return (
        <main className="min-h-screen bg-[#0f1828] text-white">
            <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] border-r border-white/10 bg-[#243346]/90 p-4 backdrop-blur-xl lg:block">
                <nav className="mt-16 grid gap-4">
                    {navItems.map(({ label, icon: Icon, view }) => (
                        <button
                            key={label}
                            className={`flex h-14 items-center gap-4 rounded-md px-4 text-left text-base transition ${
                                activeView === view
                                    ? "bg-[#23d3c3]/18 text-[#48e1d3] shadow-[inset_4px_0_0_#23d3c3]"
                                    : "text-slate-100 hover:bg-white/8"
                            }`}
                            type="button"
                            onClick={() => setActiveView(view)}
                        >
                            <Icon className="size-6" />
                            {label}
                        </button>
                    ))}
                </nav>

                <button
                    className="absolute right-4 bottom-6 left-4 flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 text-sm text-slate-100 hover:bg-white/8"
                    type="button"
                    onClick={logout}
                >
                    <LogOut className="size-4" />
                    Logout
                </button>
            </aside>

            <section className="min-h-screen px-5 py-7 lg:ml-[232px] lg:px-10">
                <header className="mb-10 flex items-start justify-between gap-5">
                    <div>
                        <h1 className="text-4xl font-semibold text-white md:text-5xl">
                            {activeView === "home" ? `Hello, ${firstName}` : navItems.find((item) => item.view === activeView)?.label}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                            {activeView === "home" &&
                                "Manage uploads, review generated itineraries, and share your travel plans from one workspace."}
                            {activeView === "trips" &&
                                "Browse every generated itinerary, reopen trip details, and share plans when they are ready."}
                            {activeView === "documents" &&
                                "Review uploaded booking documents, extracted metadata, and processing status."}
                            {activeView === "settings" &&
                                "Manage your profile, workspace preferences, and sharing defaults."}
                        </p>
                    </div>
                    <button
                        className="grid size-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/8 text-slate-200"
                        type="button"
                        aria-label="User profile"
                    >
                        <UserCircle className="size-9" />
                    </button>
                </header>

                {shareNotice ? (
                    <div className="mb-5 rounded-md border border-[#23d3c3]/25 bg-[#23d3c3]/10 px-4 py-3 text-sm text-[#d7fffb]">
                        {shareNotice}
                    </div>
                ) : null}

                {actionNotice ? (
                    <div className="mb-5 rounded-md border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-100">
                        {actionNotice}
                    </div>
                ) : null}

                {activeView === "home" ? (
                    <HomeView
                        activeTrip={activeTrip}
                        loading={loading}
                        items={items}
                        selectedId={selectedId}
                        onSelectTrip={handleSelectTrip}
                        onUpload={refreshAfterUpload}
                        onShare={handleShare}
                        sharingId={sharingId}
                    />
                ) : null}

                {activeView === "trips" ? (
                    <TripsView
                        activeTrip={activeTrip}
                        items={items}
                        selectedId={selectedId}
                        onSelectTrip={setSelectedId}
                        onShare={handleShare}
                        sharingId={sharingId}
                    />
                ) : null}

                {activeView === "documents" ? (
                    <DocumentsView
                        items={items}
                        deletingId={deletingId}
                        onDelete={handleDelete}
                        onSelectTrip={handleSelectTrip}
                    />
                ) : null}

                {activeView === "settings" ? (
                    <SettingsView
                        userName={user?.name ?? "Traveler"}
                        userEmail={user?.email ?? ""}
                        tripCount={items.length}
                        onLogout={logout}
                    />
                ) : null}
            </section>
        </main>
    );
};

const HomeView = ({
    activeTrip,
    loading,
    items,
    selectedId,
    onSelectTrip,
    onUpload,
    onShare,
    sharingId,
}: {
    activeTrip: BookingRecord | null;
    loading: boolean;
    items: BookingRecord[];
    selectedId: string | null;
    onSelectTrip: (id: string) => void;
    onUpload: (file: File) => Promise<void>;
    onShare: (id: string) => Promise<void>;
    sharingId: string | null;
}) => (
    <>
        <section className="grid gap-8 xl:grid-cols-[496px_minmax(0,1fr)]">
            <UploadPanel onUpload={onUpload} />

            <div className="min-w-0">
                {loading ? (
                    <div className="grid h-[260px] place-items-center rounded-lg border border-white/10 bg-[#243447]/70 text-slate-300">
                        Loading recent trips...
                    </div>
                ) : (
                    <HistoryList
                        items={items}
                        selectedId={selectedId}
                        onSelect={onSelectTrip}
                    />
                )}
            </div>
        </section>

        <section className="mt-8">
            <ItineraryView item={activeTrip} onShare={onShare} sharingId={sharingId} />
        </section>
    </>
);

const TripsView = ({
    activeTrip,
    items,
    selectedId,
    onSelectTrip,
    onShare,
    sharingId,
}: {
    activeTrip: BookingRecord | null;
    items: BookingRecord[];
    selectedId: string | null;
    onSelectTrip: (id: string) => void;
    onShare: (id: string) => Promise<void>;
    sharingId: string | null;
}) => (
    <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-[#243447]/85 p-5">
                <h2 className="text-xl font-semibold text-white">Trip Library</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                    Select a saved itinerary to inspect the timeline and sharing tools.
                </p>
            </div>

            <div className="grid gap-3">
                {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/15 bg-[#182436]/70 p-5 text-sm text-slate-300">
                        No trips yet. Upload a booking from Home to generate your first itinerary.
                    </div>
                ) : (
                    items.map((item) => (
                        <button
                            key={item._id}
                            className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 ${
                                selectedId === item._id
                                    ? "border-[#23d3c3] bg-[#12645e]/70"
                                    : "border-white/10 bg-[#243447]/75 hover:bg-[#2d4055]"
                            }`}
                            type="button"
                            onClick={() => onSelectTrip(item._id)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="line-clamp-2 text-base font-semibold text-white">
                                    {item.itinerary.title}
                                </h3>
                                <span className="text-xs text-slate-300">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-300">
                                {item.itinerary.travelWindow}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-[#23d3c3]/15 px-3 py-1 text-xs text-[#65e7dc]">
                                    {item.status}
                                </span>
                                <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-300">
                                    {item.itinerary.days.length} days
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>

        <ItineraryView item={activeTrip} onShare={onShare} sharingId={sharingId} />
    </section>
);

const DocumentsView = ({
    items,
    deletingId,
    onDelete,
    onSelectTrip,
}: {
    items: BookingRecord[];
    deletingId: string | null;
    onDelete: (id: string) => Promise<void>;
    onSelectTrip: (id: string) => void;
}) => (
    <section className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Uploaded files" value={String(items.length)} icon={FileText} />
            <MetricCard
                label="Generated"
                value={String(items.filter((item) => item.status === "generated").length)}
                icon={CheckCircle2}
            />
            <MetricCard label="Latest upload" value={items[0] ? new Date(items[0].createdAt).toLocaleDateString() : "None"} icon={Clock} />
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#182436]/75">
            <div className="grid grid-cols-[1fr_150px_150px_210px] gap-4 border-b border-white/10 bg-[#243447] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-300 max-lg:hidden">
                <span>Document</span>
                <span>Type</span>
                <span>Uploaded</span>
                <span>Action</span>
            </div>

            <div className="divide-y divide-white/8">
                {items.length === 0 ? (
                    <div className="p-6 text-sm text-slate-300">
                        No documents have been uploaded yet.
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item._id}
                            className="grid gap-4 px-5 py-4 text-sm text-slate-200 lg:grid-cols-[1fr_150px_150px_210px] lg:items-center"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-white">
                                    {item.documentName}
                                </p>
                                <p className="mt-1 line-clamp-1 text-slate-400">
                                    {item.itinerary.title}
                                </p>
                            </div>
                            <span>{item.extractedData.documentType}</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className="inline-flex h-9 w-fit items-center gap-2 rounded-md border border-white/10 px-3 text-slate-100 hover:bg-white/8"
                                    type="button"
                                    onClick={() => onSelectTrip(item._id)}
                                >
                                    <ExternalLink className="size-4" />
                                    Open
                                </button>
                                <button
                                    className="inline-flex h-9 w-fit items-center gap-2 rounded-md border border-red-300/20 bg-red-400/10 px-3 text-red-100 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                                    type="button"
                                    disabled={deletingId === item._id}
                                    onClick={() => void onDelete(item._id)}
                                >
                                    <Trash2 className="size-4" />
                                    {deletingId === item._id ? "Deleting" : "Delete"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </section>
);

const SettingsView = ({
    userName,
    userEmail,
    tripCount,
    onLogout,
}: {
    userName: string;
    userEmail: string;
    tripCount: number;
    onLogout: () => void;
}) => (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-[#243447]/85 p-5">
                <h2 className="text-xl font-semibold text-white">Profile</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <ReadonlyField label="Name" value={userName} />
                    <ReadonlyField label="Email" value={userEmail || "Not available"} />
                </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#243447]/85 p-5">
                <h2 className="text-xl font-semibold text-white">Workspace Preferences</h2>
                <div className="mt-5 grid gap-3">
                    <ToggleRow title="Auto-generate itinerary after upload" enabled />
                    <ToggleRow title="Copy share link after creating it" enabled />
                    <ToggleRow title="Show detailed extracted text" enabled={false} />
                </div>
            </div>
        </div>

        <aside className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-[#243447]/85 p-5">
                <ShieldCheck className="size-8 text-[#23d3c3]" />
                <h3 className="mt-4 text-lg font-semibold text-white">Account Security</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                    JWT authentication is active for uploads, trip history, and sharing controls.
                </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#243447]/85 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400">Workspace stats</p>
                <p className="mt-3 text-4xl font-semibold text-white">{tripCount}</p>
                <p className="mt-1 text-sm text-slate-300">saved itineraries</p>
            </div>

            <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-red-300/20 bg-red-400/10 text-sm text-red-100 hover:bg-red-400/15"
                type="button"
                onClick={onLogout}
            >
                <LogOut className="size-4" />
                Logout
            </button>
        </aside>
    </section>
);

const MetricCard = ({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: typeof FileText;
}) => (
    <div className="rounded-lg border border-white/10 bg-[#243447]/85 p-5">
        <Icon className="size-6 text-[#23d3c3]" />
        <p className="mt-4 text-xs uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
);

const ReadonlyField = ({ label, value }: { label: string; value: string }) => (
    <label className="grid gap-2 text-sm text-slate-300">
        {label}
        <input
            className="h-11 rounded-md border border-white/10 bg-[#182436]/80 px-3 text-white outline-none"
            value={value}
            readOnly
        />
    </label>
);

const ToggleRow = ({ title, enabled }: { title: string; enabled: boolean }) => (
    <div className="flex items-center justify-between rounded-md border border-white/10 bg-[#182436]/70 px-4 py-3">
        <span className="text-sm text-slate-200">{title}</span>
        <span
            className={`flex h-6 w-11 items-center rounded-full p-1 ${
                enabled ? "justify-end bg-[#23d3c3]" : "justify-start bg-slate-600"
            }`}
        >
            <span className="size-4 rounded-full bg-white" />
        </span>
    </div>
);

export default DashboardPage;
