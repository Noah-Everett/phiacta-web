import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  GitBranch,
  Server,
  Globe,
  Code2,
  Bug,
  Terminal,
  Database,
  Layers,
  Bot,
  FileText,
  TestTube,
} from "lucide-react";

const REPOS = [
  {
    name: "phiacta",
    url: "https://github.com/Noah-Everett/phiacta",
    icon: Server,
    description:
      "Python/FastAPI backend. Contains the API, database models, plugin system, Forgejo integration, and all server-side logic.",
    tech: "Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Forgejo API",
    note: null,
  },
  {
    name: "phiacta-web",
    url: "https://github.com/Noah-Everett/phiacta-web",
    icon: Globe,
    description:
      "Next.js website. The web UI for browsing, creating, and managing entries.",
    tech: "Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui",
    note: null,
  },
  {
    name: "phiacta-mcp",
    url: "https://github.com/Noah-Everett/phiacta-mcp",
    icon: Bot,
    description:
      "Model Context Protocol server. Lets AI agents interact with Phiacta programmatically.",
    tech: "TypeScript, MCP SDK",
    note: null,
  },
  {
    name: "phiacta-sdk-python",
    url: "https://github.com/Noah-Everett/phiacta-sdk-python",
    icon: Code2,
    description:
      "Python client library for the Phiacta API. Async-first with Pydantic models.",
    tech: "Python 3.11+, httpx, Pydantic",
    note: null,
  },
  {
    name: "phiacta-deploy",
    url: "https://github.com/Noah-Everett/phiacta-deploy",
    icon: Layers,
    description:
      "Docker Compose stacks and deploy script. Clone this alongside the other repos to spin up a full dev environment.",
    tech: "Docker, Docker Compose",
    note: null,
  },
  {
    name: "phiacta-verify",
    url: "https://github.com/Noah-Everett/phiacta-verify",
    icon: TestTube,
    description:
      "Verification integration. Being merged into the backend as a verification extension.",
    tech: "Python",
    note: "Deprecated — will be folded into the backend repo as an extension plugin.",
  },
];

const DEV_STEPS = [
  {
    step: "1",
    title: "Clone the repos side by side",
    code: "git clone https://github.com/Noah-Everett/phiacta.git\ngit clone https://github.com/Noah-Everett/phiacta-web.git\ngit clone https://github.com/Noah-Everett/phiacta-deploy.git\ncd phiacta-deploy",
  },
  {
    step: "2",
    title: "Start the dev stack",
    code: "./deploy.sh",
  },
  {
    step: "3",
    title: "Verify everything is running",
    code: "# API:     http://localhost:8000/health\n# Web:     http://localhost:3001\n# Forgejo: http://localhost:3000",
  },
];

