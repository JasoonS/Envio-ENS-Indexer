import {keccak_256} from "js-sha3";

export const GRACE_PERIOD_SECONDS = BigInt(7776000); // 90 days

export const ETH_NODE =
    "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae";
export const ROOT_NODE =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

export function nameHash(inputName: string): string {
    let node = ROOT_NODE.split("0x")[1];

    const labels = inputName.split(".");

    for (let i = labels.length - 1; i >= 0; i--) {
        const labelSha = keccak_256(labels[i]);
        node = keccak_256(Buffer.from(node + labelSha, "hex"));
    }

    return "0x" + node;
}

export function makeSubnode(eventNode: string, eventLabel: string): string {
    let node = eventNode.split("0x")[1];
    let label = eventLabel.split("0x")[1];

    node = keccak_256(Buffer.from(node + label, "hex"));

    return "0x" + node;
}
