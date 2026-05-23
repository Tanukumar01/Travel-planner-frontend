    import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { Building2, CheckCircle2, Plane } from "lucide-react";

type Props = {
    onUpload: (file: File) => Promise<void>;
};

const UploadPanel = ({ onUpload }: Props) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState("");

    const runUpload = async (file: File): Promise<void> => {
        setIsUploading(true);
        setMessage("");

        try {
            await onUpload(file);
            setMessage("Document uploaded and itinerary generated.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = async (event: DragEvent<HTMLDivElement>): Promise<void> => {
        event.preventDefault();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) {
            await runUpload(droppedFile);
        }
    };

    return (
        <section className="rounded-lg border border-white/10 bg-[#243447]/85 p-5 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">
                    Travel Document Upload
                </h2>
                <div className="flex items-center gap-4 text-slate-300">
                    <Plane className="size-10" strokeWidth={1.7} />
                    <Building2 className="size-10" strokeWidth={1.7} />
                    <CheckCircle2 className="size-10" strokeWidth={1.7} />
                </div>
            </div>

            <div
                className={`mt-6 rounded-lg border border-dashed px-6 py-9 text-center transition ${
                    isDragging
                        ? "border-[#27d7c6] bg-[#27d7c6]/10"
                        : "border-slate-500/60 bg-[#182436]/75"
                }`}
                onDragEnter={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={(event) => void handleDrop(event)}
            >
                <input
                    ref={inputRef}
                    className="hidden"
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={(event) => {
                        const nextFile = event.target.files?.[0];
                        if (nextFile) {
                            void runUpload(nextFile);
                        }
                    }}
                />

                <div className="mx-auto grid max-w-md justify-items-center gap-4">
                    <p className="text-xl font-semibold leading-snug text-white">
                        Drop a flight, hotel, or travel confirmation here
                    </p>
                    <button
                        className="inline-flex h-11 items-center justify-center rounded-md bg-[#23d3c3] px-6 text-base font-semibold text-[#0b1723] transition hover:bg-[#48e1d3] disabled:cursor-not-allowed disabled:opacity-70"
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? "Generating itinerary..." : "Choose file"}
                    </button>

                    <div className="mt-4 w-full">
                        <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                            <span>{isUploading ? "Parsing file..." : "Ready to upload"}</span>
                            <span>{isUploading ? "45%" : "0%"}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-600/70">
                            <div
                                className={`h-2 rounded-full bg-[#23d3c3] transition-all ${
                                    isUploading ? "w-[45%]" : "w-0"
                                }`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {message ? (
                <p className="mt-4 rounded-md border border-[#23d3c3]/25 bg-[#23d3c3]/10 px-4 py-3 text-sm text-[#d7fffb]">
                    {message}
                </p>
            ) : null}
        </section>
    );
};

export default UploadPanel;
