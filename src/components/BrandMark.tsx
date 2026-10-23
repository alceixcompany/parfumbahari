import Image from 'next/image';
export default function BrandMark({ compact = false }: { compact?: boolean; dark?: boolean }) {
  return <span className={`brand-mark ${compact ? 'compact' : ''}`}><Image src="/parfum-bahari/logo.png" alt="" width={52} height={52} className="brand-emblem" /><span className="brand-wordmark"><strong>Parfum Bahari</strong><small>BİR KOKU. BİNBİR HİS.</small></span></span>;
}
