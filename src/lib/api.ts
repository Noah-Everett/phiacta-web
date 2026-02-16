import type {
  Claim,
  PaginatedResponse,
  SearchResponse,
  Relation,
  ConfidenceStatus,
  Neighbor,
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

export async function listClaims(
  limit: number = 20,
  offset: number = 0
): Promise<PaginatedResponse<Claim>> {
  return request<PaginatedResponse<Claim>>(
    `/v1/claims?limit=${limit}&offset=${offset}`
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
