export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">Phiacta</p>
            <p className="text-xs text-muted-foreground">The knowledge backend.</p>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <a href="mailto:contact@phiacta.com" className="hover:text-foreground transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
