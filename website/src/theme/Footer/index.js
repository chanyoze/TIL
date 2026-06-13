import React, {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import styles from './styles.module.css';

function FooterLink({item}) {
  const {label, to, href, ...props} = item;
  const target = href ?? to;
  const external = !!href;
  return (
    <Link
      className={styles.link}
      {...(external ? {href} : {to})}
      {...props}>
      {label}
      {external && <span className={styles.ext} aria-hidden="true"> ↗</span>}
    </Link>
  );
}

export default function Footer() {
  const {footer} = useThemeConfig();
  const [open, setOpen] = useState(false);

  if (!footer) {
    return null;
  }
  const {links = [], copyright} = footer;

  return (
    <div className={styles.root} data-footer-root>
      <div className={styles.toggleRow}>
        <button
          type="button"
          className={clsx(styles.toggle, open && styles.toggleOpen)}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}>
          <span className={styles.caret} aria-hidden="true">{open ? '▾' : '▴'}</span>
          {open ? '닫기' : '사이트 정보'}
        </button>
      </div>

      <footer className={clsx(styles.footer, open && styles.footerOpen)}>
        <div className={styles.inner}>
          <div className={styles.brand}>
            <div className={styles.brandTitle}>🗓️ 이찬호 노트</div>
            <p className={styles.brandTag}>흩어진 배움을 한곳에 — 매일의 기술 기록</p>
          </div>

          <div className={styles.cols}>
            {links.map((col, i) => (
              <div key={i} className={styles.col}>
                {col.title && <div className={styles.colTitle}>{col.title}</div>}
                <ul className={styles.colList}>
                  {(col.items ?? []).map((item, j) => (
                    <li key={j}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {copyright && (
          <div
            className={styles.copyright}
            dangerouslySetInnerHTML={{__html: copyright}}
          />
        )}
      </footer>
    </div>
  );
}
