export type AdminGuest = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_primary: boolean;
};

export type AdminBooking = {
  id: number;
  reference: string;
  access_token: string;
  customer: number | null;
  customer_email: string | null;
  hotel_name: string;
  room: number | null;
  room_number: string | null;
  room_type: number;
  room_type_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  special_requests: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  hold_expires_at: string | null;
  price_per_night: string | number;
  total_amount: string | number;
  currency: string;
  cancelled_at: string | null;
  cancelled_by: number | null;
  cancellation_reason: string | null;
  guests: AdminGuest[];
  created_at: string;
  updated_at: string;
};

export type AdminRoom = {
  id: number;
  hotel: number;
  room_type: number;
  number: string;
  floor: number;
  status: "available" | "occupied" | "maintenance";
  notes: string;
};

export type AdminRoomBlock = {
  id: number;
  room: number;
  start_date: string;
  end_date: string;
  reason: string;
  created_by?: number;
  created_at?: string;
};

export type AdminRoomImage = {
  id: number;
  room_type: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  sort_order?: number;
  uploaded_at?: string;
};

export type AdminRoomType = {
  id: number;
  hotel: number;
  name: string;
  description: string;
  base_price: string | number;
  max_adults: number;
  max_children: number;
  max_guests: number;
  bed_configuration: string;
  amenities: string[];
  is_active: boolean;
  images: AdminRoomImage[];
};

export type AdminCustomer = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  email_verified: boolean;
  date_joined: string;
};

export type AdminHotel = {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  check_in_time: string;
  check_out_time: string;
  currency: string;
  timezone: string;
  is_active: boolean;
  created_at?: string;
};

