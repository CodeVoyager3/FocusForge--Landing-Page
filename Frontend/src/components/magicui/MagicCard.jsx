import { useCallback, useEffect, useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from 'motion/react';

/**
 * MagicCard – a container with a mouse-tracking radial gradient spotlight.
 * Simplified version: no next-themes dependency, always dark mode.
 *
 * Props:
 *   children        {node}
 *   className       {string}  – applied to the outer motion.div
 *   gradientSize    {number}  – size of the radial gradient in px (default 250)
 *   gradientColor   {string}  – spotlight color (default rgba(34,197,94,0.15))
 *   gradientOpacity {number}  – overlay opacity multiplier (default 0.8)
 *   gradientFrom    {string}  – border gradient from color (default #22c55e)
 *   gradientTo      {string}  – border gradient to color (default #052e16)
 */
export function MagicCard({
  children,
  className = '',
  gradientSize = 250,
  gradientColor = 'rgba(34, 197, 94, 0.15)',
  gradientOpacity = 0.8,
  gradientFrom = '#22c55e',
  gradientTo = '#052e16',
}) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handlePointerMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  useEffect(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  const borderBg = useMotionTemplate`
    linear-gradient(var(--color-surface-container) 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      rgba(255,255,255,0.08) 100%
    ) border-box
  `;

  const spotlightBg = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 100%
    )
  `;

  return (
    <motion.div
      className={`group relative isolate overflow-hidden rounded-[inherit] border border-transparent ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ background: borderBg }}
    >
      {/* base surface */}
      <div className="absolute inset-px z-20 rounded-[inherit] bg-surface-container" />

      {/* spotlight overlay */}
      <motion.div
        className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: spotlightBg,
          opacity: gradientOpacity,
        }}
      />

      <div className="relative z-40">{children}</div>
    </motion.div>
  );
}
