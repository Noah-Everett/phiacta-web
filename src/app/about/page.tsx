import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  ShieldCheck,
  Globe,
  MessageSquare,
  BookOpen,
  Puzzle,
  Atom,
  XCircle,
  Database,
  ExternalLink,
} from "lucide-react";

const PRINCIPLES = [
  {
    icon: Atom,
    title: "Entries are the unit of knowledge",
    body: "An entry is atomic — one assertion, not a paper. Complex arguments are expressed as networks of related entries. Every individual statement is citable, reviewable, and verifiable on its own terms.",
  },
  {
    icon: GitBranch,
    title: "Permanent versioned history",
    body: "Every version of every entry is preserved forever. Nothing is deleted — entries are archived or retracted with full history intact. Anyone who cites an entry can always access the exact version they cited.",
  },
  {
    icon: ShieldCheck,
    title: "Proof over assertion",
    body: "Empirical entries attach the data and code that produced the result. Mathematical entries attach machine-checkable proofs. Unverified entries are accepted — but the absence of proof is visible to everyone.",
  },
  {
    icon: Globe,
    title: "Public by default, author-controlled",
    body: "Entries are publicly readable by anyone. Only the author and explicit collaborators can modify an entry. This mirrors a public open-source repository: the knowledge is open; commit access is not.",
  },
  {
    icon: XCircle,
    title: "Negative results count",
    body: "The current system only rewards what worked. On Phiacta, a null result, a failed replication, or an experiment that didn't pan out is just as valuable as a positive finding — and should be an entry.",
  },
  {
    icon: MessageSquare,
    title: "Record, don't resolve",
    body: "Contradictory entries coexist. The system records what has been asserted and by whom. Resolving disagreements is left to the community through reviews and discussion — not decided by the platform.",
  },
  {
    icon: Database,
    title: "Ground truth only",
    body: "The database stores only what users directly provide. Confidence scores, graph traversals, and search rankings are derived at query time and never written back as ground truth.",
  },
  {
    icon: Puzzle,
    title: "Open platform",
    body: "Every feature on the website is accessible through the API. Third-party extensions connect to produce new outputs — papers, podcasts, slide decks — from the same underlying entry data.",
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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">About Phiacta</h1>
        <p className="text-lg text-muted-foreground">
          A permanent, structured home for human knowledge.
        </p>
      </div>

      <Separator className="mb-10" />

      {/* Name */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">The Name</h2>
        <p className="leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Phiacta</strong> blends two roots:{" "}
          <strong className="text-foreground">phi</strong> (phi), the Greek letter representing
          the golden ratio and used throughout mathematics and science, and{" "}
          <strong className="text-foreground">facta</strong>, the Latin word for &ldquo;things done&rdquo; —
          the origin of the English word &ldquo;fact.&rdquo; Together the name captures the idea of
          structured, well-formed facts: knowledge shaped with the same elegance and precision
          that phi embodies.
        </p>
      </section>

      {/* Vision */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Vision</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>
            Knowledge today is scattered, unstructured, and hard to verify. Papers lock
            findings inside static PDFs. Social platforms bury truth in noise. Encyclopedias
            reflect a single editorial perspective. None of them were designed with provability
            in mind.
          </p>
          <p>
            Phiacta is built around a different idea: every piece of knowledge should be an{" "}
            <strong className="text-foreground">entry</strong> — an atomic, versioned assertion
            that stands on its own, can be backed by evidence, and can be reviewed, challenged,
            and cited independently.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <Badge variant="secondary" className="mb-2">Near-term</Badge>
              <p className="text-sm">
                Phiacta replaces academic papers. Researchers publish individual entries backed
                by data, code, and proofs — no more monolithic PDFs. Each entry is citable,
                reviewable, and updatable without touching anything else.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <Badge variant="secondary" className="mb-2">Long-term</Badge>
              <p className="text-sm">
                A general knowledge layer for the internet — a more trustworthy, more structured
                alternative to how knowledge is shared across X, Reddit, Wikipedia, and Stack
                Exchange. Grounded in entries that can be backed by evidence and tracked over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mb-10">
        <h2 className="mb-5 text-xl font-semibold text-foreground">Core Principles</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Entry vocabulary */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">How Entries Work</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Entries are backed by versioned git repositories. Phiacta surfaces the underlying
          concepts with plain language that requires no technical knowledge:
        </p>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Under the hood</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">What users see</th>
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
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{under}</td>
                  <td className="px-4 py-3 text-foreground">{display}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What Phiacta is not */}
      <section className="mb-10">
        <h2 className="mb-5 text-xl font-semibold text-foreground">What Phiacta Is Not</h2>
        <div className="space-y-3">
          {NOT_LIST.map(({ label, body }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-5">
              <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Protocol */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Phiacta and phiacta.com</h2>
        <p className="mb-3 leading-relaxed text-muted-foreground">
          Phiacta is designed like git and GitHub. The{" "}
          <strong className="text-foreground">Phiacta protocol</strong> — the API and data model
          — is the open foundation. Anyone can build on it.{" "}
          <strong className="text-foreground">phiacta.com</strong> is the primary hosting
          platform: the website most people use, plus the extensions marketplace where
          third-party tools are listed.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          The <strong className="text-foreground">entry format</strong> — the structure of{" "}
          <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">README.md</code>,{" "}
          <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">.phiacta/entry.yaml</code>,
          and the repository layout — is publicly documented. Entries are not trapped on the
          platform. Anyone can read, export, or build tools around them.
        </p>
      </section>

      <Separator className="mb-10" />

      {/* Extensions */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Extensions</h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          Third-party applications connect to the Phiacta API to produce new outputs or enable
          new input methods. Extensions run their own compute and push results back through the API.
          They are listed in the{" "}
          <Link href="/extensions" className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity">
            extensions marketplace
          </Link>
          .
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "A paper generator that takes a set of entries and produces a formatted academic paper",
            "A podcast creator that turns an entry and its discussion into audio",
            "A lecture slide builder that generates teaching materials from a set of entries",
            "A PDF ingestion pipeline that reads a paper and submits its entries to the API",
          ].map((example) => (
            <div
              key={example}
              className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3"
            >
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="mb-3 text-xl font-semibold text-foreground">Contact &amp; Community</h2>
        <p className="leading-relaxed text-muted-foreground">
          Phiacta is open source. You can find the code, report issues, and contribute on{" "}
          <a
            href="https://github.com/phiacta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            GitHub
          </a>
          . For questions or feedback, reach out at{" "}
          <a
            href="mailto:contact@phiacta.com"
            className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            contact@phiacta.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
