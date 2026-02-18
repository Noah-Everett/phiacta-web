import {
  getClaim,
  getClaimRelations,
  getConfidence,
  getNeighbors,
  getVerificationStatus,
  getAgent,
  getClaimVersions,
} from "@/lib/api";
import Link from "next/link";
import VerificationBadge from "@/components/VerificationBadge";
import VerificationSubmitForm from "@/components/VerificationSubmitForm";
import ReviewSection from "@/components/ReviewSection";
import VersionHistory from "@/components/VersionHistory";
import type { VerificationStatus, PublicAgent, Claim, Relation, Neighbor, ConfidenceStatus } from "@/lib/types";

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
    relationsResult,
    confidenceResult,
    neighborsResult,
    verificationResult,
    authorResult,
    versionsResult,
  ] = await Promise.allSettled([
    getClaimRelations(id),
    getConfidence(id),
    getNeighbors(id),
    getVerificationStatus(id),
    getAgent(claim.created_by),
    getClaimVersions(id),
  ]);

  const relations: Relation[] =
    relationsResult.status === "fulfilled" ? relationsResult.value : [];
  const confidence: ConfidenceStatus | null =
    confidenceResult.status === "fulfilled" ? confidenceResult.value : null;
  const neighbors: Neighbor[] =
    neighborsResult.status === "fulfilled"
      ? neighborsResult.value.neighbors || []
      : [];
  const verification: VerificationStatus | null =
    verificationResult.status === "fulfilled" ? verificationResult.value : null;
  const author: PublicAgent | null =
    authorResult.status === "fulfilled" ? authorResult.value : null;
  const versions: Claim[] =
    versionsResult.status === "fulfilled" ? versionsResult.value : [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {claim.claim_type}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              claim.status === "active"
                ? "bg-green-50 text-green-700"
                : claim.status === "draft"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {claim.status}
          </span>
          <VerificationBadge
            level={claim.verification_level}
            status={claim.verification_status}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {author ? (
            <span>
              By: <span className="font-medium text-gray-700">{author.name}</span>
              <span className="text-gray-400"> &middot; {author.agent_type}</span>
            </span>
          ) : (
            <span className="font-mono text-xs text-gray-400">
              {claim.created_by.slice(0, 8)}
            </span>
          )}
          <span className="text-gray-300">|</span>
          <span>{new Date(claim.created_at).toLocaleDateString()}</span>
          <span className="text-gray-300">&middot;</span>
          <span>v{claim.version}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Content</h2>
            <p className="text-base leading-relaxed text-gray-800">{claim.content}</p>
            {claim.formal_content && (
              <pre className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-600">
                {claim.formal_content}
              </pre>
            )}
          </section>

          {/* Proof Code — moved to main area */}
          {verification?.verification_code && (
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Proof Code
                {verification.verification_runner_type && (
                  <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                    {verification.verification_runner_type}
                  </span>
                )}
              </h2>
              <pre className="overflow-x-auto rounded bg-gray-50 p-4 text-xs leading-relaxed text-gray-700">
                <code>{verification.verification_code}</code>
              </pre>
            </section>
          )}

          {/* Reviews */}
          <ReviewSection claimId={id} />
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Metadata */}
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Metadata</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400">Type</dt>
                <dd className="text-gray-700">{claim.claim_type}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Status</dt>
                <dd className="text-gray-700">{claim.status}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Namespace</dt>
                <dd className="font-mono text-xs text-gray-700">
                  {claim.namespace_id.slice(0, 8)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Created</dt>
                <dd className="text-gray-700">
                  {new Date(claim.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </section>

          {/* Author */}
          {author && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Author</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-400">Name</dt>
                  <dd className="font-medium text-gray-700">{author.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Type</dt>
                  <dd className="text-gray-700">{author.agent_type}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Trust Score</dt>
                  <dd className="text-gray-700">
                    {(author.trust_score * 100).toFixed(0)}%
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {/* Verification */}
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Verification
            </h3>
            {verification?.verification_status === "pending" ? (
              <div className="flex items-center gap-2 text-sm text-yellow-700">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Verification in progress
              </div>
            ) : verification?.verification_level ? (
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-400">Level</dt>
                  <dd>
                    <VerificationBadge
                      level={verification.verification_level}
                      status={verification.verification_status}
                      size="lg"
                    />
                  </dd>
                </div>
                {verification.verification_status === "failed" &&
                  verification.verification_result?.error_message ? (
                    <div>
                      <dt className="text-gray-400">Error</dt>
                      <dd className="text-sm text-red-600">
                        {String(verification.verification_result.error_message)}
                      </dd>
                    </div>
                  ) : null}
                {verification.verification_result?.execution_time_seconds != null ? (
                  <div>
                    <dt className="text-gray-400">Execution Time</dt>
                    <dd className="text-gray-700">
                      {Number(verification.verification_result.execution_time_seconds).toFixed(2)}s
                    </dd>
                  </div>
                ) : null}
                {verification.verification_result?.verified_at ? (
                  <div>
                    <dt className="text-gray-400">Verified At</dt>
                    <dd className="text-gray-700">
                      {new Date(
                        String(verification.verification_result.verified_at)
                      ).toLocaleString()}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mb-3 text-sm text-gray-400">Not yet verified.</p>
            )}
            {(!verification?.verification_status ||
              verification.verification_status === "failed") && (
              <div className="mt-3">
                <VerificationSubmitForm claimId={id} />
              </div>
            )}
          </section>

          {/* Epistemic Status */}
          {confidence && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Epistemic Status
              </h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-400">Status</dt>
                  <dd className="font-medium text-gray-700">
                    {confidence.epistemic_status}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400">Endorsements</dt>
                  <dd className="text-gray-700">{confidence.endorsement_count}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Disputes</dt>
                  <dd className="text-gray-700">{confidence.dispute_count}</dd>
                </div>
              </dl>
            </section>
          )}

          {/* Version History */}
          {versions.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Version History
              </h3>
              <VersionHistory versions={versions} currentId={id} />
            </section>
          )}

          {/* Relations (compact) */}
          {relations.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Relations ({relations.length})
              </h3>
              <div className="space-y-1">
                {relations.map((rel) => (
                  <div key={rel.id} className="flex items-center gap-2 text-sm">
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                      {rel.relation_type}
                    </span>
                    <Link
                      href={`/claims/${rel.source_id === id ? rel.target_id : rel.source_id}`}
                      className="truncate font-mono text-xs text-blue-600 hover:underline"
                    >
                      {(rel.source_id === id ? rel.target_id : rel.source_id).slice(0, 8)}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Neighbors (compact) */}
          {neighbors.length > 0 && (
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Neighbors ({neighbors.length})
              </h3>
              <div className="space-y-1">
                {neighbors.map((n) => (
                  <div key={n.relation_id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-gray-400">{n.direction}</span>
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                      {n.relation_type}
                    </span>
                    <Link
                      href={`/claims/${n.neighbor_id}`}
                      className="truncate font-mono text-xs text-blue-600 hover:underline"
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
