import { HTMLAttributes } from 'react';

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter?: string;
  subtext?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
}

export function SectionHeading({
  eyebrow,
  titleBefore,
  titleHighlight,
  titleAfter = '',
  subtext,
  align = 'left',
  as: HeadingTag = 'h2',
  className = '',
  ...props
}: SectionHeadingProps) {
  const isCentered = align === 'center';
  const headingSizeClass =
    HeadingTag === 'h1' ? 'text-fluid-display font-extrabold' : 'text-fluid-h2 font-extrabold';

  return (
    <div
      className={[
        'flex flex-col gap-3',
        isCentered ? 'items-center text-center mx-auto max-w-3xl' : 'items-start text-left max-w-3xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div className="inline-flex items-center gap-3">
        <span aria-hidden="true" className="h-0.5 w-7 bg-signal shrink-0" />
        <span className="font-display text-xs font-bold tracking-[0.18em] uppercase text-cloud">
          {eyebrow}
        </span>
      </div>

      <HeadingTag
        className={`${headingSizeClass} font-display uppercase tracking-tight text-cloud leading-[1.06]`}
      >
        {titleBefore}
        <span className="text-signal">{titleHighlight}</span>
        {titleAfter}
      </HeadingTag>

      {subtext && (
        <p className="text-fluid-body-lg text-cloud-muted max-w-2xl leading-relaxed font-normal">
          {subtext}
        </p>
      )}
    </div>
  );
}
