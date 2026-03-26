export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Architecture</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        How Phiacta is designed to be a permanent, general-purpose knowledge platform.
      </p>

      {/* Core principle */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">
          Git for Content, Postgres for Facts
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Every entry on Phiacta is a{" "}
          <strong className="text-foreground">git repository</strong>. Version
          history, supporting files, edit proposals, and issues all live in that
          repository. What lives in the database are the facts that need to be
          queryable: references between entries, tags, and identity.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          The database stores only what users directly provide&mdash;no derived
          or computed values. Search indexes and knowledge maps are computed at
          query time by separate analysis modules and are never written back into
          the ground truth store.
        </p>

        {/* Stack diagram */}
        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            System Architecture
          </p>
          <div className="mx-auto flex max-w-lg flex-col items-stretch gap-2">
            {/* Consumers */}
            <div className="flex gap-2">
              <div className="flex-1 rounded border border-border bg-card px-3 py-2 text-center text-xs text-muted-foreground">
                Web App
              </div>
              <div className="flex-1 rounded border border-border bg-card px-3 py-2 text-center text-xs text-muted-foreground">
                AI Agents
              </div>
              <div className="flex-1 rounded border border-border bg-card px-3 py-2 text-center text-xs text-muted-foreground">
                SDK / API
              </div>
            </div>
            <div className="flex justify-center text-muted-foreground/40">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* API */}
            <div className="rounded-md border border-foreground/30 bg-card px-4 py-2.5 text-center">
              <span className="text-sm font-medium text-foreground">REST API</span>
              <span className="ml-2 text-xs text-muted-foreground">/v1/entries, /v1/extensions, /v1/users</span>
            </div>
            <div className="flex justify-center text-muted-foreground/40">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Layers */}
            <div className="rounded-md border-2 border-dashed border-foreground/30 bg-card p-3">
              <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Extensions &amp; Views (pluggable, never stored in core)
              </p>
              <div className="flex gap-2">
                <div className="flex-1 rounded bg-secondary px-3 py-2 text-center text-xs font-medium text-secondary-foreground">
                  Tags
                </div>
                <div className="flex-1 rounded bg-secondary px-3 py-2 text-center text-xs font-medium text-secondary-foreground">
                  Search
                </div>
                <div className="flex-1 rounded bg-secondary px-3 py-2 text-center text-xs font-medium text-secondary-foreground">
                  References
                </div>
              </div>
            </div>
            <div className="flex justify-center text-muted-foreground/40">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Core schema */}
            <div className="rounded-md border-2 border-foreground bg-foreground px-4 py-3 text-center">
              <span className="text-sm font-semibold text-background">Core Database</span>
              <span className="ml-2 text-xs text-background/60">Entries, Users, Entities&hellip;</span>
            </div>
            <div className="flex justify-center text-muted-foreground/40">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Storage */}
            <div className="flex gap-2">
              <div className="flex-1 rounded-md border border-foreground/30 bg-card px-3 py-2.5 text-center">
                <span className="text-xs font-medium text-foreground">PostgreSQL</span>
                <p className="mt-0.5 text-[11px] text-muted-foreground">identity, refs, search</p>
              </div>
              <div className="flex-1 rounded-md border border-foreground/30 bg-card px-3 py-2.5 text-center">
                <span className="text-xs font-medium text-foreground">Forgejo</span>
                <p className="mt-0.5 text-[11px] text-muted-foreground">content, history, files</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core entities */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">
          Core Entities
        </h2>
        <p className="mb-4 leading-relaxed text-muted-foreground">
          The core schema is deliberately minimal. The four-layer architecture
          separates entries (core), extensions (tags, references, etc.), views (search), and
          tools (external).
        </p>

        {/* Entity grid */}
        <div className="mb-8 rounded-lg border border-border bg-muted/50 p-6">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Entity Relationships
          </p>
          <div className="mx-auto mb-5 w-fit rounded-md border-2 border-foreground bg-foreground px-6 py-3 text-center">
            <span className="text-sm font-semibold text-background">Entries</span>
            <p className="mt-0.5 text-[11px] text-background/60">
              The central entity &mdash; everything connects here
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-card px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">References</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Typed connections between any two entries
              </p>
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">Edit Proposals</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Content change requests on an entry&apos;s repository
              </p>
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">Users</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Humans, AI models, organizations, or automated pipelines
              </p>
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">Tags</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Extension: categorize entries with freeform labels
              </p>
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">Files</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Supporting materials stored in the entry&apos;s git repo
              </p>
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">History</p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Git commit log for every entry
              </p>
            </div>
          </div>
        </div>

        <ul className="list-inside list-disc space-y-3 leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Entries</strong> &mdash; Atomic
            assertions, each backed by a git repository. Content is versioned via
            git commits. Edit proposals (branches + PRs) and issues live in the same
            repository. Supporting materials&mdash;data, code, proofs&mdash;are
            committed alongside the entry content.
          </li>
          <li>
            <strong className="text-foreground">References</strong> &mdash; Typed,
            directed connections between entries. Reference types
            include evidence, rebuttal, citation, derivation, supersession, and more.
          </li>
          <li>
            <strong className="text-foreground">Users</strong> &mdash; Any entity
            that contributes knowledge: humans, AI models, organizations, or automated
            pipelines.
          </li>
          <li>
            <strong className="text-foreground">Tags</strong> &mdash; An extension
            that allows freeform categorization of entries. Tags are stored separately
            from the entry core schema.
          </li>
        </ul>
      </section>

      {/* Entries as git repos */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">
          Entries as Git Repositories
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Each entry is a git repository hosted internally on Forgejo. Users never
          interact with Forgejo directly&mdash;they use the Phiacta API or website,
          which proxy all git operations.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Git concepts are surfaced to users with plain-language names:
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Under the hood</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">What you see</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {[
                ["Repository", "Entry"],
                ["Commit", "Update / version"],
                ["Branch + pull request", "Edit proposal"],
                ["Issue", "Issue"],
                ["Merge", "Accept edit"],
                ["Close PR", "Reject edit"],
                ["Fork", "Derive"],
              ].map(([git, user]) => (
                <tr key={git}>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{git}</td>
                  <td className="px-4 py-2.5 text-xs text-foreground">{user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Repo structure */}
        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Entry repository structure
          </p>
          <pre className="text-xs leading-relaxed text-muted-foreground">{`{entry_uuid}/
├── .phiacta/
│   ├── entry.yaml        # identity only (entry_id, schema_version, author, created_at)
│   └── content.md        # entry content (or .tex, .txt)
└── (user files)          # everything outside .phiacta/ is user-owned`}</pre>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Title, summary, and type are DB-only.</strong>{" "}
          They are stored in extension tables and are not present in{" "}
          <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">entry.yaml</code>{" "}
          or any git file. They are set during entry creation and updated directly in the database.
        </p>
      </section>

      {/* Extensions */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">
          Extensions &amp; Views
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          The core schema is interpretation-free. Higher-level meaning lives in{" "}
          <strong className="text-foreground">extensions</strong>&mdash;composable
          modules that read core data and expose their own data and API endpoints.
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border p-5">
            <h3 className="mb-2 font-semibold text-foreground">Metadata Extension</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Stores entry titles and summaries. These are auto-composed into every entry
              response, so they appear as native fields even though they live in a separate table.
            </p>
          </div>
          <div className="rounded-lg border border-border p-5">
            <h3 className="mb-2 font-semibold text-foreground">References Extension</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Typed, directed connections between entries. Reference types include evidence,
              rebuttal, citation, derivation, supersession, and more. DB-only — not git-derived.
            </p>
          </div>
          <div className="rounded-lg border border-border p-5">
            <h3 className="mb-2 font-semibold text-foreground">Tags Extension</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Freeform tagging of entries. Tags are stored in a separate table
              and exposed through the API. Supports filtering entries by tag.
            </p>
          </div>
          <div className="rounded-lg border border-border p-5">
            <h3 className="mb-2 font-semibold text-foreground">Search View</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Full-text search across entry titles and content using PostgreSQL
              tsvector indexing. Precomputed and versioned — can be rebuilt at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Design principles */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-foreground">
          Why This Design
        </h2>
        <ul className="list-inside list-disc space-y-3 leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Git-backed permanence</strong> &mdash;
            Every version of every entry is preserved forever. Nothing is deleted.
            Citations always resolve.
          </li>
          <li>
            <strong className="text-foreground">Proof over assertion</strong> &mdash;
            Supporting materials (data, code, formal proofs) are first-class
            content in every entry repository.
          </li>
          <li>
            <strong className="text-foreground">API first</strong> &mdash;
            Every feature on the website is accessible through the API. The website
            is a thin client. The API is the platform.
          </li>
          <li>
            <strong className="text-foreground">Ground truth only</strong> &mdash;
            The database stores only what users provide. Derived values are computed
            on demand and never contaminate the source data.
          </li>
          <li>
            <strong className="text-foreground">Record, don&rsquo;t resolve</strong> &mdash;
            Contradictory entries coexist. The system records what has been asserted
            and by whom. Resolution is left to the community.
          </li>
          <li>
            <strong className="text-foreground">Accessible to everyone</strong> &mdash;
            Git concepts are surfaced with plain-language names. No technical
            knowledge of git is required to use Phiacta.
          </li>
        </ul>
      </section>
    </div>
  );
}
