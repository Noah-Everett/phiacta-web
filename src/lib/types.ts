export type ClaimType = "assertion" | "definition" | "theorem" | "proof" | "evidence" | "conjecture" | "refutation";

export interface Claim {
  id: string;
  lineage_id: string;
  version: number;
  content: string;
  claim_type: string;
  namespace_id: string;
  created_by: string;
  formal_content: string | null;
  supersedes: string | null;
  status: string;
  attrs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  verification_level?: string | null;
  verification_status?: string | null;
}

export interface Relation {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: string;
  strength: number;
  created_by: string;
  source_provenance: string | null;
  attrs: Record<string, unknown>;
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
  lineage_id: string;
  content: string;
  claim_type: string;
  status: string;
  version: number;
  review_count: number;
  avg_endorsement_confidence: number | null;
  endorsement_count: number;
  dispute_count: number;
  epistemic_status: string;
}

export interface Neighbor {
  relation_id: string;
  neighbor_id: string;
  relation_type: string;
  strength: number;
  direction: string;
  edge_type_info: {
    is_transitive: boolean;
    is_symmetric: boolean;
    category: string;
    inverse_name: string;
  };
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

export interface ReviewerSummary {
  id: string;
  name: string;
  agent_type: string;
  trust_score: number;
}

export interface Review {
  id: string;
  claim_id: string;
  verdict: string;
  confidence: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  reviewer: ReviewerSummary;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  agent: Agent;
}

export interface VerificationStatus {
  claim_id: string;
  verification_level: string | null;
  verification_status: string | null;
  verification_result: Record<string, unknown> | null;
  verification_code: string | null;
  verification_runner_type: string | null;
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
