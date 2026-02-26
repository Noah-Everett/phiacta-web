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
} from "lucide-react";

const PRINCIPLES = [
  {
    icon: GitBranch,
    title: "Permanent by design",
    body: "Claims are backed by git. History is immutable. Nothing is deleted. Every citation always resolves — even years later.",
  },
  {
    icon: ShieldCheck,
    title: "Proof over assertion",
    body: "Claims carry their supporting materials: data and code for empirical work, machine-checkable proofs for mathematics. Verification status is always visible.",
  },
  {
    icon: Globe,
    title: "Public by default",
    body: "Claims are publicly readable. Authors control who can edit. There are no private claims — the knowledge is open, commit access is not.",
  },
  {
    icon: MessageSquare,
    title: "Record, don't resolve",
    body: "Contradictory claims coexist. The system records what has been asserted and by whom. Resolving disagreement is the community's job, not the platform's.",
  },
  {
    icon: BookOpen,
    title: "Claims, not papers",
    body: "An atomic claim stands on its own — citable, reviewable, and updatable without touching anything else. No more citing a paper when you only mean one sentence.",
  },
  {
    icon: Puzzle,
    title: "Open platform",
    body: "Every feature on the website is accessible through the API. Third-party extensions can build any output on top of the same data.",
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
          <strong className="text-foreground">phi</strong> (φ), the Greek letter representing
          the golden ratio and used throughout mathematics and science, and{" "}
          <strong className="text-foreground">facta</strong>, the Latin word for "things done" —
          the origin of the English word "fact." Together the name captures the idea of
          structured, well-formed facts: knowledge shaped with the same elegance and precision
          that φ embodies.
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
            Phiacta is built around a different idea: every piece of knowledge should be a{" "}
            <strong className="text-foreground">claim</strong> — an atomic, versioned assertion
            that stands on its own, can be backed by evidence, and can be reviewed, challenged,
            and cited independently.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <Badge variant="secondary" className="mb-2">Near-term</Badge>
              <p className="text-sm">
                Phiacta replaces academic papers. Researchers publish individual claims backed
                by data, code, and proofs — no more monolithic PDFs.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <Badge variant="secondary" className="mb-2">Long-term</Badge>
              <p className="text-sm">
                A general knowledge layer for the internet — a more trustworthy, more structured
                alternative to X, Reddit, Wikipedia, and Stack Exchange.
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

      {/* Protocol */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Phiacta and phiacta.com</h2>
        <p className="leading-relaxed text-muted-foreground">
          Phiacta is designed like git and GitHub. The{" "}
          <strong className="text-foreground">Phiacta protocol</strong> — the API and data model
          — is the open foundation. Anyone can build on it.{" "}
          <strong className="text-foreground">phiacta.com</strong> is the primary hosting
          platform: the website most people use, plus the extensions marketplace where
          third-party tools are listed.
        </p>
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
