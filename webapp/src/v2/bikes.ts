import type { FleetBike } from "../data/types";
import { href } from "../ui/router";

/** The owner's photo of the bike: one per sample bike in public/img/fleet, the live bike has its own. */
export const bikePhoto = (b: FleetBike) => (b.live ? "./img/day/bocconi-park.jpg" : `./img/fleet/${b.key}.jpg`);

/** The live bike has its page; sample bikes have none, so they lead to the finder. */
export const bikeLink = (b: FleetBike) => (b.live && b.objectId !== null ? href(`object/${b.objectId}`) : href("bikes"));
