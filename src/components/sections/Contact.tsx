import { SectionFade } from '../layout/SectionFade';

const EMAIL = 'pannya6978@gmail.com';

const socials = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/yuuki69783/?hl=ja',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com/pannyaonigiri',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/tannno-shouta',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
];

export function Contact() {
  return (
    <SectionFade
      as="section"
      id="contact"
      style={{
        position: 'relative',
        padding: '12rem 1.5rem 4rem',
        maxWidth: '1180px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      {/* セクション番号 */}
      <div
        style={{
          fontFamily: 'var(--font-en-body)',
          fontStyle: 'italic',
          fontSize: '0.78rem',
          letterSpacing: '0.5em',
          color: 'rgba(200,155,255,0.65)',
          textTransform: 'uppercase',
          textShadow: '0 0 10px rgba(139,61,240,0.45)',
        }}
      >
        · 04 ·
      </div>
      {/* 大見出し */}
      <h2
        style={{
          marginTop: '0.6rem',
          fontFamily: 'var(--font-en-head)',
          fontWeight: 900,
          fontSize: 'clamp(2.4rem, 6vw, 4rem)',
          letterSpacing: '0.22em',
          color: 'var(--bone)',
          textTransform: 'uppercase',
          textShadow:
            '0 0 30px rgba(200,155,255,0.5), 0 0 60px rgba(139,61,240,0.3)',
          lineHeight: 1.1,
        }}
      >
        CONTACT
      </h2>
      <div
        style={{
          marginTop: '0.4rem',
          fontFamily: 'var(--font-en-body)',
          fontStyle: 'italic',
          fontSize: 'clamp(0.85rem, 1.6vw, 1.05rem)',
          color: 'var(--violet-glow)',
          letterSpacing: '0.18em',
        }}
      >
        Let’s create something
      </div>

      {/* 装飾の縦線 */}
      <div
        aria-hidden
        style={{
          margin: '2.4rem auto 3.2rem',
          width: '1px',
          height: '64px',
          background:
            'linear-gradient(180deg, rgba(200,155,255,0.7), rgba(200,155,255,0))',
        }}
      />

      {/* メール */}
      <a
        href={`mailto:${EMAIL}`}
        className="contact-email"
        aria-label={`Send mail to ${EMAIL}`}
      >
        {EMAIL}
      </a>

      {/* SNS アイコン */}
      <div className="contact-socials">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.name}
            className="contact-social-link"
          >
            {s.icon}
          </a>
        ))}
      </div>

      {/* 装飾の細線 */}
      <div
        aria-hidden
        style={{
          margin: '5rem auto 1.4rem',
          width: '40%',
          maxWidth: '320px',
          height: '1px',
          background:
            'linear-gradient(90deg, rgba(200,155,255,0), rgba(200,155,255,0.6), rgba(200,155,255,0))',
        }}
      />

      {/* コピーライト */}
      <div
        style={{
          fontFamily: 'var(--font-en-body)',
          fontStyle: 'italic',
          fontSize: '0.72rem',
          letterSpacing: '0.4em',
          color: 'rgba(200,155,255,0.45)',
          textTransform: 'uppercase',
        }}
      >
        © 2026 TANNO SHOTA — All rights reserved
      </div>
    </SectionFade>
  );
}
