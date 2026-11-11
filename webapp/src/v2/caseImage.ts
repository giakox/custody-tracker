// Moved from src/components/ObjectImage.tsx (lotto 5), unchanged: the picture of the demo bike.
/**
 * Slot for the picture of the object: the render of Edoardo's 3D case today, a photo of the real
 * object later. Put the file in public/media/ and set CASE_IMAGE; until then the line drawing stands in.
 * The glow sits under the image and carries the state (blue at rest, orange with a shock).
 */
export const CASE_IMAGE: { src: string; alt: string } | null = { src: "./img/day/bocconi-park.jpg", alt: "The demo bike, parked by a railing outside Bocconi, people walking past" };
