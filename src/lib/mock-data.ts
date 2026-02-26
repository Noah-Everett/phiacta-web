// Static demo data for UI mockup
// Backend not required — these are used as fallbacks when API is unavailable

export const MOCK_AGENTS = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Dr. Sarah Chen",
    agent_type: "human",
    trust_score: 0.94,
    bio: "Computational biologist at Stanford. Focus on molecular mechanisms of inflammation and cellular signaling.",
    claim_count: 28,
    review_count: 47,
    reach: 183, // times their claims are referenced
    claim_index: 9, // Phiacta h-index: 9 claims with ≥9 references each
    avg_confidence: 0.91,
    verified_claims: 18,
    created_at: "2024-03-12T10:00:00Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Prof. Michael Torres",
    agent_type: "human",
    trust_score: 0.91,
    bio: "Mathematician at MIT. Research focus: number theory, analytic continuation, and the Langlands programme.",
    claim_count: 14,
    review_count: 62,
    reach: 97,
    claim_index: 6,
    avg_confidence: 0.84,
    verified_claims: 7,
    created_at: "2024-01-08T09:00:00Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "VerifyBot-3",
    agent_type: "ai",
    trust_score: 0.87,
    bio: "Automated formal verification pipeline. Checks Lean 4 proofs and validates empirical reproducibility scripts.",
    claim_count: 0,
    review_count: 183,
    reach: 0,
    claim_index: 0,
    avg_confidence: null,
    verified_claims: 0,
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "d4e5f6a7-b8c9-0123-def0-234567890123",
    name: "Kai Nakamura",
    agent_type: "human",
    trust_score: 0.78,
    bio: "ML researcher. RLHF, benchmarking, and evaluation methodology. Previously at DeepMind.",
    claim_count: 9,
    review_count: 21,
    reach: 44,
    claim_index: 4,
    avg_confidence: 0.73,
    verified_claims: 5,
    created_at: "2024-09-15T14:00:00Z",
  },
  {
    id: "e5f6a7b8-c9d0-1234-ef01-345678901234",
    name: "Dr. Priya Mehta",
    agent_type: "human",
    trust_score: 0.89,
    bio: "Geophysicist at USGS. GPS geodesy, plate motion, and seismic hazard assessment.",
    claim_count: 11,
    review_count: 34,
    reach: 76,
    claim_index: 5,
    avg_confidence: 0.93,
    verified_claims: 9,
    created_at: "2024-02-20T08:00:00Z",
  },
];

