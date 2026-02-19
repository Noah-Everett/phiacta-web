import {
  getClaim,
  getClaimReferences,
  getConfidence,
  getNeighbors,
  getAgent,
} from "@/lib/api";
import Link from "next/link";
import InteractionSection from "@/components/InteractionSection";
import MarkdownContent from "@/components/MarkdownContent";
import type { PublicAgent, Claim, Reference, Neighbor, ConfidenceStatus } from "@/lib/types";

interface ClaimPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { id } = await params;

  let claim: Claim | null = null;
  try {
    claim = await getClaim(id);
  } catch {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-red-500">Claim not found or backend unavailable.</p>
      </div>
    );
  }

  // Secondary fetches — failures don't break the page
  const [
    referencesResult,
    confidenceResult,
    neighborsResult,
    authorResult,
  ] = await Promise.allSettled([
    getClaimReferences(id),
    getConfidence(id),
    getNeighbors(id),
    getAgent(claim.created_by),
  ]);

  const references: Reference[] =
    referencesResult.status === "fulfilled" ? referencesResult.value : [];
  const confidence: ConfidenceStatus | null =
    confidenceResult.status === "fulfilled" ? confidenceResult.value : null;
  const neighbors: Neighbor[] =
    neighborsResult.status === "fulfilled"
      ? neighborsResult.value.neighbors || []
      : [];
  const author: PublicAgent | null =
    authorResult.status === "fulfilled" ? authorResult.value : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">{claim.title}</h1>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {claim.claim_type}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              claim.status === "active"
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : claim.status === "draft"
                  ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : claim.status === "retracted"
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {claim.status}
          </span>
          <span className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {claim.format}
          </span>
          {claim.repo_status === "provisioning" && (
            <span className="rounded bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              syncing...
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {author ? (
            <span>
              By: <span className="font-medium text-gray-700 dark:text-gray-300">{author.name}</span>
              <span className="text-gray-400 dark:text-gray-500"> &middot; {author.agent_type}</span>
            </span>
          ) : (
            <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
              {claim.created_by.slice(0, 8)}
            </span>
          )}
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span>{new Date(claim.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Content</h2>
            {claim.content_cache ? (
              <MarkdownContent content={claim.content_cache} className="text-base leading-relaxed text-gray-800 dark:text-gray-200" />
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Content is stored in the git repository.
                {claim.repo_status === "provisioning" && " Repository is still being provisioned."}
              </p>
            )}
          </section>

          {/* Interactions */}
          <InteractionSection claimId={id} />
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Metadata */}
          <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Metadata</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400 dark:text-gray-500">Type</dt>
                <dd className="text-gray-700 dark:text-gray-300">{claim.claim_type}</dd>
              </div>
              <div>
                <dt className="text-gray-400 dark:text-gray-500">Status</dt>
                <dd className="text-gray-700 dark:text-gray-300">{claim.status}</dd>
              </div>
              <div>
                <dt className="text-gray-400 dark:text-gray-500">Format</dt>
                <dd className="text-gray-700 dark:text-gray-300">{claim.format}</dd>
              </div>
              <div>
                <dt className="text-gray-400 dark:text-gray-500">Namespace</dt>
                <dd className="font-mono text-xs text-gray-700 dark:text-gray-300">
                  {claim.namespace_id.slice(0, 8)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400 dark:text-gray-500">Created</dt>
                <dd className="text-gray-700 dark:text-gray-300">
                  {new Date(claim.created_at).toLocaleString()}
                </dd>
              </div>
              {claim.cached_confidence != null && (
                <div>
                  <dt className="text-gray-400 dark:text-gray-500">Confidence</dt>
                  <dd className="text-gray-700 dark:text-gray-300">
                    {(claim.cached_confidence * 100).toFixed(0)}%
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Author */}
          {author && (
            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Author</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-400 dark:text-gray-500">Name</dt>
                  <dd className="font-medium text-gray-700 dark:text-gray-300">{author.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 dark:text-gray-500">Type</dt>
                  <dd className="text-gray-700 dark:text-gray-300">{author.agent_type}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 dark:text-gray-500">Trust Score</dt>
                  <dd className="text-gray-700 dark:text-gray-300">
                    {(author.trust_score * 100).toFixed(0)}%
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {/* Epistemic Status */}
          {confidence && (
            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Epistemic Status
              </h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-400 dark:text-gray-500">Status</dt>
                  <dd className="font-medium text-gray-700 dark:text-gray-300">
                    {confidence.epistemic_status}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400 dark:text-gray-500">Agree</dt>
                  <dd className="text-gray-700 dark:text-gray-300">{confidence.agree_count}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 dark:text-gray-500">Disagree</dt>
                  <dd className="text-gray-700 dark:text-gray-300">{confidence.disagree_count}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 dark:text-gray-500">Neutral</dt>
                  <dd className="text-gray-700 dark:text-gray-300">{confidence.neutral_count}</dd>
                </div>
                {confidence.weighted_agree_confidence != null && (
                  <div>
                    <dt className="text-gray-400 dark:text-gray-500">Weighted Agree Confidence</dt>
                    <dd className="text-gray-700 dark:text-gray-300">
                      {(confidence.weighted_agree_confidence * 100).toFixed(0)}%
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* References */}
          {references.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                References ({references.length})
              </h3>
              <div className="space-y-1">
                {references.map((ref) => {
                  const linkedClaimId =
                    ref.source_claim_id === id
                      ? ref.target_claim_id
                      : ref.source_claim_id;
                  return (
                    <div key={ref.id} className="flex items-center gap-2 text-sm">
                      <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {ref.role}
                      </span>
                      {linkedClaimId ? (
                        <Link
                          href={`/claims/${linkedClaimId}`}
                          className="truncate font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {linkedClaimId.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="truncate font-mono text-xs text-gray-500 dark:text-gray-400">
                          {ref.source_claim_id === id
                            ? ref.target_uri
                            : ref.source_uri}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Neighbors */}
          {neighbors.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Neighbors ({neighbors.length})
              </h3>
              <div className="space-y-1">
                {neighbors.map((n) => (
                  <div key={n.reference_id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{n.direction}</span>
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {n.role}
                    </span>
                    <Link
                      href={`/claims/${n.neighbor_id}`}
                      className="truncate font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {n.neighbor_id.slice(0, 8)}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
