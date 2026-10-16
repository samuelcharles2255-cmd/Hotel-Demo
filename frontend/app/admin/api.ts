import { requestWithAuth } from "@/lib/authentication";
import type {
  AdminBooking,
  AdminCustomer,
  AdminHotel,
  AdminRoom,
  AdminRoomBlock,
  AdminRoomType,
} from "./types";

function extractResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    return (data as { results: T[] }).results;
  }
  return [];
}

/* ---------------------------------------------------------------- Bookings */

export async function fetchStaffBookings(params?: {
  status?: string;
  q?: string;
  check_in_from?: string;
  check_in_to?: string;
}): Promise<AdminBooking[]> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.q?.trim()) query.set("q", params.q.trim());
  if (params?.check_in_from) query.set("check_in_from", params.check_in_from);
  if (params?.check_in_to) query.set("check_in_to", params.check_in_to);

  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await requestWithAuth(`/api/bookings/staff/${qs}`);
  if (!res.ok) {
    throw new Error(`Failed to load staff bookings (${res.status})`);
  }
  const json = await res.json();
  return extractResults<AdminBooking>(json);
}

export async function confirmStaffBooking(reference: string): Promise<AdminBooking> {
  const res = await requestWithAuth(`/api/bookings/staff/${reference}/confirm/`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Could not confirm booking ${reference}`);
  }
  return (await res.json()) as AdminBooking;
}

export async function completeStaffBooking(reference: string): Promise<AdminBooking> {
  const res = await requestWithAuth(`/api/bookings/staff/${reference}/complete/`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Could not complete booking ${reference}`);
  }
  return (await res.json()) as AdminBooking;
}

export async function cancelStaffBooking(
  reference: string,
  reason: string
): Promise<{ booking: AdminBooking; refund_review: boolean }> {
  const res = await requestWithAuth(`/api/bookings/staff/${reference}/cancel/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Could not cancel booking ${reference}`);
  }
  return (await res.json()) as { booking: AdminBooking; refund_review: boolean };
}

/* --------------------------------------------------------- Physical Rooms */

export async function fetchRooms(): Promise<AdminRoom[]> {
  const res = await requestWithAuth("/api/hotels/rooms/");
  if (!res.ok) {
    throw new Error(`Failed to load physical rooms (${res.status})`);
  }
  const json = await res.json();
  return extractResults<AdminRoom>(json);
}

export async function updateRoom(
  id: number,
  data: Partial<AdminRoom>
): Promise<AdminRoom> {
  const res = await requestWithAuth(`/api/hotels/rooms/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to update room ${id}`);
  }
  return (await res.json()) as AdminRoom;
}

/* ------------------------------------------------------------ Room Blocks */

export async function fetchRoomBlocks(): Promise<AdminRoomBlock[]> {
  const res = await requestWithAuth("/api/hotels/room-blocks/");
  if (!res.ok) {
    throw new Error(`Failed to load room blocks (${res.status})`);
  }
  const json = await res.json();
  return extractResults<AdminRoomBlock>(json);
}

export async function createRoomBlock(data: {
  room: number;
  start_date: string;
  end_date: string;
  reason: string;
}): Promise<AdminRoomBlock> {
  const res = await requestWithAuth("/api/hotels/room-blocks/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.detail ||
        err.end_date?.[0] ||
        err.non_field_errors?.[0] ||
        `Failed to create room block`
    );
  }
  return (await res.json()) as AdminRoomBlock;
}

export async function deleteRoomBlock(id: number): Promise<void> {
  const res = await requestWithAuth(`/api/hotels/room-blocks/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to release room block (${res.status})`);
  }
}

/* ------------------------------------------------------------- Room Types */

export async function fetchRoomTypes(): Promise<AdminRoomType[]> {
  const res = await requestWithAuth("/api/hotels/room-types/");
  if (!res.ok) {
    throw new Error(`Failed to load room types (${res.status})`);
  }
  const json = await res.json();
  return extractResults<AdminRoomType>(json);
}

export async function updateRoomType(
  id: number,
  data: Partial<AdminRoomType>
): Promise<AdminRoomType> {
  const res = await requestWithAuth(`/api/hotels/room-types/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to update room type ${id}`);
  }
  return (await res.json()) as AdminRoomType;
}

/* -------------------------------------------------------------- Customers */

export async function fetchCustomers(q?: string): Promise<AdminCustomer[]> {
  const query = q ? `?search=${encodeURIComponent(q)}` : "";
  const res = await requestWithAuth(`/api/customers/${query}`);
  if (!res.ok) {
    throw new Error(`Failed to load registered customers (${res.status})`);
  }
  const json = await res.json();
  return extractResults<AdminCustomer>(json);
}

export async function updateCustomer(
  id: number,
  data: { is_active: boolean }
): Promise<AdminCustomer> {
  const res = await requestWithAuth(`/api/customers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to update customer status`);
  }
  return (await res.json()) as AdminCustomer;
}

/* ----------------------------------------------------------------- Hotel */

export async function fetchHotelProfile(slug = "aether-luxury-hotel"): Promise<AdminHotel | null> {
  try {
    const res = await requestWithAuth(`/api/hotels/${slug}/`);
    if (!res.ok) return null;
    return (await res.json()) as AdminHotel;
  } catch {
    return null;
  }
}

