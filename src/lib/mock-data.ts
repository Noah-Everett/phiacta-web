// Static demo data for UI mockup
// Backend not required — these are used as fallbacks when API is unavailable

import type {
  PublicAgentResponse,
  EntryListItem,
  EntryRefResponse,
  EditProposalListItem,
  CommitListItem,
  FileListItem,
} from "./types";

export const MOCK_AGENTS: PublicAgentResponse[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    handle: "sarah-chen",
    agent_type: "human",
    is_active: true,
    created_at: "2024-03-12T10:00:00Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    handle: "michael-torres",
    agent_type: "human",
    is_active: true,
    created_at: "2024-01-08T09:00:00Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    handle: "verifybot-3",
    agent_type: "ai",
    is_active: true,
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "d4e5f6a7-b8c9-0123-def0-234567890123",
    handle: "kai-nakamura",
    agent_type: "human",
    is_active: true,
    created_at: "2024-09-15T14:00:00Z",
  },
  {
    id: "e5f6a7b8-c9d0-1234-ef01-345678901234",
    handle: "priya-mehta",
    agent_type: "human",
    is_active: true,
    created_at: "2024-02-20T08:00:00Z",
  },
];

export const MOCK_ENTRIES: (EntryListItem & { content_cache?: string })[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Aspirin reduces systemic inflammation by inhibiting COX-1 and COX-2 enzymes",
    layout_hint: "empirical",
    summary: "Aspirin irreversibly inhibits COX-1 and COX-2 enzymes, preventing prostaglandin and thromboxane synthesis.",
    license: "CC-BY-4.0",
    content_format: "markdown",
    schema_version: 1,
    forgejo_repo_id: 101,
    repo_name: "entry-11111111",
    current_head_sha: "a8f3c21b9d4e7f0a1b2c3d4e5f6a7b8c9d0e1f2a",
    repo_status: "ready",
    status: "active",
    created_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    created_at: "2024-11-02T14:30:00Z",
    updated_at: "2025-01-15T09:00:00Z",
    content_cache: `Aspirin (acetylsalicylic acid) irreversibly inhibits cyclooxygenase-1 (COX-1) and COX-2 enzymes via acetylation of a serine residue at the active site. This prevents the conversion of arachidonic acid to prostaglandins and thromboxanes — key mediators of the inflammatory response.

**Evidence basis:** Vane (1971), Nobel Prize in Physiology or Medicine 1982. Replicated across >200 clinical trials.

**Effect size:** Mean reduction in serum C-reactive protein (CRP) of 38% at 81 mg/day in patients with baseline CRP > 3 mg/L (95% CI: 29–47%).`,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "All non-trivial zeros of the Riemann zeta function lie on the critical line Re(s) = 1/2",
    layout_hint: "conjecture",
    summary: "The Riemann Hypothesis — one of the Millennium Prize Problems.",
    license: "CC-BY-4.0",
    content_format: "latex",
    schema_version: 1,
    forgejo_repo_id: 102,
    repo_name: "entry-22222222",
    current_head_sha: "b7e2d30a8c5f9b2c3d4e5f6a7b8c9d0e1f2a3b4c",
    repo_status: "ready",
    status: "active",
    created_by: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    created_at: "2024-06-18T11:00:00Z",
    updated_at: "2024-12-20T16:00:00Z",
    content_cache: `The Riemann Hypothesis states that all non-trivial zeros of the Riemann zeta function $\\zeta(s)$ have real part equal to $\\frac{1}{2}$.

Formally: if $\\zeta(s) = 0$ and $s \\notin \\{-2, -4, -6, \\ldots\\}$, then $\\text{Re}(s) = \\frac{1}{2}$.

**Status:** Unproven. One of the Millennium Prize Problems (Clay Mathematics Institute, $1M prize). Computationally verified for the first $10^{13}$ non-trivial zeros (Gourdon, 2004).`,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "Transformer self-attention converges to kernel smoothing in the infinite-head limit",
    layout_hint: "theorem",
    summary: "Attention output converges to a Nadaraya-Watson kernel estimator as heads grow.",
    license: "CC-BY-4.0",
    content_format: "latex",
    schema_version: 1,
    forgejo_repo_id: 103,
    repo_name: "entry-33333333",
    current_head_sha: "c6d1e2f9a7b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
    repo_status: "ready",
    status: "active",
    created_by: "d4e5f6a7-b8c9-0123-def0-234567890123",
    created_at: "2025-01-10T08:00:00Z",
    updated_at: "2025-02-01T12:00:00Z",
    content_cache: `Let $A^{(H)}$ denote the attention matrix with $H$ heads. As $H \\to \\infty$, under appropriate scaling, the attention output converges in probability to a Nadaraya-Watson kernel estimator with a positive definite kernel $K$.

**Proof:** Verified in Lean 4. See \`verification/proof.lean\`.

**Corollary:** Transformers with sufficient heads can approximate any continuous function in the RKHS induced by $K$, providing a non-parametric universality guarantee.`,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "GPT-4 exceeds average human performance on the MMLU benchmark",
    layout_hint: "empirical",
    summary: "GPT-4 achieves 86.4% on MMLU vs. 89.8% for human experts.",
    license: "CC-BY-4.0",
    content_format: "markdown",
    schema_version: 1,
    forgejo_repo_id: 104,
    repo_name: "entry-44444444",
    current_head_sha: "d5e2f3a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
    repo_status: "ready",
    status: "active",
    created_by: "d4e5f6a7-b8c9-0123-def0-234567890123",
    created_at: "2024-08-22T15:00:00Z",
    updated_at: "2025-01-05T10:00:00Z",
    content_cache: `GPT-4 achieves 86.4% accuracy on the Massive Multitask Language Understanding (MMLU) benchmark, compared to the 89.8% average for human experts and 34.5% for random chance.

**Dispute:** The comparison cohort ("average human") is inconsistently defined across studies. Some reviewers argue the human baseline used undersamples domain experts, inflating the apparent GPT-4 advantage.

**Reproducibility:** Evaluation scripts available at \`verification/scripts/mmlu_eval.py\`.`,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Tectonic plate motion occurs at rates of 2-5 cm per year on average",
    layout_hint: "empirical",
    summary: "GPS measurements from the IGS network confirm plate motion velocities.",
    license: "CC-BY-4.0",
    content_format: "markdown",
    schema_version: 1,
    forgejo_repo_id: 105,
    repo_name: "entry-55555555",
    current_head_sha: "e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5",
    repo_status: "ready",
    status: "active",
    created_by: "e5f6a7b8-c9d0-1234-ef01-345678901234",
    created_at: "2024-04-05T09:00:00Z",
    updated_at: "2024-10-10T11:00:00Z",
    content_cache: `GPS measurements from the International GNSS Service (IGS) network confirm that tectonic plates move at average rates of 2–5 cm/year, with the fastest plates (Pacific, Cocos, Nazca) exceeding 10 cm/year.

**Data:** 30 years of continuous GPS measurements from >500 stations. Dataset available at \`verification/data/igs_velocities.csv\`.`,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "The Drake Equation provides a framework for estimating N, the number of communicating civilizations",
    layout_hint: "definition",
    summary: "The Drake Equation: N = R* x fp x ne x fl x fi x fc x L.",
    license: "CC-BY-4.0",
    content_format: "latex",
    schema_version: 1,
    forgejo_repo_id: 106,
    repo_name: "entry-66666666",
    current_head_sha: "f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4",
    repo_status: "ready",
    status: "active",
    created_by: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    created_at: "2025-01-20T12:00:00Z",
    updated_at: "2025-02-10T08:00:00Z",
    content_cache: `$N = R_{*} \\cdot f_{p} \\cdot n_{e} \\cdot f_{l} \\cdot f_{i} \\cdot f_{c} \\cdot L$

Where $R_*$ is the average rate of star formation, $f_p$ is the fraction with planets, $n_e$ is the average number of planets that could support life, $f_l$ is the fraction that develop life, $f_i$ is the fraction that develop intelligence, $f_c$ is the fraction that develop detectable technology, and $L$ is the length of time such civilizations release detectable signals.`,
  },
];

