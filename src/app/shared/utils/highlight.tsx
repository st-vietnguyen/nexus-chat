import { Fragment, type ReactNode } from 'react';

export const normalizeKeyword = (keyword: string): string =>
  keyword.trim().toLowerCase();

export const includesKeyword = (
  text: string | null | undefined,
  normalizedKeyword: string,
): boolean => {
  if (!normalizedKeyword) return true;
  if (!text) return false;
  return text.toLowerCase().includes(normalizedKeyword);
};

export const highlightMatches = (
  text: string | null | undefined,
  normalizedKeyword: string,
  className = 'text-highlight',
): ReactNode => {
  if (!text) return '';
  if (!normalizedKeyword) return text;

  const lower = text.toLowerCase();
  const len = normalizedKeyword.length;
  const chunks: ReactNode[] = [];
  let cursor = 0;
  let idx = lower.indexOf(normalizedKeyword, cursor);
  let key = 0;

  while (idx !== -1) {
    if (idx > cursor) {
      chunks.push(
        <Fragment key={`t-${key++}`}>{text.slice(cursor, idx)}</Fragment>,
      );
    }
    chunks.push(
      <mark key={`m-${key++}`} className={className}>
        {text.slice(idx, idx + len)}
      </mark>,
    );
    cursor = idx + len;
    idx = lower.indexOf(normalizedKeyword, cursor);
  }
  if (cursor < text.length) {
    chunks.push(<Fragment key={`t-${key++}`}>{text.slice(cursor)}</Fragment>);
  }
  return <>{chunks}</>;
};
