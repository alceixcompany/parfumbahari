'use client';

export default function ProductError({ reset }: { reset: () => void }) {
  return <section className="admin-panel admin-empty" role="alert"><h1>Ürünler yüklenemedi.</h1><p>Bağlantınızı kontrol edip listeyi yeniden açın.</p><button className="admin-button" onClick={reset}>Yeniden dene</button></section>;
}
