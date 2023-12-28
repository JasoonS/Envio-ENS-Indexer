import {
  ENSRegistryWithFallback_NewOwner_createMockEvent,
  ENSRegistryWithFallback_NewOwner_processEvent,
  MockDb
} from "../../generated/src/TestHelpers.gen";
import { Addresses } from "../../generated/src/bindings/Ethers.gen";
import { it } from "node:test";
import { AccountEntity, DomainEntity } from "../../generated/src/Types.gen";
import assert from "assert";
import { mockNameRegistered } from "./nameRegistered.spec";

it("test SubDomain Creation Success", () => {
  // Initializing the mock database
  const mockDbInitial = MockDb.createMockDb();

  // Initializing values for mock event
  const nameRegisteredMockDb = mockNameRegistered(mockDbInitial);

  const mockNewOwnerEvent = ENSRegistryWithFallback_NewOwner_createMockEvent({
    node: "0x000447a4d61a90d054b5e101f3c94c5c8819b7840e5a5442e07a21bc1c8c30b8",
    label: "0x6bc67ae9b64c1f7ee4133c8c6ab43ec6b2c3bba0509b6cd95f2c88a0da91fe21",
    owner: Addresses.defaultAddress
  });

  // Processing the mock event on the mock database
  const updatedMockDb = ENSRegistryWithFallback_NewOwner_processEvent({
    event: mockNewOwnerEvent,
    mockDb: nameRegisteredMockDb
  });

  // Expected entity that should be created
  const exAccountEntity: AccountEntity = { id: Addresses.defaultAddress };

  const exNameRegisteredEntity = <DomainEntity>{
    id: "0xfe249fe2dc089c4f2b43756b49c3c329774a0b99dea3e1c3e56ce6ab093f16a5",
    ttl: BigInt(0),
    owner: Addresses.defaultAddress,
    srcAddress: mockNewOwnerEvent.srcAddress,
    subdomainCount: 0,
    blockTimestamp: mockNewOwnerEvent.blockTimestamp,
    label: mockNewOwnerEvent.params.label,
    resolver: null
  };

  // Getting the entity from the mock database
  const domEntity = updatedMockDb.entities.Domain.get(
    "0xfe249fe2dc089c4f2b43756b49c3c329774a0b99dea3e1c3e56ce6ab093f16a5"
  );

  // TODO Check Parent SubdomainCount is 1
  // TODO Reverse Lookups on Account for Domains?
  // TODO Reverse Lookups on Account for Domains?

  // Asserting that the entity in the mock database is the same as the ex entity
  assert.deepEqual(exNameRegisteredEntity, domEntity);
});

//test SubDomain create
