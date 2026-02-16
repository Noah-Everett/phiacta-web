import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row">
        <p>Phiacta &mdash; The Knowledge Backend</p>
        <div className="flex gap-6">
          <Link href="/search" className="hover:text-gray-700">
            Search
          </Link>
          <Link href="/explore" className="hover:text-gray-700">
            Explore
          </Link>
          <Link href="/contribute" className="hover:text-gray-700">
            Contribute
          </Link>
          <Link href="/architecture" className="hover:text-gray-700">
            Architecture
          </Link>
          <Link href="/about" className="hover:text-gray-700">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
