import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
import { idlFactory } from "../declarations/backend.did";

let _anonActor: any = null;
let _lastError = 0;

export async function getAnonActor(): Promise<any> {
  // Force fresh actor if last error was recent (within 5s)
  if (_anonActor && Date.now() - _lastError < 5000) {
    _anonActor = null;
  }
  if (!_anonActor) {
    const config = await loadConfig();
    const agent = new HttpAgent({
      host: config.backend_host,
    });
    // Only fetch root key on localhost
    if (config.backend_host?.includes("localhost")) {
      await agent.fetchRootKey().catch(console.warn);
    }
    _anonActor = Actor.createActor(idlFactory, {
      agent,
      canisterId: config.backend_canister_id,
    });
  }
  return _anonActor;
}

export function resetAnonActor() {
  _anonActor = null;
}

/**
 * Calls an actor method with automatic retry.
 * Resets + retries up to 2 times on failure (handles canister restart).
 */
export async function callWithRetry(
  fn: (actor: any) => Promise<any>,
  maxRetries = 2,
): Promise<any> {
  let lastErr: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const actor = await getAnonActor();
      return await fn(actor);
    } catch (e: any) {
      lastErr = e;
      _lastError = Date.now();
      resetAnonActor();
      // Wait before retry: 0ms, 500ms, 1000ms
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, attempt * 500));
      }
    }
  }
  throw lastErr;
}