export const MOCK_REFERENCES: EntryRefResponse[] = [
  {
    id: "ref-1",
    from_entry_id: "33333333-3333-3333-3333-333333333333",
    to_entry_id: "44444444-4444-4444-4444-444444444444",
    rel: "method",
    version_sha: null,
    note: "Transformer theory applied to benchmark analysis",
    created_at: "2025-01-12T10:00:00Z",
  },
  {
    id: "ref-2",
    from_entry_id: "11111111-1111-1111-1111-111111111111",
    to_entry_id: "55555555-5555-5555-5555-555555555555",
    rel: "corroboration",
    version_sha: null,
    note: "Empirical measurement methodology analogy",
    created_at: "2024-12-01T15:00:00Z",
  },
  {
    id: "ref-3",
    from_entry_id: "44444444-4444-4444-4444-444444444444",
    to_entry_id: "33333333-3333-3333-3333-333333333333",
    rel: "evidence",
    version_sha: null,
    note: "Benchmark results support convergence theory",
    created_at: "2025-01-18T09:00:00Z",
  },
];

export const MOCK_EDITS: EditProposalListItem[] = [
  {
    number: 3,
    title: "Clarify effect size units and add forest plot reference",
    body: "The current effect size description uses mixed units. Proposal: standardize to Cohen's d and add a reference to the meta-analysis forest plot.",
    state: "open",
    is_draft: false,
    author: { handle: "michael-torres", agent_type: "human" },
    head_branch: "clarify-effect-size",
    base_branch: "main",
    created_at: "2025-02-10T09:00:00Z",
    updated_at: "2025-02-10T09:00:00Z",
    merged_at: null,
  },
  {
    number: 2,
    title: "Add mechanism diagram for COX pathway",
    body: "Adds a simplified diagram of the arachidonic acid cascade to attachments/.",
    state: "closed",
    is_draft: false,
    author: { handle: "kai-nakamura", agent_type: "human" },
    head_branch: "add-cox-diagram",
    base_branch: "main",
    created_at: "2024-12-15T14:00:00Z",
    updated_at: "2024-12-20T10:00:00Z",
    merged_at: "2024-12-20T10:00:00Z",
  },
];

