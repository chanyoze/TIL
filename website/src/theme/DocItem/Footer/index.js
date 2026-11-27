import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

// 각 문서 하단에 "이 페이지의 원본 md 파일 경로"를 작게 표기한다.
// metadata.source 예: "@site/../vault/회사/종료/.../파일.md" → "vault/회사/종료/.../파일.md"
export default function FooterWrapper(props) {
  const {metadata} = useDoc();
  const source = (metadata?.source || '')
    .replace(/^@site\/\.\.\//, '')
    .replace(/^@site\//, '');

  return (
    <>
      {source && (
        <div className={styles.sourcePath} title={source}>
          <span className={styles.sourceLabel}>📄 원본</span>
          <code className={styles.sourceCode}>{source}</code>
        </div>
      )}
      <Footer {...props} />
    </>
  );
}
