import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">About Phiacta</h1>
      <p className="mb-10 text-sm text-gray-500 dark:text-gray-400">
        Structured, well-formed facts for science.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">The Name</h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          <strong className="dark:text-gray-200">Phiacta</strong> is a blend of two roots:{" "}
          <strong className="dark:text-gray-200">phi</strong> ({"\u03C6"}), the Greek letter representing the golden
          ratio and used throughout mathematics and science, and{" "}
          <strong className="dark:text-gray-200">facta</strong>, the Latin word for &ldquo;things done&rdquo; or
          &ldquo;things made&rdquo;&mdash;the origin of the English word
          &ldquo;fact.&rdquo; Together the name captures the idea of structured,
          well-formed facts: knowledge shaped with the same elegance and
          precision that {"\u03C6"} embodies.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Vision &amp; Mission
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          Science produces an enormous volume of claims, results, and
          relationships&mdash;yet most of this knowledge remains locked inside
          unstructured PDFs and prose. Phiacta exists to change that. Our goal
          is to build the most general and future-proof knowledge backend
          possible: a database designed from the ground up to store, version, and
          serve structured information through interfaces that are as general as
          the data they expose.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          At its core, Phiacta is a general-purpose database&mdash;not a
          knowledge graph, not a document store, but a carefully designed system
          that can support any of those paradigms through composable{" "}
          <strong className="dark:text-gray-200">layers</strong> and <strong className="dark:text-gray-200">extensions</strong>. A graph layer
          can interpret relationships between claims. A confidence layer can
          aggregate peer reviews into epistemic status. New layers can be added
          without touching the core schema, and existing ones can be swapped or
          removed to suit different communities and use cases.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          By making the web of scientific knowledge explicit and explorable, we
          aim to accelerate discovery, improve reproducibility, and give
          researchers, educators, and the public a clearer picture of what
          science actually knows. To learn more about how the system is
          designed, see the{" "}
          <Link href="/architecture" className="text-gray-900 underline hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-400">
            Architecture
          </Link>{" "}
          page.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Contact &amp; Community
        </h2>
        <p className="text-gray-600 leading-relaxed dark:text-gray-400">
          Phiacta is open source. You can find the code, report issues, and
          contribute on{" "}
          <a
            href="https://github.com/phiacta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 underline hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-400"
          >
            GitHub
          </a>
          .
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed dark:text-gray-400">
          For questions, feedback, or collaboration inquiries, reach out at{" "}
          <a
            href="mailto:contact@phiacta.com"
            className="text-gray-900 underline hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-400"
          >
            contact@phiacta.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
