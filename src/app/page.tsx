import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { listClaims } from "@/lib/api";

export default async function Home() {
  let claims: { id: string; content: string; claim_type: string; status: string; created_at: string }[] = [];
  try {
    const data = await listClaims(5);
    claims = data.items;
  } catch {
    // Backend not available
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-24">
      <Image src="/logo-mark.svg" alt="Phiacta logo" width={96} height={96} className="mb-6" />
      <h1 className="mb-4 text-center text-5xl font-bold tracking-tight text-gray-900">
        Phiacta
      </h1>
      <p className="mb-2 text-center text-xl text-gray-500">
        The Knowledge Backend
      </p>
      <p className="mb-10 max-w-xl text-center text-base leading-relaxed text-gray-600">
        A structured knowledge platform for science. Browse, search, and
        contribute semantic claims &mdash; assertions, theorems, evidence, and
        proofs &mdash; all linked in a queryable graph.
      </p>
      <div className="w-full max-w-lg">
        <SearchBar />
      </div>

      {claims.length > 0 && (
        <div className="mt-16 w-full max-w-2xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Claims</h2>
          <div className="space-y-3">
            {claims.map((claim) => (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {claim.claim_type}
                  </span>
                  <span
                    className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${
                      claim.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-800">{claim.content}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(claim.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
