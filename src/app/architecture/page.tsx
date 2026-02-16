export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Architecture</h1>
      <p className="mb-10 text-sm text-gray-500">
        How Phiacta is designed to be the most general knowledge backend
        possible.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900">
          A General-Purpose Database, Not a Graph
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Phiacta&rsquo;s backend is often described alongside knowledge graphs,
          but that framing undersells its design. At its foundation Phiacta is a
          general-purpose, schema-stable database. It stores atomic units of
          knowledge&mdash;<strong>claims</strong>&mdash;alongside their
          provenance, versioning history, and peer assessments. Relationships
          between claims do exist, but they are just one facet of the data model,
          not its defining feature.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          The goal is generality: the core schema makes as few assumptions as
          possible about how downstream consumers will interpret the data. A
          graph view, a document view, a timeline view, and a confidence
          dashboard are all valid lenses on the same underlying
          store&mdash;none of them is privileged.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900">
          Core Entities
        </h2>
        <p className="mb-4 text-gray-600 leading-relaxed">
          The core schema is deliberately minimal. Every entity carries an{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">attrs</code>{" "}
          JSONB field so domain-specific metadata can be stored without schema
          migrations.
        </p>
        <ul className="list-inside list-disc space-y-3 text-gray-600 leading-relaxed">
          <li>
            <strong>Claims</strong> &mdash; Atomic, immutable assertions.
            Versioned via a lineage system: updates produce new versions rather
            than mutating in place, so every citation remains stable.
          </li>
          <li>
            <strong>Relations</strong> &mdash; Typed, directed edges between
            claims. Each relation records who asserted it and where it was
            stated. Relation types are drawn from an extensible registry.
          </li>
          <li>
            <strong>Sources</strong> &mdash; Real-world artifacts (papers,
            recordings, photos, datasets) from which claims are extracted. A
            content hash enables integrity checks.
          </li>
          <li>
            <strong>Provenance</strong> &mdash; Links claims to their sources
            with metadata about the extraction method, the extractor (human or
            AI), and a separate extraction confidence score.
          </li>
          <li>
            <strong>Agents</strong> &mdash; Any entity that contributes
            knowledge: humans, AI models, organizations, or automated pipelines.
            Each carries a trust score for credibility calibration.
          </li>
          <li>
            <strong>Reviews</strong> &mdash; Perspectival peer assessments.
            Each reviewer assigns their own confidence; aggregate scores are
            computed at query time, not stored.
          </li>
          <li>
            <strong>Namespaces</strong> &mdash; Hierarchical domain scoping.
            The same statement can mean different things in different
            fields&mdash;namespaces keep those contexts separate.
          </li>
          <li>
            <strong>Bundles</strong> &mdash; Atomic write units. All claims,
            relations, and sources in a bundle succeed or fail together,
            preventing partial ingestion.
          </li>
          <li>
            <strong>Artifacts</strong> &mdash; Figures, tables, photos, audio,
            and video linked to claims. Supports both inline and external
            storage.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900">
          Layers &amp; Extensions
        </h2>
        <p className="text-gray-600 leading-relaxed">
          The core schema is intentionally interpretation-free. All higher-level
          meaning&mdash;graph traversal, confidence scoring, epistemic
          status&mdash;lives in <strong>layers</strong>: composable plugins that
          read core data and expose their own tables, views, and API endpoints.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Each layer implements a simple contract: declare a name and version,
          provide a FastAPI router, and run an idempotent setup against the
          database. The layer registry discovers, initializes, and mounts layers
          automatically at startup.
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 p-5">
            <h3 className="mb-2 font-semibold text-gray-900">Graph Layer</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Interprets core relations as a typed, semantic knowledge graph.
              Owns a registry of relationship types (supports, contradicts,
              depends_on, etc.) with formal properties&mdash;transitivity,
              symmetry, inverse names&mdash;that enable automated reasoning.
              Provides neighbor lookup and BFS/DFS traversal endpoints.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <h3 className="mb-2 font-semibold text-gray-900">
              Confidence Layer
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Aggregates peer reviews into an epistemic status for each claim:
              unverified, endorsed, formally verified, disputed, or under review.
              Different communities can swap in alternative scoring models by
              replacing this layer.
            </p>
          </div>
        </div>
        <p className="mt-4 text-gray-600 leading-relaxed">
          New layers can be added without touching the core schema. Because
          layers are optional and composable, different deployments can include
          exactly the interpretations they need.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900">
          Why This Design
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Most knowledge platforms bake a specific worldview into their schema:
          triples, documents, or graphs. That works until requirements change.
          Phiacta takes a different approach:
        </p>
        <ul className="mt-4 list-inside list-disc space-y-3 text-gray-600 leading-relaxed">
          <li>
            <strong>Immutable versioning</strong> &mdash; Claims are never
            mutated. New versions reference their predecessors, giving every
            citation a stable target and every claim a full history.
          </li>
          <li>
            <strong>Perspectival confidence</strong> &mdash; There is no single
            &ldquo;truth score.&rdquo; Each reviewer records their own verdict
            and confidence. Aggregation happens at query time, so different
            trust models can coexist.
          </li>
          <li>
            <strong>Extensible attributes</strong> &mdash; Every entity has a
            JSONB field for arbitrary metadata. Domain-specific fields like{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">
              content_latex
            </code>{" "}
            can be added without a migration.
          </li>
          <li>
            <strong>General interfaces</strong> &mdash; The API exposes claims,
            relations, and search at the core level. Layers add higher-level
            endpoints (graph traversal, confidence aggregation) on top. Consumers
            interact through whichever interface fits their needs.
          </li>
          <li>
            <strong>Record, don&rsquo;t resolve</strong> &mdash; Contradictory
            claims coexist. The database is a faithful record of what has been
            asserted and by whom. Resolution is left to downstream consumers,
            mirroring how science actually works.
          </li>
        </ul>
        <p className="mt-4 text-gray-600 leading-relaxed">
          The result is a backend that can serve a knowledge graph explorer
          today, a formal verification engine tomorrow, and use cases we
          haven&rsquo;t imagined yet&mdash;all without changing the core schema.
        </p>
      </section>
    </div>
  );
}
