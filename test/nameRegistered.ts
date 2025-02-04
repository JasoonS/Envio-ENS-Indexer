import {

  TestHelpers,
  Account,
  Domain,
  Registration
} from "generated";
// import { TestHelpers, User } from "generated";
const { MockDb, Addresses, ENSRegistryWithFallback,
  ETHRegistrarController, } = TestHelpers;
// import { Addresses } from "generated/src/bindings/Ethers.gen";
import { expect } from 'chai';
import { GRACE_PERIOD_SECONDS } from "../src/utils";
import { t as mockDBType } from "generated/src/TestHelpers_MockDb.gen";

import assert = require("assert")

export const mockNameRegistered = async (mockDbInitial: mockDBType): Promise<mockDBType> => {
  // Creating a mock event
  const mockNameRegisteredEvent = ETHRegistrarController.NameRegistered.createMockEvent(
    {
      name: "vibraciones",
      label:
        "0xd9a38024ac72f570a95923e9b046307c96b8e51187840f1bb758c3b6f9487fe1",
      owner: Addresses.defaultAddress,
      baseCost: BigInt(3775609184524047),
      premium: BigInt(0),
      expires: BigInt(1696136927),
      mockEventData: {
        block: {
          number: 1,
          hash: "0x1",
          timestamp: 1
        },
        transaction: {
          hash: "0x1",
          transactionIndex: 0
        }
      }
    }
  );

  // Processing the mock event on the mock database
  const updatedMockDb = await ETHRegistrarController.NameRegistered.processEvent({
    event: mockNameRegisteredEvent,
    mockDb: mockDbInitial
  });

  // Expected entity that should be created
  const exAccountEntity: Account = { id: Addresses.defaultAddress };

  const exNameRegisteredEntity: Domain = {
    createdAt: BigInt(mockNameRegisteredEvent.block.timestamp), isMigrated: true,
    labelName: "vibraciones",
    labelhash: mockNameRegisteredEvent.params.label,
    resolvedAddress_id: undefined,
    id: "0x000447a4d61a90d054b5e101f3c94c5c8819b7840e5a5442e07a21bc1c8c30b8",
    ttl: BigInt(0),
    name: "vibraciones.eth",
    owner_id: Addresses.defaultAddress,
    subdomainCount: 0,
    expiryDate: BigInt(
      mockNameRegisteredEvent.params.expires + GRACE_PERIOD_SECONDS
    ),
    baseCost: mockNameRegisteredEvent.params.baseCost,
    renewPremium: mockNameRegisteredEvent.params.premium,
    registrant_id: Addresses.defaultAddress,
    parent_id: undefined,
    resolver_id: undefined,
    wrappedOwner_id: undefined,
    registration_id: undefined,
    wrappedDomain_id: undefined,
  };

  const exRegistrationEntity: Registration = {
    cost: mockNameRegisteredEvent.params.baseCost,
    domain_id:
      "0x000447a4d61a90d054b5e101f3c94c5c8819b7840e5a5442e07a21bc1c8c30b8",
    id: mockNameRegisteredEvent.params.label,
    registrant_id: exAccountEntity.id,
    expiryDate: mockNameRegisteredEvent.params.expires,
    registrationDate: BigInt(mockNameRegisteredEvent.block.timestamp)
  };

  // Getting the entity from the mock database
  const domEntity = updatedMockDb.entities.Domain.get(
    "0x000447a4d61a90d054b5e101f3c94c5c8819b7840e5a5442e07a21bc1c8c30b8"
  );
  const accEntity = updatedMockDb.entities.Account.get(
    Addresses.defaultAddress
  );
  const regEntity = updatedMockDb.entities.Registration.get(
    mockNameRegisteredEvent.params.label
  );

  // Asserting that the entity in the mock database is the same as the ex entity
  assert.deepEqual(exNameRegisteredEntity, domEntity);
  assert.deepEqual(exAccountEntity, accEntity);
  assert.deepEqual(exRegistrationEntity, regEntity);

  return updatedMockDb;
};

describe("NameRegistered", () => {
  it("test NameRegistered Success", async () => {
    // Initializing the mock database
    const mockDbInitial = MockDb.createMockDb();

    const _mockNewOwnerEvent = ENSRegistryWithFallback.NewOwner.createMockEvent({
      node: "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae",
      label: "0xed23485acabad9a8dcfd46f6aa6d014d7de0336e053701a5dff28be996c1f78f",
      owner: "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401",
      mockEventData: {
        block: {
          number: 1,
          hash: "0x1",
          timestamp: 1
        },
        transaction: {
          hash: "0x1",
          transactionIndex: 0
        }
      }
    });

    await mockNameRegistered(mockDbInitial);
  });
});