export const MOCK_CLAIMS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Aspirin reduces systemic inflammation by inhibiting COX-1 and COX-2 enzymes",
    claim_type: "empirical",
    format: "markdown",
    topics: ["medicine", "pharmacology", "inflammation"],
    status: "active",
    verification_status: "empirical",
    epistemic_status: "endorsed",
    agree_count: 31,
    disagree_count: 2,
    neutral_count: 5,
    cached_confidence: 0.94,
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
    claim_type: "conjecture",
    format: "latex",
    topics: ["mathematics", "number-theory", "analytic-continuation"],
    status: "active",
    verification_status: "unverified",
    epistemic_status: "under_review",
    agree_count: 8,
    disagree_count: 0,
    neutral_count: 3,
    cached_confidence: null,
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
    claim_type: "theorem",
    format: "latex",
    topics: ["machine-learning", "mathematics", "transformers", "approximation-theory"],
    status: "active",
    verification_status: "verified",
    epistemic_status: "endorsed",
    agree_count: 19,
    disagree_count: 1,
    neutral_count: 2,
    cached_confidence: 0.88,
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
    claim_type: "empirical",
    format: "markdown",
    topics: ["ai-safety", "benchmarks", "large-language-models", "evaluation"],
    status: "active",
    verification_status: "empirical",
    epistemic_status: "disputed",
    agree_count: 12,
    disagree_count: 11,
    neutral_count: 4,
    cached_confidence: 0.51,
    created_by: "d4e5f6a7-b8c9-0123-def0-234567890123",
    created_at: "2024-08-22T15:00:00Z",
    updated_at: "2025-01-05T10:00:00Z",
    content_cache: `GPT-4 achieves 86.4% accuracy on the Massive Multitask Language Understanding (MMLU) benchmark, compared to the 89.8% average for human experts and 34.5% for random chance.

**Dispute:** The comparison cohort ("average human") is inconsistently defined across studies. Some reviewers argue the human baseline used undersamples domain experts, inflating the apparent GPT-4 advantage.

**Reproducibility:** Evaluation scripts available at \`verification/scripts/mmlu_eval.py\`.`,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Tectonic plate motion occurs at rates of 2–5 cm per year on average",
    claim_type: "empirical",
    format: "markdown",
    topics: ["geology", "geophysics", "plate-tectonics"],
    status: "active",
    verification_status: "empirical",
    epistemic_status: "endorsed",
    agree_count: 24,
    disagree_count: 0,
    neutral_count: 3,
    cached_confidence: 0.96,
    created_by: "e5f6a7b8-c9d0-1234-ef01-345678901234",
    created_at: "2024-04-05T09:00:00Z",
    updated_at: "2024-10-10T11:00:00Z",
    content_cache: `GPS measurements from the International GNSS Service (IGS) network confirm that tectonic plates move at average rates of 2–5 cm/year, with the fastest plates (Pacific, Cocos, Nazca) exceeding 10 cm/year.

**Data:** 30 years of continuous GPS measurements from >500 stations. Dataset available at \`verification/data/igs_velocities.csv\`.`,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "The Drake Equation provides a framework for estimating N, the number of communicating civilizations",
    claim_type: "definition",
    format: "latex",
    topics: ["astrobiology", "SETI", "probability"],
    status: "active",
    verification_status: "unverified",
    epistemic_status: "under_review",
    agree_count: 6,
    disagree_count: 2,
    neutral_count: 7,
    cached_confidence: 0.63,
    created_by: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    created_at: "2025-01-20T12:00:00Z",
    updated_at: "2025-02-10T08:00:00Z",
    content_cache: `$N = R_{*} \\cdot f_{p} \\cdot n_{e} \\cdot f_{l} \\cdot f_{i} \\cdot f_{c} \\cdot L$

Where $R_*$ is the average rate of star formation, $f_p$ is the fraction with planets, $n_e$ is the average number of planets that could support life, $f_l$ is the fraction that develop life, $f_i$ is the fraction that develop intelligence, $f_c$ is the fraction that develop detectable technology, and $L$ is the length of time such civilizations release detectable signals.`,
  },
];

export const MOCK_REFERENCES = [
  {
    id: "ref-1",
    source_uri: "claim:33333333-3333-3333-3333-333333333333",
    target_uri: "claim:44444444-4444-4444-4444-444444444444",
    role: "method",
    source_claim_id: "33333333-3333-3333-3333-333333333333",
    target_claim_id: "44444444-4444-4444-4444-444444444444",
    target_title: "GPT-4 exceeds average human performance on MMLU",
    created_at: "2025-01-12T10:00:00Z",
  },
  {
    id: "ref-2",
    source_uri: "claim:11111111-1111-1111-1111-111111111111",
    target_uri: "claim:55555555-5555-5555-5555-555555555555",
    role: "corroboration",
    source_claim_id: "11111111-1111-1111-1111-111111111111",
    target_claim_id: "55555555-5555-5555-5555-555555555555",
    target_title: "Tectonic plate motion occurs at 2–5 cm per year",
    created_at: "2024-12-01T15:00:00Z",
  },
  {
    id: "ref-3",
    source_uri: "claim:44444444-4444-4444-4444-444444444444",
    target_uri: "claim:33333333-3333-3333-3333-333333333333",
    role: "evidence",
    source_claim_id: "44444444-4444-4444-4444-444444444444",
    target_claim_id: "33333333-3333-3333-3333-333333333333",
    target_title: "Transformer self-attention converges to kernel smoothing",
    created_at: "2025-01-18T09:00:00Z",
  },
];

