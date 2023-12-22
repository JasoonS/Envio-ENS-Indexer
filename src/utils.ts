import {
  ENSRegistryWithFallbackContract_NewOwnerEvent_eventArgs,
  eventLog
} from "../generated/src/Types.gen";

import keccak256 from "keccak256";

export const ETH_NODE =
  "93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";
export const ROOT_NODE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

export function makeSubnode(
  event: eventLog<ENSRegistryWithFallbackContract_NewOwnerEvent_eventArgs>
): string {
  let node = byteArrayFromHex(event.params.node);
  let label = byteArrayFromHex(event.params.label);
  return keccak256(uint8ArrayToString(concat(node, label))).toString();
}

export function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  let out = new Uint8Array(a.length + b.length);

  out.set(a, 0);
  out.set(b, a.length);

  return out;
}

export function byteArrayFromHex(s: string): Uint8Array {
  if (s.length % 2 !== 0) {
    throw new TypeError("Hex string must have an even number of characters");
  }

  let out = new Uint8Array(s.length / 2);
  for (let i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.substring(i, i + 2), 16);
  }

  return out;
}

// Converts a Uint8Array to a hexadecimal string
export function uint8ArrayToHexString(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function uint8ArrayToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(bytes).toString();
}

export function removeNullBytes(input: string): string {
  return input.replace(/\x00/g, "");
}

export function uint256ToByteArray(i: BigInt): Uint8Array {
  let hex = i
    .toString()
    .slice(2)
    .padStart(64, "0");
  return byteArrayFromHex(hex);
}
