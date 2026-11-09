import Image from 'next/image';

export default function BrandMark({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return <span className={`brand-mark${compact ? ' compact' : ''}${dark ? ' brand-mark-dark' : ''}`}>
    <Image className="brand-logo" src="/parfum-bahari/logo-horizontal-v2.png" width={2172} height={724} sizes="(max-width: 760px) 210px, 260px" alt="Parfum Bahari" />
  </span>;
}