export const MOCK_EDITS = [
  {
    number: 3,
    title: "Clarify effect size units and add forest plot reference",
    state: "open",
    created_by: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    author_name: "Prof. Michael Torres",
    created_at: "2025-02-10T09:00:00Z",
    body: "The current effect size description uses mixed units. Proposal: standardize to Cohen's d and add a reference to the meta-analysis forest plot. The 38% CRP reduction figure should also cite the specific meta-analysis it comes from.",
    diff: `- **Effect size:** Mean reduction in serum C-reactive protein (CRP) of 38% at 81 mg/day
+ **Effect size:** Cohen's d = 0.72 (95% CI: 0.54–0.90). Mean CRP reduction 38%
+ (Smith et al. 2019 meta-analysis, N=4,821, 23 RCTs).`,
  },
  {
    number: 2,
    title: "Add mechanism diagram for COX pathway",
    state: "merged",
    created_by: "d4e5f6a7-b8c9-0123-def0-234567890123",
    author_name: "Kai Nakamura",
    created_at: "2024-12-15T14:00:00Z",
    body: "Adds a simplified diagram of the arachidonic acid cascade to attachments/. Aids readers unfamiliar with the biochemical pathway.",
    diff: `+ attachments/cox-pathway-diagram.svg (new file)
  Updated claim.md to reference diagram`,
  },
];

export const MOCK_ISSUES = [
  {
    number: 5,
    title: "Does COX-2 inhibition persist after aspirin is metabolized?",
    state: "open",
    created_by: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    author_name: "Prof. Michael Torres",
    created_at: "2025-01-28T11:00:00Z",
    body: "The claim focuses on irreversible inhibition, but aspirin's plasma half-life is only ~20 minutes. The COX-2 inhibition is irreversible at the enzyme level, but how does the sustained anti-inflammatory effect persist across multiple dosing intervals? Does this affect the scope of the claim?",
    comment_count: 3,
    comments: [
      {
        id: "c1",
        author_name: "Dr. Sarah Chen",
        author_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        body: "Good question. The key distinction is enzyme-level vs. plasma-level pharmacokinetics. Aspirin irreversibly acetylates COX-2 at the enzyme active site. Since platelets cannot synthesize new COX enzymes (they lack nuclei), the inhibition of platelet COX-1 lasts the ~8–10 day platelet lifespan. Nucleated cells like macrophages *can* synthesize new COX-2, so the duration for anti-inflammatory effects is shorter — typically 4–6 hours. I'll clarify the claim to distinguish platelet vs. nucleated-cell effects.",
        created_at: "2025-01-29T09:00:00Z",
      },
      {
        id: "c2",
        author_name: "Prof. Michael Torres",
        author_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        body: "That clarification is really helpful. So the long-duration anti-platelet effect is mechanistically distinct from the anti-inflammatory effect, which is shorter-lived. The claim title mixes these two effects. Should we split this into two claims?",
        created_at: "2025-01-30T14:00:00Z",
      },
      {
        id: "c3",
        author_name: "Dr. Sarah Chen",
        author_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        body: "Agreed — splitting is cleaner. I'll archive this claim and create two separate ones: one for anti-platelet effect (COX-1, irreversible, 8-10 days) and one for anti-inflammatory effect (COX-2, effectively ~4-6 hours per dose). Will open an edit with the split proposal.",
        created_at: "2025-01-31T10:00:00Z",
      },
    ],
  },
  {
    number: 4,
    title: "Clarify population scope — CRP > 3 mg/L vs. general population",
    state: "closed",
    created_by: "d4e5f6a7-b8c9-0123-def0-234567890123",
    author_name: "Kai Nakamura",
    created_at: "2025-01-05T16:00:00Z",
    body: "The 38% CRP reduction figure applies specifically to patients with elevated baseline CRP (> 3 mg/L), not the general population. For patients with normal baseline CRP, the absolute reduction is much smaller and may not be clinically meaningful. The claim should scope this clearly.",
    comment_count: 2,
    comments: [
      {
        id: "c4",
        author_name: "Dr. Sarah Chen",
        author_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        body: "Correct. I've updated the claim text to explicitly scope the 38% figure to the elevated-CRP subgroup (baseline CRP > 3 mg/L). The general population effect is negligible at the 81 mg dose used in most long-term studies.",
        created_at: "2025-01-07T11:00:00Z",
      },
      {
        id: "c5",
        author_name: "Kai Nakamura",
        author_id: "d4e5f6a7-b8c9-0123-def0-234567890123",
        body: "Thanks — the updated text is much clearer. Closing.",
        created_at: "2025-01-08T09:00:00Z",
      },
    ],
  },
];

