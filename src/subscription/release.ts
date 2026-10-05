/**
 * RELEASE SWITCHES for what a store build offers. Billing is not connected yet (the store SDK is not in
 * the project), so both are OFF: a family must never meet a lock it cannot open, a price it cannot pay,
 * or a plan switch that grants Plus for free. Turning these on is only safe once real billing exists.
 */

/** When false, every practice area is open to everyone and no Plus or Subscription screen is reachable. */
export const PLUS_GATING_ENABLED = false;

/** When false, the Rewards Shop sells with stars only: no Premium category, cash offers or Restore purchases. */
export const CASH_PURCHASES_ENABLED = false;
