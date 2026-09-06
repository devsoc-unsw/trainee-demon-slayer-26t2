const API_URL = "http://localhost:5050";

export type CalendarEvent = {
  id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes: string;
  repetitions: string | null;
  companyId: string | null;
  type: string | null;
  createdAt: string;
  updatedAt: string;
};

type EventInput = {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  repetitions?: string | null;
  companyId?: string | null;
  type?: string | null;
};

function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export async function getEvents(): Promise<CalendarEvent[]> {
  const response = await fetch(`${API_URL}/calendar/events`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  return data.events;
}

export async function createEvent(
  event: EventInput
): Promise<CalendarEvent> {
  const response = await fetch(`${API_URL}/calendar/create-event`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(event),
  });

  const data = await handleResponse(response);
  return data.event;
}

export async function editEvent(
  id: string,
  event: EventInput
): Promise<CalendarEvent> {
  const response = await fetch(`${API_URL}/calendar/edit-event/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(event),
  });

  const data = await handleResponse(response);
  return data.event;
}

export async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/calendar/delete-event/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  await handleResponse(response);
}