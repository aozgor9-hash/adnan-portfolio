// Sitedeki tüm metinler tek yerde. İsim, unvan veya iletişim bilgisini buradan değiştir.

export const site = {
  name: 'Adnan Özgör',
  firstName: 'Adnan',
  heroHeading: 'Merhaba',
  heroTagline: 'UI/UX, 3D ve grafik tasarımda çarpıcı ve akılda kalan işler üreten bir tasarımcı',
  about:
    'UI/UX, 3D tasarım ve grafik tasarım alanlarında çalışan, Adobe Creative Cloud uygulamalarına hâkim yaratıcı bir tasarımcıyım. Estetik ve işlevselliği bir araya getirerek özgün, yenilikçi ve kullanıcı odaklı tasarımlar üretiyorum. Kaya Holding’de geçirdiğim 3 yılda Abant Su, Kaya Hotels ve Palazzo Hotels markalarına hizmet verdim.',
};

export const navLinks = [
  { label: 'Hakkımda', href: '#hakkimda' },
  { label: 'Hizmetler', href: '#hizmetler' },
  { label: 'Projeler', href: '#projeler' },
  { label: 'İletişim', href: '#iletisim' },
];

export const services = [
  {
    no: '01',
    name: 'Grafik Tasarım',
    text: 'Kampanya, basılı materyal, ambalaj ve sosyal medya için markanın diline uygun, dikkat çeken görsel işler.',
  },
  {
    no: '02',
    name: 'UI/UX Tasarım',
    text: 'Kullanıcı akışından wireframe ve prototipe; sade, anlaşılır ve kullanıcıyı hedefe taşıyan arayüzler.',
  },
  {
    no: '03',
    name: '3D Tasarım',
    text: 'Ürün görselleştirme, obje ve sahne modelleme; ışık, doku ve malzemeyle gerçekçi renderlar.',
  },
  {
    no: '04',
    name: 'Marka Kimliği',
    text: 'Logodan bütün marka sistemine kadar tutarlı, akılda kalan ve markayı doğru anlatan kimlikler.',
  },
  {
    no: '05',
    name: 'Motion & Dijital',
    text: 'Hareketli grafikler ve kısa animasyonlarla markaya enerji katan dijital içerikler.',
  },
];

/**
 * Portrenin etrafındaki yörüngede dönen programlar.
 * Resmî ikonlarını kullanmak istersen dosyayı `public/icons/` klasörüne koyup
 * `icon` alanına yolunu yaz, örn. icon: 'icons/figma.svg'. Boş olanlarda isim gösterilir.
 */
export const tools: { name: string; icon?: string }[] = [
  { name: 'After Effects' },
  { name: 'Premiere Pro' },
  { name: 'Blender' },
  { name: 'Figma' },
  { name: 'Illustrator' },
  { name: 'Photoshop' },
];

/**
 * Arka plan müziği: `public/music/muzik.mp3` (telifsiz parça).
 * Ziyaretçi sağdaki müzik butonuna basınca döngüde çalar.
 * Parçayı değiştirmek için dosyayı aynı adla değiştirmen yeterli.
 * `artist` doluysa butonun üstünde "Sanatçı — Parça" olarak görünür.
 */
export const music: { src: string; title: string; artist?: string } = {
  src: 'music/MUSIC.mp3',
  title: 'Arka plan müziği',
};

/** İletişim bilgileri */
export const contact = {
  email: 'aozgor9@gmail.com',
  phone: '0507 988 84 01',
  /** Uluslararası biçim: tel: bağlantısı için */
  phoneIntl: '+905079888401',
};

/** Görsel yoksa marquee karolarında kullanılan kelimeler */
export const marqueeWords = [
  'Marka Kimliği', 'UI / UX', '3D Render', 'Abant Su', 'Ambalaj', 'Kampanya', 'Sosyal Medya',
  'Tipografi', 'Kaya Hotels', 'Arayüz', 'Motion', 'Afiş', 'Logo', 'Prototip',
  'Palazzo Hotels', 'Katalog', 'Web', 'İllüstrasyon', 'Ürün Görseli', 'İkon Seti', 'Mockup',
];
