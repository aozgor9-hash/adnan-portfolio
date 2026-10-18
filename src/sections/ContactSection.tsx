import { Check, Copy, Mail, Phone } from 'lucide-react';
import { useRef, useState } from 'react';
import { ContactButton } from '../components/Buttons';
import FadeIn from '../components/FadeIn';
import { contact, site } from '../data/content';

type Row = { id: string; label: string; value: string; href: string; Icon: typeof Mail };

const rows: Row[] = [
  { id: 'email', label: 'E-posta', value: contact.email, href: `mailto:${contact.email}`, Icon: Mail },
  { id: 'phone', label: 'Telefon', value: contact.phone, href: `tel:${contact.phoneIntl}`, Icon: Phone },
];

function ContactRow({ row }: { row: Row }) {
  const [copied, setCopied] = useState(false);
  const valueRef = useRef<HTMLAnchorElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(row.value);
    } catch {
      // pano izni yoksa metni seç, ziyaretçi kendisi kopyalasın
      const el = valueRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col gap-3 border-t border-[#D7E2EA]/15 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:py-8">
      <div className="flex min-w-0 items-center gap-4 sm:gap-6">
        <row.Icon className="h-5 w-5 shrink-0 text-[#D7E2EA]/50 sm:h-6 sm:w-6" strokeWidth={1.75} aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-light uppercase tracking-[0.2em] text-[#D7E2EA]/50">{row.label}</span>
          <a
            ref={valueRef}
            href={row.href}
            className="break-all font-medium text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 focus-visible:opacity-70 tabular-nums"
            style={{ fontSize: 'clamp(1.25rem, 3.2vw, 2.6rem)' }}
          >
            {row.value}
          </a>
        </div>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`${row.label} kopyala`}
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border-2 border-[#D7E2EA] px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 focus-visible:bg-[#D7E2EA]/10 sm:self-auto sm:text-sm"
      >
        {copied ? <Check className="h-4 w-4" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
        <span aria-live="polite">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
      </button>
    </div>
  );
}

export default function ContactSection() {
  return (
    <footer id="iletisim" className="flex flex-col items-center gap-10 px-5 pb-12 pt-24 sm:px-8 md:gap-14 md:px-10 md:pt-32">
      <FadeIn y={40}>
        <h2
          className="hero-heading text-center font-black uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          İletişim
        </h2>
      </FadeIn>
      <FadeIn delay={0.1} y={20}>
        <p
          className="max-w-[520px] text-center font-light leading-relaxed text-[#D7E2EA]/80"
          style={{ fontSize: 'clamp(1rem, 1.8vw, 1.25rem)' }}
        >
          Yeni bir marka, arayüz ya da 3D proje için birlikte çalışalım.
        </p>
      </FadeIn>
      <FadeIn delay={0.2} y={20} className="w-full max-w-4xl border-b border-[#D7E2EA]/15">
        {rows.map((r) => (
          <ContactRow key={r.id} row={r} />
        ))}
      </FadeIn>
      <FadeIn delay={0.3} y={20}>
        <ContactButton label="Projeni Anlat" href={`mailto:${contact.email}`} />
      </FadeIn>
      <p className="mt-10 text-xs font-light uppercase tracking-[0.2em] text-[#646973]">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
