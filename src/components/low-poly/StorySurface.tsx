import { type PropsWithChildren } from 'react';
import { Paper, type PaperProps } from '@mantine/core';
import classes from './low-poly.module.css';

type StorySurfaceProps = PropsWithChildren<PaperProps & {
  tone?: 'neutral' | 'student' | 'teacher' | 'warm';
}>;

export function StorySurface({
  tone = 'neutral',
  className,
  children,
  ...props
}: StorySurfaceProps) {
  return (
    <Paper
      {...props}
      className={`${classes.surface} ${classes[`surface_${tone}`]} ${className ?? ''}`}
    >
      {children}
    </Paper>
  );
}
