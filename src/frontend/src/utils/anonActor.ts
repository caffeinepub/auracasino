import { createActorWithConfig } from "../config";

let _anonActor: any = null;

/**
 * Returns a cached backend actor with anonymous identity.
 * Resets the cache on error so a fresh actor is created on the next call.
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

/**
 * Calls an actor method and automatically resets + retries once on failure.
 * This handles the case where the canister restarts and the cached actor is stale.
 */
export async function callWithRetry(
  fn: (actor: any) => Promise<any>,
): Promise<any> {
  try {
    const actor = await getAnonActor();
    return await fn(actor);
  } catch (_e) {
    // Reset the actor cache so the next call gets a fresh connection
    resetAnonActor();
    // Retry once with a fresh actor
    const actor = await getAnonActor();
    return await fn(actor);
  }
}
