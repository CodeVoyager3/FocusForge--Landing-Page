import { motion } from 'motion/react';

/**
 * BorderBeam – a glowing beam that travels around the border of the parent.
 * Parent must have: position: relative; overflow: hidden; border-radius set.
 *
 * Props:
 *   size          {number}  – beam square size in px (default 50)
 *   duration      {number}  – animation duration in seconds (default 6)
 *   delay         {number}  – animation delay in seconds (default 0)
 *   colorFrom     {string}  – start color (default #22c55e)
 *   colorTo       {string}  – end color (default #4ade80)
 *   reverse       {boolean} – reverse direction (default false)
 *   initialOffset {number}  – starting offset 0-100 (default 0)
 *   borderWidth   {number}  – border width in px (default 1)
 *   className     {string}  – extra class names
 */
export function BorderBeam({
  className = '',
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = '#22c55e',
  colorTo = '#4ade80',
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent"
      style={{
        borderWidth: `${borderWidth}px`,
        borderStyle: 'solid',
        WebkitMask:
          'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
        mask: 'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
        WebkitMaskComposite: 'destination-in',
        maskComposite: 'intersect',
        WebkitMaskClip: 'padding-box, border-box',
        maskClip: 'padding-box, border-box',
      }}
    >
      <motion.div
        className={`absolute aspect-square ${className}`}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
          delay: -delay,
        }}
      />
    </div>
  );
}
