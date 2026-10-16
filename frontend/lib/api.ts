/**
 * API client for HotelSys backend communication (hotels, availability, bookings).
 * Works with same-origin Next.js rewrites (/api/*) or direct NEXT_PUBLIC_API_URL.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface RoomImageApi {
  id: number;
  room_type: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface RoomTypeApi {
  id: number;
  hotel: number;
  name: string;
  description: string;
  base_price: string;
  max_adults: number;
  max_children: number;
  max_guests: number;
  bed_configuration: string;
  amenities: string[];
  is_active: boolean;
  images: RoomImageApi[];
  rooms_left?: number;
  nights?: number;
  price_per_night?: string;
  total_price?: string;
  currency?: string;
}

export interface HotelApi {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
}

export interface GuestInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface CreateBookingPayload {
  room_type: number;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  special_requests?: string;
  guests: GuestInput[];
}

export interface BookingResponse {
  reference: string;
  access_token: string;
  status: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  price_per_night: string;
  total_amount: string;
  currency: string;
  hold_expires_at: string;
  created_at: string;
}

/**
 * Fetch hotel details
 */
export async function fetchHotel(slug = "aether-luxury-hotel"): Promise<HotelApi | null> {
  try {
    const res = await fetch(`${API_BASE}/api/hotels/${slug}/`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("fetchHotel failed:", err);
    return null;
  }
}

/**
 * Fetch real-time available room types for a date range
 */
export async function fetchAvailability(params: {
  check_in: string;
  check_out: string;
  adults?: number;
  children?: number;
  slug?: string;
}): Promise<RoomTypeApi[]> {
  const { check_in, check_out, adults = 1, children = 0, slug = "aether-luxury-hotel" } = params;
  try {
    const qs = new URLSearchParams({
      check_in,
      check_out,
      adults: String(adults),
      children: String(children),
    });
    const res = await fetch(`${API_BASE}/api/hotels/${slug}/availability/?${qs.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn("fetchAvailability failed:", err);
    return [];
  }
}

/** Recursively extract a human-readable string from a DRF error body.
 *  Handles: string, string[], { field: string[] }, { field: { 0: { subfield: [...] } } }. */
function extractDrfError(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractDrfError).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const msg = extractDrfError(v);
        if (!msg) return "";
        if (/^\d+$/.test(k) || k === "non_field_errors" || k === "detail") return msg;
        const label = k.replace(/_/g, " ");
        return `${label}: ${msg}`;
      })
      .filter(Boolean)
      .join(" | ");
  }
  return String(value);
}

/**
 * Create a new guest booking with room hold
 */
export async function createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
  const res = await fetch(`${API_BASE}/api/bookings/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    // DRF detail string wins; otherwise deep-extract all field errors
    const message =
      (typeof errBody?.detail === "string" ? errBody.detail : null) ||
      extractDrfError(errBody) ||
      `Booking failed (${res.status}).`;
    throw new Error(message);
  }

  return await res.json();
}

