// User types — mirrors auth.py UserResponse
export interface User {
  id: string;
  handle: string;
  created_at: string;
}

// Same shape — backend uses identical fields for public view
export type PublicUserResponse = User;

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Entry types — mirrors entry.py
export interface EntryListItem {
  id: string;
  title: string;
  layout_hint: string | null;
  summary: string | null;
  license: string | null;
  content_format: string;
  schema_version: number;
  forgejo_repo_id: number | null;
  repo_name: string;
  current_head_sha: string | null;
  repo_status: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EntryResponse extends EntryListItem {
  content_cache: string | null;
}

export interface EntryDetailResponse extends EntryResponse {
  outgoing_refs: EntryRefResponse[];
  incoming_refs: EntryRefResponse[];
}

export interface EntryCreate {
  title: string;
  content_format?: string;
  layout_hint?: string | null;
  summary?: string | null;
  license?: string | null;
  content?: string | null;
}

// Entry ref types — mirrors entry_ref.py
export interface EntryRefResponse {
  id: string;
  from_entry_id: string;
  to_entry_id: string;
  rel: string;
  version_sha: string | null;
  note: string | null;
  created_at: string;
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
  handle: string;
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
  title: string;
}

// Issue types — mirrors entry_issue.py
export interface IssueAuthor {
  handle: string;
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
  layout_hint: string | null;
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
