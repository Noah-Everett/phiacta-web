import Link from "next/link";
import { BuildOnItTabs } from "@/components/BuildOnItTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  ShieldCheck,
  Globe,
  MessageSquare,
  Puzzle,
  Atom,
  XCircle,
  Database,
  Layers,
  ArrowRight,
  FileX,
  BookOpen,
  Bot,
  Tag,
  FileCode2,
  Link2,
  GraduationCap,
  Wrench,
  Network,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    icon: FileX,
    title: "Most research never gets shared",
    body: "Papers demand a complete story. Null results, negative findings, single theorems, intermediate observations — they disappear. Phiacta accepts anything worth citing.",
  },
  {
    icon: MessageSquare,
    title: "Published work can't be corrected",
    body: "A wrong result in a PDF stays wrong. On Phiacta, anyone can open an issue or propose a correction. Every version is preserved — including the original.",
  },
  {
    icon: BookOpen,
    title: "Knowledge is buried in prose",
    body: "Finding a specific result means reading a whole paper. On Phiacta, every entry is its own unit — searchable, taggable, and directly linkable.",
  },
  {
    icon: Bot,
    title: "AI can't reason over PDFs",
    body: "Language models can't meaningfully query a PDF archive. Phiacta entries are typed, structured, and accessible via API and MCP — ready for agents out of the box.",
  },
];

const CALLOUT_LEGEND = [
  { n: 1, label: "Entry type", desc: "theorem, result, paper, dataset, method — or anything else" },
  { n: 2, label: "Evidence", desc: "attached proofs, data, code — presence or absence is visible" },
  { n: 3, label: "Summary", desc: "the key claim in plain language" },
  { n: 4, label: "Tags", desc: "for search and discovery" },
  { n: 5, label: "Content", desc: "markdown or LaTeX, fully rendered" },
  { n: 6, label: "Attached files", desc: "proofs, notebooks, raw data" },
  { n: 7, label: "References", desc: "typed links building the knowledge graph" },
  { n: 8, label: "Version history", desc: "every edit preserved; any version is permanently citable" },
];

const PRINCIPLES = [
  {
    icon: Atom,
    title: "Entries are the unit of knowledge",
    body: "An entry represents something worth citing — a single finding, a full paper, a dataset, a method. Composite entries tie related entries together with references.",
  },
  {
    icon: GitBranch,
    title: "Permanent versioned history",
    body: "Every version of every entry is preserved forever. Nothing is deleted — entries can be made private but their full history remains intact.",
  },
  {
    icon: ShieldCheck,
    title: "Proof over assertion",
    body: "Empirical entries attach the data and code that produced the result. Mathematical entries attach machine-checkable proofs. Unverified entries are accepted — but the absence of proof is visible to everyone.",
  },
  {
    icon: Globe,
    title: "Public by default, author-controlled",
    body: "Entries are publicly readable by anyone. Only the author and explicit collaborators can modify an entry — like a public open-source repository.",
  },
  {
    icon: XCircle,
    title: "Negative results count",
    body: "The current system only rewards what worked. A null result, a failed replication, or an experiment that didn't pan out is just as valuable — and should be an entry.",
  },
  {
    icon: MessageSquare,
    title: "Record, don't resolve",
    body: "Contradictory entries coexist. The system records what has been asserted and by whom. Resolving disagreements is left to the community through reviews and discussion.",
  },
  {
    icon: Database,
    title: "Ground truth only",
    body: "The database stores only what users directly provide. Confidence scores, graph traversals, and rankings are derived at query time and never written back as ground truth.",
  },
  {
    icon: Puzzle,
    title: "Built to be built on",
    body: "Everything on this website uses the same public API. The Python SDK automates workflows in a few lines. The MCP server gives AI agents full platform access.",
  },
];

const NOT_LIST = [
  {
    label: "Not a content generator",
    body: "Phiacta does not produce summaries, papers, or visualizations. That is the job of extensions. Phiacta's job is to maintain a clean, permanent, queryable store of entries.",
  },
  {
    label: "Not a social network",
    body: "Community features (reviews, discussion) exist to surface the quality of entries — not to maximise engagement.",
  },
  {
    label: "Not a software repository",
    body: "Entries are for knowledge assertions. Versioned repositories inside entries hold supporting materials (data, proofs, scripts), not software projects.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function N({ n }: { n: number }) {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
      {n}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
      {children}
    </p>
  );
}