export const MOCK_HISTORY: CommitListItem[] = [
  {
    sha: "a8f3c21b9d4e7f0a1b2c3d4e5f6a7b8c9d0e1f2a",
    message: "Add COX-2 selectivity note and population scope clarification",
    author: { name: "sarah-chen", email: "sarah@example.com" },
    timestamp: "2025-01-15T09:00:00Z",
  },
  {
    sha: "b7e2d30a8c5f9b2c3d4e5f6a7b8c9d0e1f2a3b4c",
    message: "Include meta-analysis citation and effect size confidence interval",
    author: { name: "sarah-chen", email: "sarah@example.com" },
    timestamp: "2024-12-20T14:30:00Z",
  },
  {
    sha: "c6d1e2f9a7b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
    message: "Initial entry submission",
    author: { name: "sarah-chen", email: "sarah@example.com" },
    timestamp: "2024-11-02T14:30:00Z",
  },
];

export const MOCK_FILES: FileListItem[] = [
  { name: "README.md", path: "README.md", type: "file", size: 1842 },
  { name: "entry.yaml", path: ".phiacta/entry.yaml", type: "file", size: 248 },
  { name: "manifest.yaml", path: ".phiacta/manifest.yaml", type: "file", size: 186 },
  { name: "crp_study_data.csv", path: "verification/data/crp_study_data.csv", type: "file", size: 284412 },
  { name: "meta_analysis.py", path: "verification/scripts/meta_analysis.py", type: "file", size: 3921 },
  { name: "cox-pathway-diagram.svg", path: "attachments/cox-pathway-diagram.svg", type: "file", size: 14200 },
];

