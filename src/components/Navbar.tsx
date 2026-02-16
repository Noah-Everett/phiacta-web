import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            Phiacta
          </Link>
          <div className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/search" className="text-gray-600 hover:text-gray-900">
              Search
            </Link>
            <Link href="/explore" className="text-gray-600 hover:text-gray-900">
              Explore
            </Link>
            <Link href="/contribute" className="text-gray-600 hover:text-gray-900">
              Contribute
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden w-64 sm:block">
            <SearchBar compact />
          </div>
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
