import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">About Phiacta</h1>
      <p className="mb-10 text-sm text-gray-500">
        Structured, well-formed facts for science.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900">The Name</h2>
        <p className="text-gray-600 leading-relaxed">
          <strong>Phiacta</strong> is a blend of two roots:{" "}
          <strong>phi</strong> (φ), the Greek letter representing the golden
          ratio and used throughout mathematics and science, and{" "}
          <strong>facta</strong>, the Latin word for &ldquo;things done&rdquo; or
          &ldquo;things made&rdquo;&mdash;the origin of the English word
          &ldquo;fact.&rdquo; Together the name captures the idea of structured,
          well-formed facts: knowledge shaped with the same elegance and
          precision that φ embodies.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900">
          Vision &amp; Mission
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Science produces an enormous volume of claims, results, and
          relationships&mdash;yet most of this knowledge remains locked inside
          unstructured PDFs and prose. Phiacta exists to change that. Our goal
          is to build the most general and future-proof knowledge backend
          possible: a database designed from the ground up to store, version, and
          serve structured information through interfaces that are as general as
          the data they expose.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          At its core, Phiacta is a general-purpose database&mdash;not a
          knowledge graph, not a document store, but a carefully designed system
          that can support any of those paradigms through composable{" "}
          <strong>layers</strong> and <strong>extensions</strong>. A graph layer
          can interpret relationships between claims. A confidence layer can
          aggregate peer reviews into epistemic status. New layers can be added
          without touching the core schema, and existing ones can be swapped or
          removed to suit different communities and use cases.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          By making the web of scientific knowledge explicit and explorable, we
          aim to accelerate discovery, improve reproducibility, and give
          researchers, educators, and the public a clearer picture of what
          science actually knows. To learn more about how the system is
          designed, see the{" "}
          <Link href="/architecture" className="text-gray-900 underline hover:text-gray-600">
            Architecture
          </Link>{" "}
          page.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900">
          Contact &amp; Community
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Phiacta is open source. You can find the code, report issues, and
          contribute on{" "}
          <a
            href="https://github.com/phiacta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 underline hover:text-gray-600"
          >
            GitHub
          </a>
          .
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          For questions, feedback, or collaboration inquiries, reach out at{" "}
          <a
            href="mailto:contact@phiacta.com"
            className="text-gray-900 underline hover:text-gray-600"
          >
            contact@phiacta.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