export const MOCK_FILES_THEOREM: FileListItem[] = [
  { name: "README.md", path: "README.md", type: "file", size: 2104 },
  { name: "entry.yaml", path: ".phiacta/entry.yaml", type: "file", size: 312 },
  { name: "manifest.yaml", path: ".phiacta/manifest.yaml", type: "file", size: 204 },
  { name: "proof.lean", path: "verification/proof.lean", type: "file", size: 8742 },
  { name: "reproduce.py", path: "verification/scripts/reproduce.py", type: "file", size: 2180 },
];

export const MOCK_FILES_DEFAULT: FileListItem[] = [
  { name: "README.md", path: "README.md", type: "file", size: 1240 },
  { name: "entry.yaml", path: ".phiacta/entry.yaml", type: "file", size: 186 },
  { name: "manifest.yaml", path: ".phiacta/manifest.yaml", type: "file", size: 124 },
];

export const MOCK_ENTRY_FILES: Record<string, FileListItem[]> = {
  "11111111-1111-1111-1111-111111111111": MOCK_FILES,
  "33333333-3333-3333-3333-333333333333": MOCK_FILES_THEOREM,
  default: MOCK_FILES_DEFAULT,
};

export const MOCK_EXTENSIONS = [
  {
    id: "ext-1",
    name: "Paper Generator",
    slug: "paper-generator",
    description: "Takes a set of entries and produces a formatted academic paper in LaTeX or PDF. Handles citation formatting, figure placement, and journal style templates.",
    icon: "\u{1F4C4}",
    author: "Phiacta Labs",
    is_official: true,
    uses: 1_243,
    tags: ["publishing", "latex", "pdf"],
  },
  {
    id: "ext-2",
    name: "Lecture Slide Builder",
    slug: "slide-builder",
    description: "Generates teaching materials from a set of entries. Creates structured slide decks with entry summaries, evidence levels, and discussion questions for classroom use.",
    icon: "\u{1F393}",
    author: "EduFlow",
    is_official: false,
    uses: 892,
    tags: ["education", "slides", "teaching"],
  },
  {
    id: "ext-3",
    name: "Podcast Creator",
    slug: "podcast-creator",
    description: "Converts an entry and its discussion threads into a structured audio conversation. Two AI hosts summarize the entry, review the evidence, and present opposing views.",
    icon: "\u{1F399}\uFE0F",
    author: "AudioKnowledge",
    is_official: false,
    uses: 2_108,
    tags: ["audio", "ai", "accessibility"],
  },
  {
    id: "ext-4",
    name: "Literature Review Builder",
    slug: "lit-review",
    description: "Generates a structured literature review from a set of entries. Organises entries by type, groups related ones, and produces a formatted survey document.",
    icon: "\u{1F4DA}",
    author: "OpenEntries Community",
    is_official: false,
    uses: 1_677,
    tags: ["research", "survey", "publishing"],
  },
  {
    id: "ext-5",
    name: "Entry Graph Explorer",
    slug: "graph-explorer",
    description: "An interactive visual explorer for entry reference networks. Pan, zoom, filter by type, and export graph views as SVG or PNG for use in presentations and papers.",
    icon: "\u{1F578}\uFE0F",
    author: "Phiacta Labs",
    is_official: true,
    uses: 3_481,
    tags: ["visualisation", "graph", "presentation"],
  },
  {
    id: "ext-6",
    name: "Textbook Composer",
    slug: "textbook-composer",
    description: "Assembles a set of entries into a structured textbook chapter. Produces introduction, body sections organised by reference graph, summary, and review questions.",
    icon: "\u{1F4D6}",
    author: "CurriculaAI",
    is_official: false,
    uses: 417,
    tags: ["education", "publishing", "long-form"],
  },
];

export type MockExtension = (typeof MOCK_EXTENSIONS)[0];
