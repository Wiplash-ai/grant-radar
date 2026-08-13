export default function RadarLoader({ compact = false }: { compact?: boolean }) {
  return <span className={`radar-loader${compact ? " radar-loader-compact" : ""}`} aria-hidden="true">
    <span className="radar-contact radar-contact-alpha" />
    <span className="radar-contact radar-contact-bravo" />
    <span className="radar-contact radar-contact-charlie" />
  </span>;
}