function KnowledgeGraph() {
  return (
    <svg viewBox="0 0 700 240" className="w-full" fill="none" aria-hidden>
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" className="fill-border" />
        </marker>
      </defs>

      {/* Connection lines */}
      <line x1="300" y1="76" x2="140" y2="148" className="stroke-border" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
      <line x1="350" y1="76" x2="350" y2="148" className="stroke-border" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
      <line x1="400" y1="76" x2="555" y2="148" className="stroke-border" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
      <path d="M 220 188 Q 350 228 480 188" className="stroke-border" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowhead)" />

      {/* Relationship labels */}
      <text x="195" y="106" textAnchor="middle" fontSize="10" className="fill-muted-foreground">contains</text>
      <text x="368" y="108" textAnchor="middle" fontSize="10" className="fill-muted-foreground">contains</text>
      <text x="510" y="106" textAnchor="middle" fontSize="10" className="fill-muted-foreground">contains</text>
      <text x="350" y="226" textAnchor="middle" fontSize="10" className="fill-muted-foreground">uses</text>

      {/* Paper node */}
      <rect x="240" y="12" width="220" height="64" rx="8" strokeWidth="1.5" className="fill-card stroke-border" />
      <text x="254" y="32" fontSize="10" className="fill-muted-foreground">paper</text>
      <text x="254" y="50" fontSize="13" fontWeight="600" className="fill-foreground">QuakeFloat8</text>
      <text x="254" y="65" fontSize="10" className="fill-muted-foreground">hardware · quantization</text>

      {/* Theorem node */}
      <rect x="20" y="148" width="220" height="64" rx="8" strokeWidth="1.5" className="fill-card stroke-border" />
      <text x="34" y="168" fontSize="10" className="fill-muted-foreground">theorem · lean-verified</text>
      <text x="34" y="186" fontSize="13" fontWeight="600" className="fill-foreground">Minimax NMSE</text>
      <text x="34" y="201" fontSize="10" className="fill-muted-foreground">quantization · optimality</text>

      {/* Result node */}
      <rect x="260" y="148" width="220" height="64" rx="8" strokeWidth="1.5" className="fill-card stroke-border" />
      <text x="274" y="168" fontSize="10" className="fill-muted-foreground">result</text>
      <text x="274" y="186" fontSize="13" fontWeight="600" className="fill-foreground">QF8 +6.6 dB SQNR</text>
      <text x="274" y="201" fontSize="10" className="fill-muted-foreground">benchmark · hardware</text>

      {/* Definition node */}
      <rect x="500" y="148" width="180" height="64" rx="8" strokeWidth="1.5" className="fill-card stroke-border" />
      <text x="514" y="168" fontSize="10" className="fill-muted-foreground">definition</text>
      <text x="514" y="186" fontSize="13" fontWeight="600" className="fill-foreground">Log-uniform</text>
      <text x="514" y="201" fontSize="10" className="fill-muted-foreground">quantizer · decoding</text>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="flex flex-col">

      {/* ════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════ */}
      <section className="px-6 py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Research produces more<br className="hidden sm:block" /> than papers can hold.
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Phiacta is an open platform where knowledge is stored as versioned, citable entries —
            not locked inside static PDFs. Publish anything worth sharing, attach your evidence,
            and let others build on it.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/explore">
                Browse entries <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/post">Create an entry</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          THE PROBLEM
      ════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The problem</SectionLabel>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The paper was never the right container.
          </h2>
          <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The academic paper is a 350-year-old format that predates the internet.
            It was designed for print distribution, not for an age where knowledge should be
            searchable, queryable, verifiable, and composable.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {PAIN_POINTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 rounded-xl border border-border bg-card p-6">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ENTRY ANATOMY
      ════════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionLabel>The entry</SectionLabel>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            One idea. One entry.
          </h2>
          <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
            An entry is anything worth citing — a theorem, a dataset, a null result, a full paper.
            Each one is versioned, citable, and backed by a git repository.
            Here&apos;s a real example from the platform.
          </p>

          {/* Mock entry card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 pb-5 pt-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">theorem</Badge>
                <N n={1} />
                <div className="ml-auto flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="border-green-600/40 bg-green-50 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400">
                    <ShieldCheck className="mr-1 h-3 w-3" />lean-verified
                  </Badge>
                  <N n={2} />
                </div>
              </div>
              <p className="text-base font-semibold text-foreground">
                Minimax NMSE Optimality of Log-Uniform Quantization
              </p>
              <div className="mt-2.5 flex items-start gap-2">
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  Establishes unique minimax optimality of log-uniform quantizers with formula
                  ε²/12 + O(ε⁴) for any input distribution.
                </p>
                <N n={3} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {["lean-verified", "minimax", "optimality", "quantization"].map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
                <N n={4} />
              </div>
            </div>
            <div className="border-b border-border bg-muted/20 px-6 py-4">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Content</span>
                <N n={5} />
              </div>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                Among all N-level quantizers on a positive domain, the log-uniform quantizer uniquely
                achieves NMSE* = ε²/12 + O(ε⁴) — the minimax optimum over all input distributions.
                Proof verified in Lean 4 over 14,641 test cases.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 px-6 py-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileCode2 className="h-3.5 w-3.5" />proof.lean
                <N n={6} />
              </span>
              <span className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />4 references
                <N n={7} />
              </span>
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />v3 · 3 days ago
                <N n={8} />
              </span>
              <Link href="/explore" className="ml-auto flex items-center gap-1 text-xs text-primary transition-opacity hover:opacity-70">
                Browse real entries <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Callout legend */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CALLOUT_LEGEND.map(({ n, label, desc }) => (
              <div key={n} className="flex gap-2">
                <N n={n} />
                <div>
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          KNOWLEDGE GRAPH
      ════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The graph</SectionLabel>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Entries don&apos;t exist in isolation.
          </h2>
          <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
            References connect entries into a typed knowledge graph. A theorem cites a definition.
            A paper contains its component findings. A result supports a theory.
            Traverse the graph from any entry — in the browser or via the API.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border bg-card p-6 shadow-sm">
            <KnowledgeGraph />
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Real entries from the platform — click any entry on <Link href="/explore" className="text-primary hover:opacity-70 transition-opacity underline underline-offset-2">the explore page</Link> to see its reference graph.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          WHO IT'S FOR
      ════════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>Who it&apos;s for</SectionLabel>
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for everyone who<br className="hidden sm:block" /> creates or uses knowledge.
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <GraduationCap className="h-5 w-5 text-secondary-foreground" />
              </div>
              <p className="mb-2 text-base font-semibold text-foreground">Researchers</p>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Publish anything worth sharing — not just what fits a paper. Get credit for null
                results, single theorems, and intermediate findings. Let the community correct
                and build on your work.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><XCircle className="h-3.5 w-3.5 text-primary shrink-0" />Null and negative results count</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />Attach formal proofs or data</li>
                <li className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />Issues and edit proposals</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Bot className="h-5 w-5 text-secondary-foreground" />
              </div>
              <p className="mb-2 text-base font-semibold text-foreground">AI builders</p>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                A structured knowledge graph your agents can actually query. Typed entries,
                explicit references, full-text search, and graph traversal — all available
                over a clean REST API.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Puzzle className="h-3.5 w-3.5 text-primary shrink-0" />MCP server — Claude, Cursor, Codex</li>
                <li className="flex items-center gap-2"><Network className="h-3.5 w-3.5 text-primary shrink-0" />Reference graph traversal API</li>
                <li className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-primary shrink-0" />Full-text search over all entries</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Wrench className="h-5 w-5 text-secondary-foreground" />
              </div>
              <p className="mb-2 text-base font-semibold text-foreground">Tool builders</p>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Open source, documented, and built to be extended. The same plugin framework
                that powers built-in features is open to anyone. Build extensions and tools
                on top of the platform.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-primary shrink-0" />Full OpenAPI spec</li>
                <li className="flex items-center gap-2"><GitBranch className="h-3.5 w-3.5 text-primary shrink-0" />Python SDK with typed models</li>
                <li className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-primary shrink-0" />Open plugin framework</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          VISION
      ════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 px-6 py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>The mission</SectionLabel>
          <blockquote className="mb-8 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
            &ldquo;A permanent, open layer of knowledge for the internet.&rdquo;
          </blockquote>
          <p className="mb-10 text-base leading-relaxed text-muted-foreground">
            Knowledge today is scattered, unstructured, and hard to verify. Papers lock findings
            inside static PDFs. Social platforms bury truth in noise. Encyclopedias reflect a single
            editorial perspective. None of them were designed with provability in mind.
          </p>
          <div className="grid gap-5 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <Badge variant="secondary" className="mb-3">Near-term</Badge>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Phiacta replaces the academic paper. Researchers publish individual entries backed
                by data, code, and proofs — no more monolithic PDFs. Each entry is citable,
                reviewable, and updatable without touching anything else.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <Badge variant="secondary" className="mb-3">Long-term</Badge>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A general knowledge layer for the internet — a more trustworthy, more structured
                alternative to how knowledge is shared across X, Reddit, Wikipedia, and Stack
                Exchange. Grounded in entries that can be backed by evidence and tracked over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CORE PRINCIPLES
      ════════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionLabel>Core principles</SectionLabel>
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The beliefs behind<br className="hidden sm:block" /> every design decision.
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          BUILD ON IT
      ════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionLabel>For builders</SectionLabel>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A platform, not just a website.
          </h2>
          <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Everything you see here is powered by the same public API that anyone can use.
            Query the knowledge graph, build ingestion pipelines, or connect AI agents in minutes.
          </p>

          <BuildOnItTabs />
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            The plugin framework is open too. Extensions add new data to entries, tools add new
            query endpoints — both hook into the same lifecycle and discovery system the built-in
            features use.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ARCHITECTURE + HOW ENTRIES WORK
      ════════════════════════════════════════════════════ */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionLabel>How it&apos;s built</SectionLabel>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three layers. One clear separation.
          </h2>
          <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The core is minimal — everything else is pluggable.
            Extensions add data; tools add query surfaces; entries are the ground truth.
          </p>

          {/* Architecture stack */}
          <div className="mb-12 overflow-hidden rounded-xl border border-border">
            <div className="border-b border-border bg-muted/20 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">Tools</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Stateless query endpoints — search, graph traversal, custom tools.
                    Take input, produce output; never modify entries.
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">stateless</Badge>
              </div>
            </div>
            <div className="border-b border-border bg-muted/10 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">Extensions</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Platform features with their own data — metadata, types, references, tags,
                    search indexes. Each declares dependencies and can be added or removed independently.
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">pluggable</Badge>
              </div>
            </div>
            <div className="bg-card px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">Entries</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    The knowledge itself. Git repos store content; the database stores the index.
                    If everything else were removed, the entries would still be intact.
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">source of truth</Badge>
              </div>
            </div>
          </div>

          {/* Git concepts table */}
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            Entries are backed by versioned git repositories. Phiacta surfaces the underlying
            concepts in plain language that requires no technical knowledge:
          </p>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Under the hood</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">What you see</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Repository", "Entry"],
                  ["Commit", "Update / version"],
                  ["Branch + pull request", "Edit proposal"],
                  ["Issue", "Issue"],
                  ["Merge PR", "Accept edit"],
                  ["Fork", "Derive (creates a new entry)"],
                ].map(([under, display]) => (
                  <tr key={under} className="bg-card">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{under}</td>
                    <td className="px-5 py-3 text-foreground">{display}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          WHAT IT'S NOT
      ════════════════════════════════════════════════════ */}
      <section className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionLabel>Scope</SectionLabel>
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What Phiacta is not.
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {NOT_LIST.map(({ label, body }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-6">
                <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          THE NAME + CONTACT
      ════════════════════════════════════════════════════ */}
      <section className="px-6 py-28 text-center">
        <div className="mx-auto max-w-xl">
          <SectionLabel>The name</SectionLabel>
          <p className="mb-10 text-base leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Phiacta</strong> blends two roots:{" "}
            <strong className="text-foreground">phi</strong> (φ), the Greek letter representing
            the golden ratio, and{" "}
            <strong className="text-foreground">facta</strong>, Latin for &ldquo;things done&rdquo; —
            the origin of &ldquo;fact.&rdquo; Together: structured, well-formed facts, shaped
            with the same elegance that phi embodies.
          </p>

          <div className="my-10 h-px w-16 bg-border mx-auto" />

          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
            Ready to start?
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Phiacta is open source. Browse the entries already on the platform,
            create your first entry, or get involved with the project.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/post">
                Create an entry <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/explore">Browse entries</Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            See the{" "}
            <Link href="/contributing" className="text-foreground underline underline-offset-2 transition-opacity hover:opacity-70">
              contributing guide
            </Link>
            {" "}or reach out at{" "}
            <a href="mailto:contact@phiacta.com" className="text-foreground underline underline-offset-2 transition-opacity hover:opacity-70">
              contact@phiacta.com
            </a>
          </p>
        </div>
      </section>

    </div>
  );
}