export default function ContributingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Contributing</h1>
        <p className="text-lg text-muted-foreground">
          How to contribute to Phiacta — setting up a development environment, submitting code, and reporting issues.
        </p>
      </div>

      {/* Feature contributions callout */}
      <div className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h2 className="mb-2 text-base font-semibold text-foreground">Have an idea? We&apos;d love your help.</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Phiacta is built on a plugin architecture, which means adding new features is
          genuinely straightforward — the same framework that powers search, tags, and LaTeX
          compilation is available to everyone. If there&apos;s something you want to see on
          the platform, you&apos;re totally free to build it. Open an issue to discuss your idea,
          or jump straight into a pull request. I&apos;m happy to help you get oriented in
          the codebase and answer questions along the way — reach out
          at{" "}
          <a href="mailto:contact@phiacta.com" className="text-foreground underline underline-offset-2 hover:opacity-70">
            contact@phiacta.com
          </a>.
        </p>
      </div>

      {/* Feature ideas */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-semibold text-foreground">Feature ideas</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Here are some features we&apos;ve been thinking about but haven&apos;t built yet.
          Any of these would make a great contribution — or bring your own idea.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Automated review papers", desc: "Agents that read related entries and synthesize them into survey or review papers \u2014 using the reference graph and semantic search to find connections." },
            { title: "Podcast generation", desc: "Turn entries into audio \u2014 AI-generated podcast episodes that explain and discuss the content, tailored to different audiences." },
            { title: "User expertise profiles", desc: "Build a private knowledge profile from a user\u2019s publications, comments, and edits. Only visible to the user \u2014 agents can use it to generate better explanations tailored to the reader\u2019s background." },
            { title: "Personalized reading feeds", desc: "Surface relevant entries based on what you\u2019ve published, read, and cited. Built on expertise profiles and the reference graph." },
            { title: "Community reviews", desc: "Open, transparent quality signals. Anyone can leave a structured review with ratings on dimensions like clarity, rigor, and reproducibility. No gatekeeping \u2014 just public signal that helps readers evaluate entries." },
            { title: "Verification (coming soon)", desc: "Sandboxed execution of code that users mark for verification \u2014 reproduce empirical results and generate cryptographically signed reports." },
            { title: "Semantic search", desc: "Use pgvector embeddings to find entries by meaning, not just keywords. Makes agent-driven discovery and contradiction detection much more powerful." },
{ title: "Citation export", desc: "Generate BibTeX, RIS, or other citation formats from entry metadata and references." },
            { title: "DOI integration", desc: "Register DOIs for entries or link to existing DOIs for cross-referencing with external literature." },
            { title: "Version comparison", desc: "Side-by-side diff between any two commits in an entry\u2019s history." },
          ].map(({ title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Project overview */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Project structure</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Phiacta is split across several repositories, each with a focused responsibility.
        </p>
        <div className="space-y-3">
          {REPOS.map((repo) => (
            <div
              key={repo.name}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
            >
              <repo.icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="mb-1">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-semibold text-primary hover:underline"
                  >
                    {repo.name}
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">{repo.description}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{repo.tech}</p>
                {repo.note && (
                  <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">{repo.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Dev setup */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Local dev environment</h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          The dev stack runs entirely in Docker. You need Docker and Docker Compose installed.
        </p>
        <div className="space-y-4">
          {DEV_STEPS.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {s.step}
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1.5 text-sm font-medium text-foreground">{s.title}</p>
                <pre className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs font-mono text-foreground overflow-x-auto">
                  {s.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Stack:</strong> PostgreSQL 16 + Forgejo (git backend) + FastAPI (API) + Next.js (web).
            Ports: API on <code className="font-mono text-xs">8000</code>, web on <code className="font-mono text-xs">3001</code>,
            Forgejo on <code className="font-mono text-xs">3000</code>, Postgres on <code className="font-mono text-xs">5433</code>.
          </p>
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Contributing code */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Contributing code</h2>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Pull requests</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Fork the relevant repo and create a feature branch.</li>
              <li>Keep PRs focused — one feature or fix per PR.</li>
              <li>Write tests for new functionality. E2E tests are especially valued.</li>
              <li>Run the existing test suite before submitting.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Code style</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Backend:</strong> Ruff for linting and formatting. Type hints required. Follow existing patterns.</li>
              <li><strong>Frontend:</strong> ESLint + Prettier. TypeScript strict mode. shadcn/ui for components.</li>
              <li>Mirror existing code — find the closest analogous implementation and match its structure.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Testing</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Backend:</strong> <code className="font-mono text-xs">pytest</code> with async support. E2E tests hit a real database.</li>
              <li><strong>Frontend:</strong> Playwright for E2E, Vitest for unit tests.</li>
              <li>Every new feature should have E2E tests that exercise the full path.</li>
            </ul>
          </div>
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Reporting issues */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Bug className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Reporting issues</h2>
        </div>
        <div className="text-sm text-muted-foreground space-y-3">
          <p>
            Found a bug or have a feature request? Open an issue in the relevant repository.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span>API / backend bugs</span>
              <a href="https://github.com/Noah-Everett/phiacta/issues" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-primary hover:underline">phiacta</a>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>Website bugs</span>
              <a href="https://github.com/Noah-Everett/phiacta-web/issues" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-primary hover:underline">phiacta-web</a>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>MCP server bugs</span>
              <a href="https://github.com/Noah-Everett/phiacta-mcp/issues" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-primary hover:underline">phiacta-mcp</a>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>SDK bugs</span>
              <a href="https://github.com/Noah-Everett/phiacta-sdk-python/issues" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-primary hover:underline">phiacta-sdk-python</a>
            </div>
          </div>
          <p>
            Include steps to reproduce, what you expected, and what actually happened.
            Screenshots or error messages are always helpful.
          </p>
        </div>
      </section>

    </div>
  );
}
