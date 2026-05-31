import PersonIcon from '@assets/icons/ic-person.svg?react';

interface AvatarProps {
  url?: string | null;
  alt?: string;
}

export const Avatar = ({ url, alt = '' }: AvatarProps) => {
  if (url) {
    return <img src={url} alt={alt} />;
  }
  return <PersonIcon />;
};
