# Adnan Özgör — Portfolyo

React + TypeScript + Tailwind CSS + Framer Motion + Three.js ile hazırlanmış portfolyo sayfası.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # yayın için dist/ klasörü
```

## Neyi nereden değiştiririm?

| Ne | Dosya |
| --- | --- |
| İsim, başlık, hakkımda metni, hizmetler, e-posta ve telefon, yörüngedeki programlar | `src/data/content.ts` |
| Projeler: kart görselleri ve galeri sırası | `src/data/projects.ts` |
| Proje görselleri ve videoları | `public/projects/<proje>/` |
| Marquee görselleri, Hakkımda köşe objeleri | `src/data/assets.ts` |
| 3D yüz efekti (hologram, glitch, zamanlama) | `src/components/FaceScene.ts` |
| Portre arkasındaki RGB ışık | `src/components/AmbientGlow.tsx`, `src/index.css` |
| Portre etrafındaki yörünge | `src/components/SkillOrbit.tsx` |

## Projeler

Projeler GÖRSELLER klasöründeki dört klasörden geliyor: Abant Su, CGI Animasyon, Kreatif İçerik, UI/UX Tasarım. Görseller web için küçültülüp `public/projects/` altına numaralı olarak kondu (WebP, videolar 720p MP4 ve kapak kareleri).

Yeni bir iş eklemek için dosyayı ilgili klasöre koy ve `src/data/projects.ts` içindeki o projenin `media` listesine sırayla yaz. Galeri sayfası bu sırayı soldan sağa izler, görselleri kırpmaz. Kartta görünen üç görsel `cover` alanında.

“Projeyi İncele” butonu galeri sayfasını açar; “Geri Dön” (veya tarayıcının geri tuşu / Esc) projelerde kaldığın yere döndürür. Galerideki videolar sessiz başlar; ses açılınca arka plan müziği susar.

## Yörüngedeki programlar

Portrenin etrafında After Effects, Premiere Pro, Blender, Figma, Illustrator ve Photoshop döner; arkaya geçenler yüzün arkasında kalır. Resmî ikonları kullanmak istersen ikon dosyalarını `public/icons/` klasörüne koy ve `src/data/content.ts` içindeki `tools` listesinde `icon: 'icons/figma.svg'` gibi yaz.

## Müzik (Bonobo — Kerala)

Müzik çalarken portrenin arkasındaki RGB ışık basla birlikte nefes alır.

`public/music/` klasörüne parçayı **kerala.mp3** adıyla koy. Sağ kenardaki müzik butonuna basınca döngüde, yumuşak bir girişle çalar; tekrar basınca kısılarak durur. Tarayıcılar sesi ziyaretçi tıklamadan başlatmaya izin vermediği için müzik otomatik başlamaz.

Parça telifli; siteyi herkese açık yayınlayacaksan kullanım izni alman gerekir. Başka bir dosya kullanmak istersen `src/data/content.ts` içindeki `music` alanını değiştir.

## 3D yüz nasıl çalışıyor?

Fotoğraftan arka plan maskesi (ISNet) ve derinlik haritası (Depth Anything V2) çıkarıldı. `FaceScene.ts` bu ikisiyle kabartmalı bir 3D yüz kurar ve hero bölümü sabitken yapılan scroll'a göre:

1. Yukarıdan aşağı bir tarama çizgisiyle fotoğrafı mavi, düğümlü bir hologram iskelete çevirir,
2. İskelet bir süre ekranda kalır, sonra RGB glitch ile titreyip parça parça, yavaşça yok olur,
3. Yukarı kaydırınca aynı yolu geri oynatıp yüzü yeniden oluşturur.

Fare hareketiyle yüz hafifçe döner (Magnet efekti + 3D eğim). WebGL yoksa normal fotoğraf gösterilir.
