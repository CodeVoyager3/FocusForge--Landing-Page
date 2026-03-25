import { useRef } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';

/**
 * BlurFade – animates children with a blur + translate fade-in when scrolled into view.
 *
 * Props:
 *   children      {node}
 *   className     {string}
 *   duration      {number}  – animation duration in seconds (default 0.5)
 *   delay         {number}  – delay in seconds (default 0)
 *   offset        {number}  – translate offset in px (default 8)
 *   direction     {string}  – "up" | "down" | "left" | "right" (default "up")
 *   inView        {boolean} – only trigger when in viewport (default true)
 *   inViewMargin  {string}  – viewport margin (default "-50px")
 *   blur          {string}  – blur amount (default "10px")
 */
export function BlurFade({
  children,
  className = '',
  duration = 0.5,
  delay = 0,
  offset = 8,
  direction = 'up',
  inView = true,
  inViewMargin = '-50px',
  blur = '10px',
  ...props
}) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isVisible = !inView || inViewResult;

  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const sign = direction === 'right' || direction === 'down' ? -1 : 1;

  const variants = {
    hidden: {
      [axis]: sign * offset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: {
      [axis]: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        exit="hidden"
        variants={variants}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: 'easeOut',
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
