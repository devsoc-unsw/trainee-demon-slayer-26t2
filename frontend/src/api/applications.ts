const API_URL = "http://localhost:5050";

export type Application = {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  companyType: string;
  role: string;
  status: string;
  dateApplied: string;
  firstResponseDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type ApplicationInput = {
  companyId?: string;
  companyName: string;
  companyType?: string;
  role: string;
  status: string;
  dateApplied: string;
  firstResponseDate?: string | null;
  notes?: string;
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

export async function getApplications(): Promise<Application[]> {
  const response = await fetch(`${API_URL}/applications`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  return data.applications;
}

export async function getApplication(
  id: string
): Promise<Application> {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  return data.application;
}

export async function createApplication(
  application: ApplicationInput
): Promise<Application> {
  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(application),
  });

  const data = await handleResponse(response);

  return data.application;
}

export async function editApplication(
  id: string,
  application: ApplicationInput
): Promise<Application> {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(application),
  });

  const data = await handleResponse(response);

  return data.application;
}

export async function deleteApplication(
  id: string
): Promise<void> {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  await handleResponse(response);
}