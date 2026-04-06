// User types — mirrors auth.py UserResponse
export interface User {
  id: string;
  username: string;
  created_at: string;
}

// Same shape — backend uses identical fields for public view
export type PublicUserResponse = User;

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Personal Access Token types — mirrors schemas/auth.py
export interface TokenCreateResponse {
  id: string;
  name: string;
  key_prefix: string;
  token: string;
  created_at: string;
  expires_at: string | null;
}

export interface TokenListItem {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
}

// Entry types — mirrors entry.py
//
// Core fields are the entries-table columns.  Extension fields (title,
// summary, entry_type, tags, references) are composed dynamically by
// the backend's auto-compose system and are always present when the
// corresponding extensions are loaded.
export interface EntryListItem {
  id: string;
  forgejo_repo_id: number | null;
  repo_name: string;
  current_head_sha: string | null;
  repo_status: string;
  visibility: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Auto-composed extension fields (always present in practice):
  title: string | null;
  summary: string | null;
  entry_type: string | null;
  tags?: string[];
}

export type EntryResponse = EntryListItem;

// Reference item shape from auto-compose
export interface ReferenceItem {
  id: string;
  from_entity_id: string;
  to_entity_id: string;
  rel: string;
  version_sha: string | null;
  note: string | null;
  created_by: string;
  created_at: string;
}

// Detail includes references (auto-composed, detail-only by default)
export interface EntryDetailResponse extends EntryListItem {
  references?: ReferenceItem[];
}

export interface EntryCreate {
  title: string;
  summary?: string | null;
  content?: string | null;
  content_format?: string;
  entry_type?: string | null;
}

// Unified PATCH — accepts any writable extension field
export interface EntryUpdate {
  title?: string;
  summary?: string | null;
  entry_type?: string | null;
  tags?: string[];
  [key: string]: unknown;
}

// Pagination — mirrors common.py
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// File types — mirrors entry_file.py
export interface FileListItem {
  name: string;
  path: string;
  type: string;
  size: number;
}

export interface FileWriteResponse {
  sha: string;
}

// Edit proposal types — mirrors entry_edit.py
export interface EditProposalAuthor {
  username: string;
}

export interface EditProposalListItem {
  number: number;
  title: string;
  body: string | null;
  state: string;
  is_draft: boolean;
  author: EditProposalAuthor;
  head_branch: string;
  base_branch: string;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
}

export interface EditProposalFileDiff {
  path: string;
  patch: string;
  additions: number;
  deletions: number;
}

export interface EditProposalDetail extends EditProposalListItem {
  diff: EditProposalFileDiff[];
}

// History types — mirrors entry_history.py
export interface CommitAuthor {
  name: string;
  email: string;
}

export interface CommitListItem {
  sha: string;
  message: string;
  author: CommitAuthor;
  timestamp: string;
}

export interface FileDiffItem {
  path: string;
  patch: string;
  additions: number;
  deletions: number;
}

export interface CommitDiffResponse {
  base_sha: string;
  head_sha: string;
  files_changed: FileDiffItem[];
}

// Tags extension types — mirrors tags/schemas.py
export interface TagResponse {
  tag: string;
  created_by: string;
  created_at: string;
}

export interface TagListResponse {
  entry_id: string;
  tags: TagResponse[];
}

export interface EntryTagItem {
  entry_id: string;
  title: string | null;
  summary: string | null;
  entry_type: string | null;
}

// Issue types — mirrors entry_issue.py
export interface IssueAuthor {
  username: string;
}

export interface IssueListItem {
  number: number;
  title: string;
  body: string | null;
  state: string;
  author: IssueAuthor;
  comments_count: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface IssueCommentResponse {
  id: number;
  body: string;
  author: IssueAuthor;
  created_at: string;
  updated_at: string;
}

export interface IssueDetail extends IssueListItem {
  comments: IssueCommentResponse[];
}

// Search tool types — mirrors tools/search/schemas.py
export interface SearchResultItem {
  entry_id: string;
  title: string;
  summary: string | null;
  entry_type: string | null;
  rank: number;
}

export interface SearchResponse {
  items: SearchResultItem[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  version_id: string | null;
}

// Plugin types — mirrors plugins router
export interface PluginProviderInfo {
  fields: string[];
  writable_fields: string[];
  required_on_create: string[];
  include_in_list: boolean;
  include_in_detail: boolean;
}

export interface PluginInfo {
  name: string;
  type: string;
  version: string;
  description: string;
  depends_on: string[];
  provider: PluginProviderInfo | null;
}

// Doc types — mirrors docs router
export interface DocListItem {
  name: string;
  slug: string;
  description: string;
  content?: string;
}

export type DocDetail = DocListItem & { content: string };

// Graph tool types — mirrors tools/graph/schemas.py
export interface GraphRef {
  id: string;
  rel: string;
  direction: "forward" | "reverse";
  note: string | null;
  weight: number | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  refs: GraphRef[];
}

export interface GraphNode {
  id: string;
  title: string | null;
  summary: string | null;
  entry_type: string | null;
  tags: string[];
  visibility: string;
  depth: number;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  truncated: boolean;
  seed_ids: string[];
  mode: string;
}

// Activity types — mirrors activity.py
export interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  parent_id: string | null;
  metadata: Record<string, string> | null;
  created_at: string;
}

export interface ActivityFeedResponse {
  items: ActivityItem[];
  next_cursor: string | null;
}
