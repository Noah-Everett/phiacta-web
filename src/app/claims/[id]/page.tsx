import { getClaim, getClaimRelations, getConfidence, getNeighbors } from "@/lib/api";
import Link from "next/link";

interface ClaimPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { id } = await params;

  let claim = null;
  let relations: { id: string; source_id: string; target_id: string; relation_type: string; strength: number }[] = [];
  let confidence = null;
  let neighbors: { relation_id: string; neighbor_id: string; relation_type: string; direction: string; strength: number; edge_type_info: { category: string } }[] = [];

  try {
    claim = await getClaim(id);
  } catch {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-red-500">Claim not found or backend unavailable.</p>
      </div>
    );
  }

  try {
    relations = await getClaimRelations(id);
  } catch {}

  try {
    confidence = await getConfidence(id);
  } catch {}

  try {
    const neighborData = await getNeighbors(id);
    neighbors = neighborData.neighbors || [];
  } catch {}

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <p className="mb-1 font-mono text-sm text-gray-400">{claim.id}</p>
        <div className="flex items-center gap-2">
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
          <span className="text-xs text-gray-400">v{claim.version}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Content</h2>
            <p className="text-base leading-relaxed text-gray-800">{claim.content}</p>
            {claim.formal_content && (
              <pre className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-600">
                {claim.formal_content}
              </pre>
            )}
          </section>

          <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Relations ({relations.length})
            </h2>
            {relations.length > 0 ? (
              <div className="space-y-2">
                {relations.map((rel: { id: string; source_id: string; target_id: string; relation_type: string; strength: number }) => (
                  <div key={rel.id} className="flex items-center gap-2 text-sm">
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                      {rel.relation_type}
                    </span>
                    <span className="text-gray-400">strength: {rel.strength}</span>
                    <Link
                      href={`/claims/${rel.source_id === id ? rel.target_id : rel.source_id}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {rel.source_id === id ? rel.target_id : rel.source_id}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No relations yet.</p>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Graph Neighbors ({neighbors.length})
            </h2>
            {neighbors.length > 0 ? (
              <div className="space-y-2">
                {neighbors.map((n: { relation_id: string; neighbor_id: string; relation_type: string; direction: string; strength: number; edge_type_info: { category: string } }) => (
                  <div key={n.relation_id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">{n.direction}</span>
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                      {n.relation_type}
                    </span>
                    <Link
                      href={`/claims/${n.neighbor_id}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {n.neighbor_id}
                    </Link>
                    <span className="text-xs text-gray-300">
                      ({n.edge_type_info.category})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No neighbors found.</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div>
          <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
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
                <dt className="text-gray-400">Version</dt>
                <dd className="text-gray-700">{claim.version}</dd>
              </div>
              <div>
                <dt className="text-gray-400">Created</dt>
                <dd className="text-gray-700">
                  {new Date(claim.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </section>

          {confidence && (
            <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
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
                  <dt className="text-gray-400">Reviews</dt>
                  <dd className="text-gray-700">{confidence.review_count}</dd>
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
        </div>
      </div>
    </div>
  );
}
