import { DeviceFigure } from "./DeviceFigure";

/**
 * Slot for the picture of the object: the render of Edoardo's 3D case today, a photo of the real
 * object later. Put the file in public/media/ and set CASE_IMAGE; until then the line drawing stands in.
 * The glow sits under the image and carries the state (blue at rest, orange with a shock).
 */
export const CASE_IMAGE: { src: string; alt: string } | null = { src: "./img/day/bocconi-park.jpg", alt: "The demo bike, parked by a railing outside Bocconi, people walking past" };

export function ObjectImage({ src = CASE_IMAGE?.src, alt = CASE_IMAGE?.alt ?? "", alert = false, deviceId, glow = true }: {
  src?: string; alt?: string; alert?: boolean; deviceId: string; glow?: boolean;
}) {
  return (
    <figure className="object-image">
      {glow && <div className="glow" aria-hidden="true"><i className="glow-blue" /><i className="glow-orange" /><i className="grain" /></div>}
      {src ? <img src={src} alt={alt} /> : <DeviceFigure alert={alert} deviceId={deviceId} />}
    </figure>
  );
}
