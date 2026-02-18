import type {
  Claim,
  PaginatedResponse,
  SearchResponse,
  Relation,
  ConfidenceStatus,
  Neighbor,
  Namespace,
  Agent,
  AuthResponse,
  Source,
  VerificationStatus,
} from "./types";

// Server-side (SSR) uses the Docker-internal URL; browser uses the public URL
const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --- Auth utilities ---

const TOKEN_KEY = "phiacta_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// 401 logout coordinator — prevents multiple concurrent 401 handlers
let isLoggingOut = false;

export async function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
    cache: "no-store",
    ...options,
  });

  if (res.status === 401) {
    if (!isLoggingOut) {
      isLoggingOut = true;
      clearStoredToken();
      // Use queueMicrotask to reset the flag after the current tick
      queueMicrotask(() => { isLoggingOut = false; });
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(detail || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --- Auth API functions ---

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(detail || "Invalid email or password.");
  }

  return res.json() as Promise<AuthResponse>;
}

export async function registerApi(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(detail || "Registration failed. Please try again.");
  }

  return res.json() as Promise<AuthResponse>;
}

export async function getMeApi(): Promise<Agent> {
  const token = getStoredToken();
  if (!token) throw new Error("No token");

  const res = await fetch(`${API_URL}/v1/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Token validation failed");
  }

  return res.json() as Promise<Agent>;
}

export async function listNamespaces(): Promise<PaginatedResponse<Namespace>> {
  return request<PaginatedResponse<Namespace>>("/v1/namespaces?limit=200");
}

export async function listClaims(
  limit: number = 20,
  offset: number = 0,
  filters?: { namespace_id?: string; claim_type?: string }
): Promise<PaginatedResponse<Claim>> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (filters?.namespace_id) params.set("namespace_id", filters.namespace_id);
  if (filters?.claim_type) params.set("claim_type", filters.claim_type);
  return request<PaginatedResponse<Claim>>(`/v1/claims?${params.toString()}`);
}

export async function listSources(
  limit: number = 50,
  offset: number = 0
): Promise<PaginatedResponse<Source>> {
  return request<PaginatedResponse<Source>>(
    `/v1/sources?limit=${limit}&offset=${offset}`
  );
}

export async function getClaim(id: string): Promise<Claim> {
  return request<Claim>(`/v1/claims/${id}`);
}

export async function getClaimRelations(id: string): Promise<Relation[]> {
  return request<Relation[]>(`/v1/claims/${id}/relations`);
}

export async function searchClaims(query: string): Promise<SearchResponse> {
  return request<SearchResponse>("/v1/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export async function getConfidence(id: string): Promise<ConfidenceStatus> {
  return request<ConfidenceStatus>(
    `/layers/confidence/claims/${id}/status`
  );
}

export async function getNeighbors(
  id: string
): Promise<{ claim_id: string; neighbors: Neighbor[] }> {
  return request(`/layers/graph/claims/${id}/neighbors`);
}

export async function getVerificationStatus(
  claimId: string
): Promise<VerificationStatus> {
  return request<VerificationStatus>(`/v1/claims/${claimId}/verification`);
}

export async function submitVerification(
  claimId: string,
  codeContent: string,
  runnerType: string
): Promise<Claim> {
  return authFetch<Claim>(`/v1/claims/${claimId}/verify`, {
    method: "POST",
    body: JSON.stringify({ code_content: codeContent, runner_type: runnerType }),
  });
}
