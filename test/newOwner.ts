import {
  TestHelpers,
  Account,
  Domain
} from "generated";
const { MockDb, Addresses, ENSRegistryWithFallback } = TestHelpers;
// import { Addresses } from "generated/src/bindings/Ethers.gen";
import { expect } from 'chai';
import { mockNameRegistered } from "./nameRegistered";
import { EventFunctions_mockEventData, EventFunctions_MockTransaction_t } from "generated/src/TestHelpers.gen";

it("test SubDomain Creation Success", async () => {
  // Initializing the mock database
  const mockDbInitial = MockDb.createMockDb();

  // Initializing values for mock event
  const nameRegisteredMockDb = await mockNameRegistered(mockDbInitial);

  const mockNewOwnerEvent = ENSRegistryWithFallback.NewOwner.createMockEvent({
    node: "0x000447a4d61a90d054b5e101f3c94c5c8819b7840e5a5442e07a21bc1c8c30b8",
    label: "0x6bc67ae9b64c1f7ee4133c8c6ab43ec6b2c3bba0509b6cd95f2c88a0da91fe21",
    owner: Addresses.defaultAddress,
    mockEventData: {
      block: {
        number: 1,
        hash: "0x1",
        timestamp: 1,
      },
      transaction: {
        hash: "0xa",
        transactionIndex: 0,
      },
      logIndex: 0,
    }
  });

  // Processing the mock event on the mock database
  const updatedMockDb = await ENSRegistryWithFallback.NewOwner.processEvent({
    event: mockNewOwnerEvent,
    mockDb: nameRegisteredMockDb
  });

  // Expected entity that should be created
  const exAccountEntity: Account = { id: Addresses.defaultAddress };

  const exNameRegisteredEntity: Domain = {
    baseCost: undefined,
    createdAt: BigInt(mockNewOwnerEvent.block.timestamp),
    expiryDate: undefined,
    isMigrated: true,
    labelName: undefined,
    labelhash: mockNewOwnerEvent.params.label,
    name: undefined,
    registrant_id: undefined,
    renewPremium: undefined,
    resolvedAddress_id: undefined,
    wrappedOwner_id: undefined,
    id: "0xfe249fe2dc089c4f2b43756b49c3c329774a0b99dea3e1c3e56ce6ab093f16a5",
    ttl: BigInt(0),
    owner_id: Addresses.defaultAddress,
    subdomainCount: 0,
    parent_id: "0x000447a4d61a90d054b5e101f3c94c5c8819b7840e5a5442e07a21bc1c8c30b8",
    resolver_id: undefined,
    registration_id: undefined,
    wrappedDomain_id: undefined,
  };

  // Getting the entity from the mock database
  const domEntity = updatedMockDb.entities.Domain.get(
    "0xfe249fe2dc089c4f2b43756b49c3c329774a0b99dea3e1c3e56ce6ab093f16a5"
  );

  // TODO Check Parent SubdomainCount is 1
  // TODO Reverse Lookups on Account for Domains?
  // Asserting that the entity in the mock database is the same as the ex entity
  expect(domEntity).to.deep.equal(exNameRegisteredEntity);
});

//test SubDomain create
