import { createActorWithConfig } from "../config";

let _anonActor: any = null;

/**
 * Returns a cached backend actor with anonymous identity.
 * Used for playerLogin and playerPlay* calls (no II needed).
 */
export async function getAnonActor(): Promise<any> {
  if (!_anonActor) {
    _anonActor = await createActorWithConfig();
  }
  return _anonActor;
}

export function resetAnonActor() {
  _anonActor = null;
}
