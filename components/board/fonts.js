import { Barlow_Condensed, Courier_Prime, Permanent_Marker } from 'next/font/google';

// Three faces, each an object on the board: the typewriter that typed the
// evidence (Courier Prime), the marker that wrote on it (Permanent Marker) and
// the label maker that embossed the tape (Barlow Condensed). Case Board is the
// default design, so its faces are preloaded.
export const typed = Courier_Prime({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], display: 'swap', variable: '--font-board-typed' });
export const marker = Permanent_Marker({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-board-marker' });
export const tape = Barlow_Condensed({ subsets: ['latin'], weight: ['600'], display: 'swap', variable: '--font-board-tape' });