export const MOCK_HISTORY = [
  {
    sha: "a8f3c21b9d4e7f0a1b2c3d4e5f6a7b8c9d0e1f2a",
    message: "Add COX-2 selectivity note and population scope clarification",
    author_name: "Dr. Sarah Chen",
    timestamp: "2025-01-15T09:00:00Z",
    files_changed: ["claim.md"],
    additions: 8,
    deletions: 3,
    body: "Scoped the 38% CRP reduction figure to baseline CRP > 3 mg/L subgroup. Added note on nucleated-cell vs. platelet COX-2 inhibition duration.",
  },
  {
    sha: "b7e2d30a8c5f9b2c3d4e5f6a7b8c9d0e1f2a3b4c",
    message: "Include meta-analysis citation and effect size confidence interval",
    author_name: "Dr. Sarah Chen",
    timestamp: "2024-12-20T14:30:00Z",
    files_changed: ["claim.md", "claim.yaml"],
    additions: 12,
    deletions: 4,
    body: "Added 95% CI for the CRP reduction effect size. Added reference to Smith et al. 2019 meta-analysis.",
  },
  {
    sha: "c6d1e2f9a7b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
    message: "Initial claim submission",
    author_name: "Dr. Sarah Chen",
    timestamp: "2024-11-02T14:30:00Z",
    files_changed: ["claim.md", "claim.yaml", "verification/manifest.yaml", "verification/data/crp_study_data.csv"],
    additions: 47,
    deletions: 0,
    body: "Initial submission. Includes claim body, metadata, and supporting CRP dataset.",
  },
];

export const MOCK_REVIEWS = [
  {
    id: "rev-1",
    claim_id: "11111111-1111-1111-1111-111111111111",
    claim_title: "Aspirin reduces systemic inflammation by inhibiting COX-1 and COX-2",
    author_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    author_name: "Prof. Michael Torres",
    kind: "review",
    signal: "agree",
    confidence: 0.92,
    weight: 0.91,
    body: "The mechanism is well-established and the evidence basis is solid. Vane's original work is foundational and the 200+ clinical trial replications are well-documented. My one concern is the scoping of the effect size — the 38% CRP reduction applies specifically to the elevated-baseline subgroup, which is now clarified in the current version. Supporting materials (CRP dataset) are present and appear methodologically sound.",
    created_at: "2024-11-28T14:00:00Z",
  },
  {
    id: "rev-2",
    claim_id: "11111111-1111-1111-1111-111111111111",
    claim_title: "Aspirin reduces systemic inflammation by inhibiting COX-1 and COX-2",
    author_id: "d4e5f6a7-b8c9-0123-def0-234567890123",
    author_name: "Kai Nakamura",
    kind: "review",
    signal: "agree",
    confidence: 0.85,
    weight: 0.78,
    body: "Core mechanism is correct and well-cited. I'd like to see the dose-response relationship explored more — does the COX-2 inhibition profile differ meaningfully between 81 mg and 325 mg doses? The current claim doesn't scope the dose, which matters for interpreting the anti-inflammatory vs. anti-platelet effects.",
    created_at: "2024-12-05T10:00:00Z",
  },
  {
    id: "rev-3",
    claim_id: "22222222-2222-2222-2222-222222222222",
    claim_title: "All non-trivial zeros of the Riemann zeta function lie on the critical line",
    author_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    author_name: "Dr. Sarah Chen",
    kind: "review",
    signal: "neutral",
    confidence: 0.5,
    weight: 0.94,
    body: "I'm outside my domain here. The statement is correctly formulated per the standard references and the Gourdon computational verification is well-scoped. I defer to domain experts for any substantive assessment.",
    created_at: "2025-01-02T16:00:00Z",
  },
  {
    id: "rev-4",
    claim_id: "44444444-4444-4444-4444-444444444444",
    claim_title: "GPT-4 exceeds average human performance on MMLU",
    author_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    author_name: "Prof. Michael Torres",
    kind: "review",
    signal: "disagree",
    confidence: 0.8,
    weight: 0.91,
    body: "The human baseline is not appropriately defined. The 'average human' cohort was recruited via crowdwork platforms and is not representative of subject-matter experts for most MMLU categories. A more defensible comparison would be GPT-4 vs. credentialed practitioners in each MMLU domain. Until that comparison is made, the claim as stated is misleading.",
    created_at: "2025-01-20T09:00:00Z",
  },
  {
    id: "rev-5",
    claim_id: "33333333-3333-3333-3333-333333333333",
    claim_title: "Transformer self-attention converges to kernel smoothing",
    author_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    author_name: "VerifyBot-3",
    kind: "review",
    signal: "agree",
    confidence: 0.97,
    weight: 0.87,
    body: "Lean 4 proof verified successfully. All type constraints satisfied. Proof compiles against Lean 4.3.0 / Mathlib 4.8.0. Reproducibility script passed.",
    created_at: "2025-01-11T03:14:00Z",
  },
];

