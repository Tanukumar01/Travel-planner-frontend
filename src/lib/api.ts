import type { AuthResponse, BookingRecord, User } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

type ApiEnvelope<T> = {
    success: boolean;
    message?: string;
    data: T;
};

const getErrorMessage = async (response: Response): Promise<string> => {
    try {
        const payload = (await response.json()) as { message?: string };
        return payload.message || "Request failed";
    } catch {
        return "Request failed";
    }
};

const request = async <T>(
    path: string,
    options: RequestInit = {}
): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, options);

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    const payload = (await response.json()) as ApiEnvelope<T>;
    return payload.data;
};

export const registerUser = async (body: {
    name: string;
    email: string;
    password: string;
}): Promise<AuthResponse> =>
    request<AuthResponse>("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

export const loginUser = async (body: {
    email: string;
    password: string;
}): Promise<AuthResponse> =>
    request<AuthResponse>("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

export const fetchCurrentUser = async (token: string): Promise<User> =>
    request<User>("/auth/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const fetchBookings = async (token: string): Promise<BookingRecord[]> =>
    request<BookingRecord[]>("/bookings", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const fetchBookingById = async (
    token: string,
    id: string
): Promise<BookingRecord> =>
    request<BookingRecord>(`/bookings/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const uploadDocument = async (
    token: string,
    file: File
): Promise<BookingRecord> => {
    const formData = new FormData();
    formData.append("document", file);

    return request<BookingRecord>("/bookings/upload", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
};

export const createShareLink = async (
    token: string,
    id: string
): Promise<{
    shareId: string;
    shareUrl: string;
    appShareUrl: string;
}> =>
    request<{
        shareId: string;
        shareUrl: string;
        appShareUrl: string;
    }>(`/bookings/${id}/share`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const deleteBooking = async (
    token: string,
    id: string
): Promise<{ id: string }> =>
    request<{ id: string }>(`/bookings/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const fetchSharedBooking = async (
    shareId: string
): Promise<BookingRecord> => request<BookingRecord>(`/bookings/share/${shareId}`);
