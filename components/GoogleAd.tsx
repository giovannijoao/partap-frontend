import { useEffect } from 'react';

export function GoogleAd({
  adSlot,
}) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE}
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-adtest={process.env.NEXT_PUBLIC_AD_TEST}
      data-full-width-responsive="true"
    />
  );
}