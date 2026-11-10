'use client';

export default function ContentError({ reset }: { reset: () => void }) {
  return <main id="main" className="container section"><h1>İçerikler şu anda yüklenemiyor.</h1><p style={{ marginBlock: 24 }}>Lütfen biraz sonra tekrar deneyin.</p><button className="button" onClick={reset}>Yeniden dene</button></main>;
}
