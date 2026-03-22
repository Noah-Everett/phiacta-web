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
          Every claim on Phiacta is a{" "}
          <strong className="dark:text-gray-200">git repository</strong>. Version
          history, supporting files, proposals, and issues all live in that
          repository. What lives in the database are the facts that need to be
          queryable and scored: votes, reviews, typed references between claims,
          and identity.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          The database stores only what users directly provide&mdash;no derived
          or computed values. Confidence scores, graph embeddings, and knowledge
          maps are computed at query time by separate analysis{" "}
          <strong className="dark:text-gray-200">layers</strong> and are never
          written back into the ground truth store.
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
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">/v1/claims, /v1/references, /v1/search</span>
            </div>
            <div className="flex justify-center text-gray-300 dark:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Layers */}
            <div className="rounded-md border-2 border-dashed border-gray-400 bg-white p-3 dark:border-gray-500 dark:bg-gray-800">
              <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Layers (computed, never stored in core)
              </p>
              <div className="flex gap-2">
                <div className="flex-1 rounded bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Graph
                </div>
                <div className="flex-1 rounded bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Confidence
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
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">Claims, References, Interactions, Agents&hellip;</span>
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
                <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">scores, identity, search</p>
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
          The core schema is deliberately minimal. Every entity carries an{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">attrs</code>{" "}
          JSONB field for domain-specific metadata that doesn&rsquo;t need a
          column of its own.
        </p>

        {/* Entity grid */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Entity Relationships
          </p>
          <div className="mx-auto mb-5 w-fit rounded-md border-2 border-gray-900 bg-gray-900 px-6 py-3 text-center dark:border-gray-100 dark:bg-gray-100">
            <span className="text-sm font-semibold text-white dark:text-gray-900">Claims</span>
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
              The central entity &mdash; everything connects here
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">References</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Typed connections between any two claims or sub-resources
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Votes &amp; Reviews</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Community assessments that feed confidence scoring
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Agents</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Humans, AI, organizations, or pipelines that author content
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Sources</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Papers, recordings, datasets claims are drawn from
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Provenance</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Links each claim to its source with extraction metadata
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Bundles</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Atomic batches: all claims and references succeed or fail together
              </p>
            </div>
          </div>
        </div>

        <ul className="list-inside list-disc space-y-3 text-gray-600 leading-relaxed dark:text-gray-400">
          <li>
            <strong className="dark:text-gray-200">Claims</strong> &mdash; Atomic
            assertions, each backed by a git repository. Content is versioned via
            git commits. Proposals (branches + PRs) and issues live in the same
            repository. Supporting materials&mdash;data, code, proofs&mdash;are
            committed alongside the claim content.
          </li>
          <li>
            <strong className="dark:text-gray-200">References</strong> &mdash; Typed,
            directed connections between any two addressable URIs in the system
            (claims, issues, PRs, commits, interactions, agents). Reference types
            include evidence, rebuttal, citation, derivation, supersession, and more.
          </li>
          <li>
            <strong className="dark:text-gray-200">Votes &amp; Reviews</strong> &mdash;
            Community assessments. Each vote carries a signal (agree / disagree /
            neutral) and a confidence. Reviews add a written body. Aggregate scores
            are computed at query time&mdash;never stored.
          </li>
          <li>
            <strong className="dark:text-gray-200">Agents</strong> &mdash; Any entity
            that contributes knowledge: humans, AI models, organizations, or automated
            pipelines. Each carries a trust score used as vote weight.
          </li>
          <li>
            <strong className="dark:text-gray-200">Sources</strong> &mdash; Real-world
            artifacts (papers, recordings, datasets) from which claims were extracted.
            A content hash enables integrity verification.
          </li>
          <li>
            <strong className="dark:text-gray-200">Provenance</strong> &mdash; Records
            which source a claim came from, by what extraction method, and with what
            confidence.
          </li>
          <li>
            <strong className="dark:text-gray-200">Bundles</strong> &mdash; Atomic write
            units for batch ingestion. All claims, references, and sources in a bundle
            succeed or fail together, preventing partial ingestion.
          </li>
        </ul>
      </section>

      {/* Claims as git repos */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Claims as Git Repositories
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          Each claim is a git repository hosted internally on Forgejo. Users never
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
                ["Repository", "Claim"],
                ["Commit", "Update / version"],
                ["Branch + pull request", "Proposal"],
                ["Issue", "Issue"],
                ["Merge", "Accept proposal"],
                ["Close PR", "Reject proposal"],
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
            Claim repository structure
          </p>
          <pre className="text-xs text-gray-600 leading-relaxed dark:text-gray-400">{`{claim_uuid}/
├── claim.md              # claim content
├── claim.yaml            # title, type, authors, topics
├── verification/
│   ├── manifest.yaml     # what kind of verification is present
│   ├── proof.lean        # formal proof (if applicable)
│   ├── data/             # supporting datasets
│   └── scripts/          # reproducibility scripts
└── attachments/          # figures and supporting files`}</pre>
        </div>

        {/* Verification */}
        <div className="mt-6">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Verification Status</h3>
          <p className="mb-4 text-sm text-gray-600 leading-relaxed dark:text-gray-400">
            Each claim has a verification status derived from what is present in its
            repository. Unverified claims are accepted&mdash;but the absence of proof
            is visible to everyone.
          </p>
          <div className="space-y-2">
            {[
              { label: "Verified", desc: "Automated check passed (e.g., Lean proof compiled)", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
              { label: "Empirical", desc: "Data and code present; no formal proof", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
              { label: "Submitted", desc: "Materials uploaded; automated check pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
              { label: "Unverified", desc: "No supporting materials", color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" },
            ].map(({ label, desc, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layers and Extensions */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Layers &amp; Extensions
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          The core schema is interpretation-free. Higher-level meaning lives in{" "}
          <strong className="dark:text-gray-200">layers</strong>&mdash;composable
          analysis modules that read core data and expose their own computed views and
          API endpoints.
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Confidence Layer</h3>
            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">
              Aggregates votes and reviews into an epistemic status for each claim:
              unverified, under review, endorsed, or disputed. Different communities
              can deploy alternative scoring models by replacing this layer.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Graph Layer</h3>
            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">
              Interprets the references table as a typed knowledge graph. Maintains a
              registry of relationship types with formal properties (transitivity,
              symmetry, inverse names). Provides neighbor lookup and BFS/DFS traversal.
            </p>
          </div>
        </div>
        <p className="mt-6 text-gray-600 leading-relaxed dark:text-gray-400">
          <strong className="dark:text-gray-200">Extensions</strong> are third-party
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
            Every version of every claim is preserved forever. Nothing is deleted.
            Citations always resolve.
          </li>
          <li>
            <strong className="dark:text-gray-200">Proof over assertion</strong> &mdash;
            Supporting materials (data, code, formal proofs) are first-class
            content in every claim repository. Verification status is explicit.
          </li>
          <li>
            <strong className="dark:text-gray-200">API first</strong> &mdash;
            Every feature on the website is accessible through the API. The website
            is a thin client. The API is the platform.
          </li>
          <li>
            <strong className="dark:text-gray-200">Ground truth only</strong> &mdash;
            The database stores only what users provide. Derived values (confidence
            scores, graph embeddings) are computed on demand and never contaminate
            the source data.
          </li>
          <li>
            <strong className="dark:text-gray-200">Record, don&rsquo;t resolve</strong> &mdash;
            Contradictory claims coexist. The system records what has been asserted
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
