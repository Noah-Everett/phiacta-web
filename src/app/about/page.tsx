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
          is to build a structured, machine-readable knowledge backend for
          science: a platform where scientific claims are navigable, verifiable,
          and interconnected.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          By making the web of scientific knowledge explicit and explorable, we
          aim to accelerate discovery, improve reproducibility, and give
          researchers, educators, and the public a clearer picture of what
          science actually knows.
        </p>
      </section>
    </div>
  );
}
