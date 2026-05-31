export const ChatRoomHeaderSkeleton = () => (
  <header className="chat-room-header" aria-hidden="true">
    <div className="chat-room-header-avatar">
      <span className="avatar-skeleton" />
    </div>
    <div className="chat-room-header-body">
      <span className="skeleton-line skeleton-line-lg skeleton-line-w2" />
      <span className="skeleton-line skeleton-line-w3" />
    </div>
  </header>
);