// Agent reviews given by Dr. Sarah Chen (for profile page)
export const AGENT_REVIEWS_GIVEN: Record<string, typeof MOCK_REVIEWS> = {
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890": [
    {
      id: "rev-3",
      claim_id: "22222222-2222-2222-2222-222222222222",
      claim_title: "All non-trivial zeros of the Riemann zeta function lie on the critical line",
      author_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      author_name: "Dr. Sarah Chen",
      kind: "review",
      signal: "neutral",
      confidence: 0.5,
      weight: 0.94,
      body: "I'm outside my domain here. The statement is correctly formulated per the standard references and the Gourdon computational verification is well-scoped. I defer to domain experts for any substantive assessment.",
      created_at: "2025-01-02T16:00:00Z",
    },
  ],
  "b2c3d4e5-f6a7-8901-bcde-f12345678901": [
    {
      id: "rev-4",
      claim_id: "44444444-4444-4444-4444-444444444444",
      claim_title: "GPT-4 exceeds average human performance on MMLU",
      author_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      author_name: "Prof. Michael Torres",
      kind: "review",
      signal: "disagree",
      confidence: 0.8,
      weight: 0.91,
      body: "The human baseline is not appropriately defined. The 'average human' cohort was recruited via crowdwork platforms and is not representative of subject-matter experts for most MMLU categories.",
      created_at: "2025-01-20T09:00:00Z",
    },
  ],
};

// Repo file trees for each claim type
export const MOCK_CLAIM_FILES: Record<string, { path: string; type: "file" | "dir"; size?: number }[]> = {
  "11111111-1111-1111-1111-111111111111": [
    { path: "claim.md", type: "file", size: 1842 },
    { path: "claim.yaml", type: "file", size: 248 },
    { path: "verification/", type: "dir" },
    { path: "verification/manifest.yaml", type: "file", size: 186 },
    { path: "verification/data/", type: "dir" },
    { path: "verification/data/crp_study_data.csv", type: "file", size: 284_412 },
    { path: "verification/scripts/", type: "dir" },
    { path: "verification/scripts/meta_analysis.py", type: "file", size: 3_921 },
    { path: "attachments/", type: "dir" },
    { path: "attachments/cox-pathway-diagram.svg", type: "file", size: 14_200 },
  ],
  "33333333-3333-3333-3333-333333333333": [
    { path: "claim.md", type: "file", size: 2_104 },
    { path: "claim.yaml", type: "file", size: 312 },
    { path: "verification/", type: "dir" },
    { path: "verification/manifest.yaml", type: "file", size: 204 },
    { path: "verification/proof.lean", type: "file", size: 8_742 },
    { path: "verification/scripts/", type: "dir" },
    { path: "verification/scripts/reproduce.py", type: "file", size: 2_180 },
  ],
  default: [
    { path: "claim.md", type: "file", size: 1_240 },
    { path: "claim.yaml", type: "file", size: 186 },
    { path: "verification/", type: "dir" },
    { path: "verification/manifest.yaml", type: "file", size: 124 },
  ],
};

