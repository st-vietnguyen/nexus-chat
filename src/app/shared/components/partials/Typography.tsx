import type { ElementType, ReactNode } from 'react';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body-lg'
  | 'body-md'
  | 'body-sm'
  | 'label-md';

export type TypographyColor =
  | 'primary'
  | 'primary-dark'
  | 'secondary'
  | 'accent'
  | 'danger'
  | 'danger-text'
  | 'warning'
  | 'success'
  | 'text-primary'
  | 'text-secondary'
  | 'text-muted'
  | 'black'
  | 'white'
  | 'gradient';

export type TypographyAlign = 'left' | 'center' | 'right';

interface TypographyProps {
  variant?: TypographyVariant;
  as?: ElementType;
  color?: TypographyColor;
  align?: TypographyAlign;
  className?: string;
  id?: string;
  children: ReactNode;
}

const defaultTag: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
  'label-md': 'span',
};

export const Typography = ({
  variant = 'body-md',
  as,
  color,
  align,
  className = '',
  id,
  children,
}: TypographyProps) => {
  const Tag = as ?? defaultTag[variant];

  const classes = [
    'typography',
    `typography-${variant}`,
    color && `typography-color-${color}`,
    align && `typography-align-${align}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag id={id} className={classes}>
      {children}
    </Tag>
  );
};
