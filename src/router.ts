import { useEffect, useState } from 'react';

/**
 * Küçük hash yönlendirici. Galeri sayfaları `#proje-<slug>` adresinde açılır;
 * böylece tarayıcının geri tuşu ve linkler sunucu ayarı gerektirmeden çalışır.
 */
export const GALLERY_PREFIX = '#proje-';

/** Galeriye girerken ana sayfadaki scroll konumu; geri dönünce buraya inilir */
export const returnState = { y: 0, fromPage: false };

export function openGallery(slug: string) {
  returnState.y = window.scrollY;
  returnState.fromPage = true;
  window.location.hash = `${GALLERY_PREFIX.slice(1)}${slug}`;
}

export function closeGallery() {
  if (returnState.fromPage) {
    window.history.back();
  } else {
    // galeriye doğrudan link ile gelindiyse projeler bölümüne dön
    returnState.y = -1;
    window.location.hash = 'projeler';
  }
}

export function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}
