export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Architecture</h1>
      <p className="mb-10 text-sm text-gray-500 dark:text-gray-400">
        How Phiacta is designed to be the most general knowledge backend
        possible.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          A General-Purpose Database, Not a Graph
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          Phiacta&rsquo;s backend is often described alongside knowledge graphs,
          but that framing undersells its design. At its foundation Phiacta is a
          general-purpose, schema-stable database. It stores atomic units of
          knowledge&mdash;<strong className="dark:text-gray-200">claims</strong>&mdash;alongside their
          provenance, versioning history, and peer assessments. Relationships
          between claims do exist, but they are just one facet of the data model,
          not its defining feature.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          The goal is generality: the core schema makes as few assumptions as
          possible about how downstream consumers will interpret the data. A
          graph view, a document view, a timeline view, and a confidence
          dashboard are all valid lenses on the same underlying
          store&mdash;none of them is privileged.
        </p>

        {/* Layer stack diagram */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Layered Architecture
          </p>
          <div className="mx-auto flex max-w-lg flex-col items-stretch gap-2">
            {/* Consumers */}
            <div className="flex gap-2">
              <div className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Web App
              </div>
              <div className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                SDK
              </div>
              <div className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-center text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                External Tools
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
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">/v1/claims, /v1/relations, /v1/search</span>
            </div>
            <div className="flex justify-center text-gray-300 dark:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Layers */}
            <div className="rounded-md border-2 border-dashed border-gray-400 bg-white p-3 dark:border-gray-500 dark:bg-gray-800">
              <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Layers (composable, optional)
              </p>
              <div className="flex gap-2">
                <div className="flex-1 rounded bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Graph
                </div>
                <div className="flex-1 rounded bg-gray-100 px-3 py-2 text-center text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Confidence
                </div>
                <div className="flex-1 rounded border border-dashed border-gray-300 bg-white px-3 py-2 text-center text-xs text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500">
                  Your Layer
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
              <span className="text-sm font-semibold text-white dark:text-gray-900">Core Schema</span>
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">Claims, Relations, Sources, Agents, ...</span>
            </div>
            <div className="flex justify-center text-gray-300 dark:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v10M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* PostgreSQL */}
            <div className="rounded-md border border-gray-400 bg-white px-4 py-2.5 text-center dark:border-gray-500 dark:bg-gray-800">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PostgreSQL</span>
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">+ pgvector, JSONB, TSVECTOR</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Core Entities
        </h2>
        <p className="mb-4 text-gray-600 leading-relaxed dark:text-gray-400">
          The core schema is deliberately minimal. Every entity carries an{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">attrs</code>{" "}
          JSONB field so domain-specific metadata can be stored without schema
          migrations.
        </p>

        {/* Entity relationship diagram */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Entity Relationships
          </p>

          {/* Claims hub */}
          <div className="mx-auto mb-5 w-fit rounded-md border-2 border-gray-900 bg-gray-900 px-6 py-3 text-center dark:border-gray-100 dark:bg-gray-100">
            <span className="text-sm font-semibold text-white dark:text-gray-900">Claims</span>
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
              The central entity &mdash; everything connects here
            </p>
          </div>

          {/* Surrounding entities as labeled cards */}
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Relations</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Typed edges between two claims
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Provenance</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Links each claim to its source
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Reviews</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Peer assessments of a claim
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Namespaces</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Domain scope for claims
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Sources</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Papers, recordings, datasets
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Agents</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Humans, AI, or pipelines that author content
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Bundles</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Atomic batches of claims &amp; relations
              </p>
            </div>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Artifacts</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                Figures, tables, media attached to claims
              </p>
            </div>
          </div>
        </div>

        <ul className="list-inside list-disc space-y-3 text-gray-600 leading-relaxed dark:text-gray-400">
          <li>
            <strong className="dark:text-gray-200">Claims</strong> &mdash; Atomic, immutable assertions.
            Versioned via a lineage system: updates produce new versions rather
            than mutating in place, so every citation remains stable.
          </li>
          <li>
            <strong className="dark:text-gray-200">Relations</strong> &mdash; Typed, directed edges between
            claims. Each relation records who asserted it and where it was
            stated. Relation types are drawn from an extensible registry.
          </li>
          <li>
            <strong className="dark:text-gray-200">Sources</strong> &mdash; Real-world artifacts (papers,
            recordings, photos, datasets) from which claims are extracted. A
            content hash enables integrity checks.
          </li>
          <li>
            <strong className="dark:text-gray-200">Provenance</strong> &mdash; Links claims to their sources
            with metadata about the extraction method, the extractor (human or
            AI), and a separate extraction confidence score.
          </li>
          <li>
            <strong className="dark:text-gray-200">Agents</strong> &mdash; Any entity that contributes
            knowledge: humans, AI models, organizations, or automated pipelines.
            Each carries a trust score for credibility calibration.
          </li>
          <li>
            <strong className="dark:text-gray-200">Reviews</strong> &mdash; Perspectival peer assessments.
            Each reviewer assigns their own confidence; aggregate scores are
            computed at query time, not stored.
          </li>
          <li>
            <strong className="dark:text-gray-200">Namespaces</strong> &mdash; Hierarchical domain scoping.
            The same statement can mean different things in different
            fields&mdash;namespaces keep those contexts separate.
          </li>
          <li>
            <strong className="dark:text-gray-200">Bundles</strong> &mdash; Atomic write units. All claims,
            relations, and sources in a bundle succeed or fail together,
            preventing partial ingestion.
          </li>
          <li>
            <strong className="dark:text-gray-200">Artifacts</strong> &mdash; Figures, tables, photos, audio,
            and video linked to claims. Supports both inline and external
            storage.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Layers &amp; Extensions
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          The core schema is intentionally interpretation-free. All higher-level
          meaning&mdash;graph traversal, confidence scoring, epistemic
          status&mdash;lives in <strong className="dark:text-gray-200">layers</strong>: composable plugins that
          read core data and expose their own tables, views, and API endpoints.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          Each layer implements a simple contract: declare a name and version,
          provide a FastAPI router, and run an idempotent setup against the
          database. The layer registry discovers, initializes, and mounts layers
          automatically at startup.
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Graph Layer</h3>
            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">
              Interprets core relations as a typed, semantic knowledge graph.
              Owns a registry of relationship types (supports, contradicts,
              depends_on, etc.) with formal properties&mdash;transitivity,
              symmetry, inverse names&mdash;that enable automated reasoning.
              Provides neighbor lookup and BFS/DFS traversal endpoints.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
              Confidence Layer
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">
              Aggregates peer reviews into an epistemic status for each claim:
              unverified, endorsed, formally verified, disputed, or under review.
              Different communities can swap in alternative scoring models by
              replacing this layer.
            </p>
          </div>
        </div>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          New layers can be added without touching the core schema. Because
          layers are optional and composable, different deployments can include
          exactly the interpretations they need.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Why This Design
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          Most knowledge platforms bake a specific worldview into their schema:
          triples, documents, or graphs. That works until requirements change.
          Phiacta takes a different approach:
        </p>
        <ul className="mt-4 list-inside list-disc space-y-3 text-gray-600 leading-relaxed dark:text-gray-400">
          <li>
            <strong className="dark:text-gray-200">Immutable versioning</strong> &mdash; Claims are never
            mutated. New versions reference their predecessors, giving every
            citation a stable target and every claim a full history.
          </li>
          <li>
            <strong className="dark:text-gray-200">Perspectival confidence</strong> &mdash; There is no single
            &ldquo;truth score.&rdquo; Each reviewer records their own verdict
            and confidence. Aggregation happens at query time, so different
            trust models can coexist.
          </li>
          <li>
            <strong className="dark:text-gray-200">Extensible attributes</strong> &mdash; Every entity has a
            JSONB field for arbitrary metadata. Domain-specific fields like{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">
              content_latex
            </code>{" "}
            can be added without a migration.
          </li>
          <li>
            <strong className="dark:text-gray-200">General interfaces</strong> &mdash; The API exposes claims,
            relations, and search at the core level. Layers add higher-level
            endpoints (graph traversal, confidence aggregation) on top. Consumers
            interact through whichever interface fits their needs.
          </li>
          <li>
            <strong className="dark:text-gray-200">Record, don&rsquo;t resolve</strong> &mdash; Contradictory
            claims coexist. The database is a faithful record of what has been
            asserted and by whom. Resolution is left to downstream consumers,
            mirroring how science actually works.
          </li>
        </ul>

        {/* Claim versioning diagram */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Immutable Claim Versioning
          </p>
          <div className="mx-auto flex max-w-lg items-center justify-center gap-3">
            {/* v1 */}
            <div className="flex flex-col items-center">
              <div className="rounded-md border border-gray-300 bg-white px-4 py-3 text-center dark:border-gray-600 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">v1</p>
                <p className="mt-1 text-[11px] leading-snug text-gray-600 dark:text-gray-400">
                  &ldquo;X correlates<br />with Y&rdquo;
                </p>
              </div>
              <span className="mt-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                active
              </span>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-0.5 pb-5">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">supersedes</span>
              <div className="flex items-center">
                <div className="h-px w-6 bg-gray-300 dark:bg-gray-600" />
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-300 dark:text-gray-600">
                  <path d="M0 0l8 4-8 4z" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* v2 */}
            <div className="flex flex-col items-center">
              <div className="rounded-md border border-gray-300 bg-white px-4 py-3 text-center dark:border-gray-600 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">v2</p>
                <p className="mt-1 text-[11px] leading-snug text-gray-600 dark:text-gray-400">
                  &ldquo;X causes<br />Y under Z&rdquo;
                </p>
              </div>
              <span className="mt-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                active
              </span>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-0.5 pb-5">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">supersedes</span>
              <div className="flex items-center">
                <div className="h-px w-6 bg-gray-300 dark:bg-gray-600" />
                <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-300 dark:text-gray-600">
                  <path d="M0 0l8 4-8 4z" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* v3 */}
            <div className="flex flex-col items-center">
              <div className="rounded-md border-2 border-gray-900 bg-white px-4 py-3 text-center dark:border-gray-100 dark:bg-gray-800">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">v3</p>
                <p className="mt-1 text-[11px] leading-snug text-gray-600 dark:text-gray-400">
                  &ldquo;X causes Y<br />via mechanism M&rdquo;
                </p>
              </div>
              <span className="mt-1.5 rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-white dark:bg-gray-100 dark:text-gray-900">
                latest
              </span>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
            Same lineage_id &mdash; every version is a citable, stable snapshot
          </p>
        </div>

        <p className="mt-6 text-gray-600 leading-relaxed dark:text-gray-400">
          The result is a backend that can serve a knowledge graph explorer
          today, a formal verification engine tomorrow, and use cases we
          haven&rsquo;t imagined yet&mdash;all without changing the core schema.
        </p>
      </section>
    </div>
  );
}
