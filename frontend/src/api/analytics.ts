const API_URL = "http://localhost:5050";

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

async function getCount(endpoint: string): Promise<number> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  return data.count;
}

export async function getAppliedCount(): Promise<number> {
  return getCount("/analytics/applied");
}

export async function getOnlineAssessmentCount(): Promise<number> {
  return getCount("/analytics/oa");
}

export async function getInterviewCount(): Promise<number> {
  return getCount("/analytics/interviews");
}

export async function getBehaviouralInterviewCount(): Promise<number> {
  return getCount("/analytics/interviews/behavioural");
}

export async function getTechnicalInterviewCount(): Promise<number> {
  return getCount("/analytics/interviews/technical");
}

export async function getOfferCount(): Promise<number> {
  return getCount("/analytics/offers");
}

export async function getDeclinedCount(): Promise<number> {
  return getCount("/analytics/declined");
}

export async function getRejectionCount(): Promise<number> {
  return getCount("/analytics/rejections");
}

export async function getCompanyCount(): Promise<number> {
  return getCount("/analytics/companies");
}

export async function getRoleCount(): Promise<number> {
  return getCount("/analytics/roles");
}

export async function getCompanyTypeCount(): Promise<number> {
  return getCount("/analytics/company-types");
}

export type ApplicationsByDay = {
  date: string;
  count: number;
};

export async function getApplicationsByDay(
  startDate: string,
  endDate: string
): Promise<ApplicationsByDay[]> {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${API_URL}/analytics/applications-by-day?${params.toString()}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await handleResponse(response);

  return data.counts;
}