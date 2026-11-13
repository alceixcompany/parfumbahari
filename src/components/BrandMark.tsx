import Image from 'next/image';

export default function BrandMark({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return <span className={`brand-mark${compact ? ' compact' : ''}${dark ? ' brand-mark-dark' : ''}`}>
    <Image className="brand-logo" src="/parfum-bahari/logo-gold.png" width={2179} height={721} sizes="(max-width: 350px) 178px, (max-width: 760px) 210px, 260px" alt="Parfüm Baharı — Kokunla İz Bırak" />
  </span>;
}
