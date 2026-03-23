export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Architecture</h1>
      <p className="mb-10 text-sm text-gray-500 dark:text-gray-400">
        How Phiacta is designed to be a permanent, general-purpose knowledge platform.
      </p>

      {/* Core principle */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Git for Content, Postgres for Facts
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          Every entry on Phiacta is a{" "}
          <strong className="dark:text-gray-200">git repository</strong>. Version
          history, supporting files, edit proposals, and issues all live in that
          repository. What lives in the database are the facts that need to be
          queryable: references between entries, tags, and identity.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          The database stores only what users directly provide&mdash;no derived
          or computed values. Search indexes and knowledge maps are computed at
          query time by separate analysis modules and are never written back into
          the ground truth store.
        </p>

        {/* Stack diagram */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            System Architecture
          </p>
          <div className="mx-auto flex max-w-lg flex-col items-stretch gap-2">
            {/* Consumers */}
            <div className="flex gap-2">
              <div className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Web App
              </div>
              <div className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Extensions
              </div>
              <div className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Direct API
              </div>
            </div>
            <div className="flex justify-center text-gray-300 dark:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* API */}
            <div className="rounded-md border border-gray-400 bg-white px-4 py-2.5 text-center dark:border-gray-500 dark:bg-gray-800">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">REST API</span>
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">/v1/entries, /v1/extensions, /v1/users</span>
            </div>
            <div className="flex justify-center text-gray-300 dark:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Layers */}
            <div className="rounded-md border-2 border-dashed border-gray-400 bg-white p-3 dark:border-gray-500 dark:bg-gray-800">
              <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Extensions &amp; Views (computed, never stored in core)
              </p>
              <div className="flex gap-2">
                <div className="flex-1 rounded bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Tags
                </div>
                <div className="flex-1 rounded bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Search
                </div>
                <div className="flex-1 rounded border border-dashed border-gray-300 bg-white px-3 py-2 text-center text-xs text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500">
                  Custom
                </div>
              </div>
            </div>
            <div className="flex justify-center text-gray-300 dark:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Core schema */}
            <div className="rounded-md border-2 border-gray-900 bg-gray-900 px-4 py-3 text-center dark:border-gray-100 dark:bg-gray-100">
              <span className="text-sm font-semibold text-white dark:text-gray-900">Core Database</span>
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">Entries, References, Agents&hellip;</span>
            </div>
            <div className="flex justify-center text-gray-300 dark:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Storage */}
            <div className="flex gap-2">
              <div className="flex-1 rounded-md border border-gray-400 bg-white px-3 py-2.5 text-center dark:border-gray-500 dark:bg-gray-800">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">PostgreSQL</span>
                <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">identity, refs, search</p>
              </div>
              <div className="flex-1 rounded-md border border-gray-400 bg-white px-3 py-2.5 text-center dark:border-gray-500 dark:bg-gray-800">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Forgejo</span>
                <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">content, history, files</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core entities */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Core Entities
        </h2>
        <p className="mb-4 text-gray-600 leading-relaxed dark:text-gray-400">
          The core schema is deliberately minimal. The four-layer architecture
          separates entries (core), extensions (tags, etc.), views (search), and
          tools (external).
        </p>

        {/* Entity grid */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Entity Relationships
          </p>
          <div className="mx-auto mb-5 w-fit rounded-md border-2 border-gray-900 bg-gray-900 px-6 py-3 text-center dark:border-gray-100 dark:bg-gray-100">
            <span className="text-sm font-semibold text-white dark:text-gray-900">Entries</span>
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
              The central entity &mdash; everything connects here
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">References</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Typed connections between any two entries
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Edit Proposals</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Content change requests on an entry&apos;s repository
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Agents</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Humans, AI, organizations, or pipelines that author content
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Tags</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Extension: categorize entries with freeform labels
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Files</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Supporting materials stored in the entry&apos;s git repo
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">History</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Git commit log for every entry
              </p>
            </div>
          </div>
        </div>

        <ul className="list-inside list-disc space-y-3 text-gray-600 leading-relaxed dark:text-gray-400">
          <li>
            <strong className="dark:text-gray-200">Entries</strong> &mdash; Atomic
            assertions, each backed by a git repository. Content is versioned via
            git commits. Edit proposals (branches + PRs) and issues live in the same
            repository. Supporting materials&mdash;data, code, proofs&mdash;are
            committed alongside the entry content.
          </li>
          <li>
            <strong className="dark:text-gray-200">References</strong> &mdash; Typed,
            directed connections between entries. Reference types
            include evidence, rebuttal, citation, derivation, supersession, and more.
          </li>
          <li>
            <strong className="dark:text-gray-200">Agents</strong> &mdash; Any entity
            that contributes knowledge: humans, AI models, organizations, or automated
            pipelines.
          </li>
          <li>
            <strong className="dark:text-gray-200">Tags</strong> &mdash; An extension
            that allows freeform categorization of entries. Tags are stored separately
            from the entry core schema.
          </li>
        </ul>
      </section>

      {/* Entries as git repos */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Entries as Git Repositories
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          Each entry is a git repository hosted internally on Forgejo. Users never
          interact with Forgejo directly&mdash;they use the Phiacta API or website,
          which proxy all git operations.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          Git concepts are surfaced to users with plain-language names:
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Under the hood</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">What you see</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
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
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">{git}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300">{user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Repo structure */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Entry repository structure
          </p>
          <pre className="text-xs text-gray-600 leading-relaxed dark:text-gray-400">{`{entry_uuid}/
├── README.md             # entry content
├── .phiacta/
│   ├── entry.yaml        # title, layout_hint, authors
│   └── manifest.yaml     # what kind of verification is present
├── verification/
│   ├── proof.lean        # formal proof (if applicable)
│   ├── data/             # supporting datasets
│   └── scripts/          # reproducibility scripts
└── attachments/          # figures and supporting files`}</pre>
        </div>
      </section>

      {/* Extensions */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Extensions &amp; Views
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          The core schema is interpretation-free. Higher-level meaning lives in{" "}
          <strong className="dark:text-gray-200">extensions</strong>&mdash;composable
          modules that read core data and expose their own computed views and
          API endpoints.
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Tags Extension</h3>
            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">
              Allows freeform tagging of entries. Tags are stored in a separate table
              and exposed through the /v1/extensions/tags/ API. Supports filtering
              entries by tag combinations.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Search View</h3>
            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">
              A database view that provides full-text search across entry titles and
              content. Computed at query time from the entries table using PostgreSQL
              tsvector indexing.
            </p>
          </div>
        </div>
        <p className="mt-6 text-gray-600 leading-relaxed dark:text-gray-400">
          <strong className="dark:text-gray-200">External extensions</strong> are third-party
          applications that connect to the Phiacta API to produce new outputs
          (papers, podcasts, slide decks, summaries) or enable new input methods
          (PDF ingestion, voice dictation). Extensions run their own compute.
          Phiacta only stores and serves the data. Extensions are listed in the
          marketplace on phiacta.com.
        </p>
      </section>

      {/* Design principles */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Why This Design
        </h2>
        <ul className="list-inside list-disc space-y-3 text-gray-600 leading-relaxed dark:text-gray-400">
          <li>
            <strong className="dark:text-gray-200">Git-backed permanence</strong> &mdash;
            Every version of every entry is preserved forever. Nothing is deleted.
            Citations always resolve.
          </li>
          <li>
            <strong className="dark:text-gray-200">Proof over assertion</strong> &mdash;
            Supporting materials (data, code, formal proofs) are first-class
            content in every entry repository.
          </li>
          <li>
            <strong className="dark:text-gray-200">API first</strong> &mdash;
            Every feature on the website is accessible through the API. The website
            is a thin client. The API is the platform.
          </li>
          <li>
            <strong className="dark:text-gray-200">Ground truth only</strong> &mdash;
            The database stores only what users provide. Derived values are computed
            on demand and never contaminate the source data.
          </li>
          <li>
            <strong className="dark:text-gray-200">Record, don&rsquo;t resolve</strong> &mdash;
            Contradictory entries coexist. The system records what has been asserted
            and by whom. Resolution is left to the community.
          </li>
          <li>
            <strong className="dark:text-gray-200">Accessible to everyone</strong> &mdash;
            Git concepts are surfaced with plain-language names. No technical
            knowledge of git is required to use Phiacta.
          </li>
        </ul>
      </section>
    </div>
  );
}
