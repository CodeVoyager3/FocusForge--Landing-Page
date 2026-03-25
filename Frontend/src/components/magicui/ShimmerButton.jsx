import React from 'react';

/**
 * ShimmerButton – a button with an animated shimmer perimeter light.
 * Uses CSS custom properties + @keyframes defined in index.css.
 *
 * Props:
 *   shimmerColor    {string}  – shimmer light color (default rgba(255,255,255,0.4))
 *   shimmerSize     {string}  – css cut size (default "0.05em")
 *   shimmerDuration {string}  – animation duration (default "3s")
 *   borderRadius    {string}  – border radius (default "9999px")
 *   background      {string}  – button background (default "#22c55e")
 *   className       {string}  – extra class names
 *   children        {node}
 */
export const ShimmerButton = React.forwardRef(
  (
    {
      shimmerColor = 'rgba(255,255,255,0.4)',
      shimmerSize = '0.05em',
      shimmerDuration = '3s',
      borderRadius = '9999px',
      background = '#22c55e',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        style={{
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        }}
        className={[
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap',
          'border border-white/10 text-on-primary',
          '[border-radius:var(--radius)] [background:var(--bg)]',
          'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
          className,
        ].join(' ')}
        {...props}
      >
        {/* spark container */}
        <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible">
          <div className="shimmer-slide absolute inset-0 aspect-square h-full rounded-none">
            <div className="spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>

        {children}

        {/* Highlight */}
        <div
          className={[
            'absolute inset-0 size-full rounded-2xl px-4 py-1.5',
            'shadow-[inset_0_-8px_10px_#ffffff1f]',
            'transform-gpu transition-all duration-300 ease-in-out',
            'group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]',
            'group-active:shadow-[inset_0_-10px_10px_#ffffff3f]',
          ].join(' ')}
        />

        {/* backdrop */}
        <div className="absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]" />
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
