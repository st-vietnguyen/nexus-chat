interface RoomItemSkeletonProps {
  asListItem?: boolean;
}

const SkeletonBody = () => (
  <div className="room-item room-item-skeleton" aria-hidden="true">
    <div className="room-item-avatar-wrap">
      <div className="room-item-avatar">
        <span className="avatar-skeleton" />
      </div>
    </div>
    <div className="room-item-body">
      <div className="room-item-row">
        <span className="skeleton-line skeleton-line-w1" />
        <span className="skeleton-line skeleton-line-w3" />
      </div>
      <div className="room-item-row">
        <span className="skeleton-line skeleton-line-w2" />
      </div>
    </div>
  </div>
);

export const RoomItemSkeleton = ({
  asListItem = true,
}: RoomItemSkeletonProps) => {
  if (!asListItem) return <SkeletonBody />;
  return (
    <li>
      <SkeletonBody />
    </li>
  );
};
