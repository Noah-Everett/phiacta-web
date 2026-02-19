import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import NavbarAuth from "./NavbarAuth";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image src="/logo-navbar.svg" alt="Phiacta" width={142} height={60} className="h-8 w-auto" />
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
            <Link href="/architecture" className="text-gray-600 hover:text-gray-900">
              Architecture
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden w-64 sm:block">
            <SearchBar compact />
          </div>
          <NavbarAuth />
        </div>
      </div>
    </nav>
  );
}
