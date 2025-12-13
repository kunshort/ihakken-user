/**
 * Defines the available bubble styles for the AI chat launcher icon.
 */
export type BubbleStyle = 'bordered_bubble' | 'pill' | 'rounded' | 'speech_bubble';

/**
 * A record mapping each launcher icon bubble style to its corresponding Tailwind CSS classes.
 */
export const bubbleStyles: Record<BubbleStyle, string> = {
  // Standard rounded corners
  rounded: 'rounded-2xl',
  // Pill-shaped bubble (circle)
  pill: 'rounded-full',
  // Rounded bubbles with a border
  bordered_bubble: 'rounded-full border-4',
  // Classic speech bubble with a tail
  // Note: This style is complex for a button and may not render perfectly with all icon sizes.
  // It creates a "squircle" shape with a small tail at the bottom right.
  speech_bubble: 'rounded-[1.25rem] relative after:content-[""] after:absolute after:bottom-[-4px] after:right-[10px] after:w-0 after:h-0 after:border-[10px] after:border-solid after:border-transparent after:border-t-inherit after:rotate-45',
};