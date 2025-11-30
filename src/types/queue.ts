// UI form shape (used inside the component)
export interface JoinFormState {
  name: string;
  phone: string; // raw input while typing
  count: number | ""; // allow empty while typing
}

// Payload sent to the API when creating a token
export interface CreateQueueTokenPayload {
  org_id: string;
  name: string;
  phone: string; // normalized 10-digit or E.164 (choose one)
  people_count: number;
  service_tag?: string;
  service_date?: string; // ISO date string
}

// API response model (snake_case as server returns it)
export interface QueueTokenApi {
  id: string;
  org_id: string;
  name: string;
  phone: string;
  people_count: number;
  token_number?: number;
  status: "waiting" | "called" | "seated" | "done" | "cancelled" | "no_show";
  service_date?: string;
  service_tag?: string;
  created_at: string;
}

// Optional: canonical app model (camelCase)
export interface QueueToken {
  id: string;
  orgId: string;
  name: string;
  phone: string;
  people_count: number;
  token_number: number;
  status: "waiting" | "called" | "seated" | "done" | "cancelled" | "no_show";
  service_date?: string;
  serviceTag?: string;
  createdAt: string;
}

export interface FormData {
  name: string; // person's name
  phone: string; // contact number
  count?: number; // number of people in the group
}
