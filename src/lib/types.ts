export type ClaimType = "assertion" | "definition" | "theorem" | "proof" | "evidence" | "conjecture" | "refutation";

export interface Claim {
  id: string;
  title: string;
  claim_type: string;
  format: string;
  content_cache: string | null;
  namespace_id: string;
  created_by: string;
  status: string;
  forgejo_repo_id: number | null;
  repo_status: string;
  cached_confidence: number | null;
  confidence_updated_at: string | null;
  attrs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Reference {
  id: string;
  source_uri: string;
  target_uri: string;
  role: string;
  created_by: string;
  source_type: string;
  target_type: string;
  source_claim_id: string | null;
  target_claim_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface SearchResultItem {
  claim: Claim;
  rank: number;
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  query: string;
}

export interface Namespace {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  attrs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ConfidenceStatus {
  claim_id: string;
  title: string;
  claim_type: string;
  status: string;
  signal_count: number;
  interaction_count: number;
  weighted_agree_confidence: number | null;
  agree_count: number;
  disagree_count: number;
  neutral_count: number;
  epistemic_status: string;
}

export interface Neighbor {
  reference_id: string;
  neighbor_id: string;
  role: string;
  source_uri: string;
  target_uri: string;
  direction: string;
  edge_type_info: {
    is_transitive: boolean;
    is_symmetric: boolean;
    category: string;
    inverse_name: string;
  } | null;
}

export interface Agent {
  id: string;
  name: string;
  email: string | null;
  agent_type: string;
  trust_score: number;
  created_at: string;
}

export interface PublicAgent {
  id: string;
  name: string;
  agent_type: string;
  trust_score: number;
  created_at: string;
}

export interface AuthorSummary {
  id: string;
  name: string;
  agent_type: string;
  trust_score: number;
}

export interface Interaction {
  id: string;
  claim_id: string;
  author: AuthorSummary;
  kind: string;
  signal: string | null;
  confidence: number | null;
  weight: number;
  body: string | null;
  attrs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  agent: Agent;
}

export interface Source {
  id: string;
  source_type: string;
  title: string | null;
  external_ref: string | null;
  content_hash: string | null;
  submitted_by: string;
  submitted_at: string;
  attrs: Record<string, unknown>;
}