// File contents for preview
export const MOCK_FILE_CONTENTS: Record<string, string> = {
  "claim.yaml": `format: markdown
title: "Aspirin reduces systemic inflammation by inhibiting COX-1 and COX-2 enzymes"
claim_type: empirical
authors:
  - agent:a1b2c3d4-e5f6-7890-abcd-ef1234567890
topics:
  - medicine
  - pharmacology
  - inflammation`,
  "verification/manifest.yaml": `type: empirical
entries:
  - file: data/crp_study_data.csv
    role: supporting-data
    format: csv
  - file: scripts/meta_analysis.py
    role: reproducibility
    format: python`,
};

export const MOCK_EXTENSIONS = [
  {
    id: "ext-1",
    name: "Paper Generator",
    slug: "paper-generator",
    description: "Takes a set of claims and produces a formatted academic paper in LaTeX or PDF. Handles citation formatting, figure placement, and journal style templates.",
    icon: "📄",
    author: "Phiacta Labs",
    is_official: true,
    uses: 1_243,
    tags: ["publishing", "latex", "pdf"],
  },
  {
    id: "ext-2",
    name: "Lecture Slide Builder",
    slug: "slide-builder",
    description: "Generates teaching materials from a topic's claims. Creates structured slide decks with claim summaries, evidence levels, and discussion questions for classroom use.",
    icon: "🎓",
    author: "EduFlow",
    is_official: false,
    uses: 892,
    tags: ["education", "slides", "teaching"],
  },
  {
    id: "ext-3",
    name: "Podcast Creator",
    slug: "podcast-creator",
    description: "Converts a claim and its discussion threads into a structured audio conversation. Two AI hosts summarize the claim, review the evidence, and present opposing views.",
    icon: "🎙️",
    author: "AudioKnowledge",
    is_official: false,
    uses: 2_108,
    tags: ["audio", "ai", "accessibility"],
  },
  {
    id: "ext-4",
    name: "Literature Review Builder",
    slug: "lit-review",
    description: "Generates a structured literature review from a set of claims. Organises evidence by epistemic status, groups related claims, and produces a formatted survey document.",
    icon: "📚",
    author: "OpenClaims Community",
    is_official: false,
    uses: 1_677,
    tags: ["research", "survey", "publishing"],
  },
  {
    id: "ext-5",
    name: "Claim Graph Explorer",
    slug: "graph-explorer",
    description: "An interactive visual explorer for claim reference networks. Pan, zoom, filter by type, and export graph views as SVG or PNG for use in presentations and papers.",
    icon: "🕸️",
    author: "Phiacta Labs",
    is_official: true,
    uses: 3_481,
    tags: ["visualisation", "graph", "presentation"],
  },
  {
    id: "ext-6",
    name: "Textbook Composer",
    slug: "textbook-composer",
    description: "Assembles a set of claims into a structured textbook chapter. Produces introduction, body sections organised by reference graph, summary, and review questions.",
    icon: "📖",
    author: "CurriculaAI",
    is_official: false,
    uses: 417,
    tags: ["education", "publishing", "long-form"],
  },
];

export type MockClaim = (typeof MOCK_CLAIMS)[0];
export type MockAgent = (typeof MOCK_AGENTS)[0];
export type MockExtension = (typeof MOCK_EXTENSIONS)[0];
