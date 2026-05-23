export type User = {
    _id: string;
    name: string;
    email: string;
    token?: string;
};

export type ItineraryDay = {
    day: number;
    title: string;
    location: string;
    agenda: string[];
    notes: string[];
};

export type ExtractedData = {
    documentType: string;
    probableDestination: string;
    travelDates: string[];
    providers: string[];
    confirmationCodes: string[];
    importantNotes: string[];
    rawSummary: string;
};

export type ItineraryPlan = {
    title: string;
    summary: string;
    travelWindow: string;
    destinations: string[];
    checklist: string[];
    days: ItineraryDay[];
};

export type BookingRecord = {
    _id: string;
    userId: string;
    documentName: string;
    fileUrl: string;
    fileType: string;
    cloudinaryPublicId?: string;
    cloudinaryResourceType?: string;
    status: "generated" | "failed";
    extractedText: string;
    extractedData: ExtractedData;
    itinerary: ItineraryPlan;
    shareId: string;
    createdAt: string;
    updatedAt: string;
};

export type AuthResponse = {
    _id: string;
    name: string;
    email: string;
    token: string;
};
