declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': import('react').DetailedHTMLProps<import('react').HTMLAttributes<HTMLElement> & {
        src: string;
        speed?: string;
        autoplay?: boolean;
        loop?: boolean;
      }, HTMLElement>;
    }
  }
}

export {};
