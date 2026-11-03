export default function BrandMark({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return <span className={`brand-mark${compact ? ' compact' : ''}${dark ? ' brand-mark-dark' : ''}`}>
    <svg className="brand-emblem" width="44" height="44" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="46" height="46" rx="7" fill="#632b3c" stroke="#bc929d" />
      <text x="24" y="31.5" fill="#f9f6ef" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="700" letterSpacing="-1">PB</text>
    </svg>
    <span className="brand-wordmark"><strong>Parfum Bahari</strong><small>BİR KOKU. BİNBİR HİS.</small></span>
  </span>;
}
