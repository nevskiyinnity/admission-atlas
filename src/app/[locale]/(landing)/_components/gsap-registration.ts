import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

// Register all plugins once. ES module singleton guarantees single execution.
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// Re-export for convenience — islands import from here instead of 'gsap' directly
export { gsap, ScrollTrigger, SplitText };
