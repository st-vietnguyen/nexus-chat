const SKELETON_ROWS: Array<'own' | 'other'> = [
  'other',
  'other',
  'own',
  'other',
  'own',
  'own',
  'other',
  'own',
];

export const MessageListSkeleton = () => {
  return (
    <ul className="message-list" aria-busy="true" aria-hidden>
      {SKELETON_ROWS.map((side, index) => (
        <li key={index} className={`message-row message-row-${side}`}>
          <div
            className={`message-skeleton message-skeleton-${side} message-skeleton-w${(index % 3) + 1}`}
          />
        </li>
      ))}
    </ul>
  );
};
