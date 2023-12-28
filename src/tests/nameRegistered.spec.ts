import {
    ENSRegistryWithFallback_NewOwner_createMockEvent,
    ETHRegistrarController_NameRegistered_createMockEvent,
    ETHRegistrarController_NameRegistered_processEvent,
    MockDb
} from "../../generated/src/TestHelpers.gen";
import {Addresses} from "../../generated/src/bindings/Ethers.gen";
import {it} from "node:test";
import {AccountEntity, DomainEntity, RegistrationEntity} from "../../generated/src/Types.gen";
import assert from "assert";
import {GRACE_PERIOD_SECONDS} from "../utils";
import {t as mockDBType} from "../../generated/src/TestHelpers_MockDb.gen";

it("test NameRegistered Success", () => {

    // Initializing the mock database
    const mockDbInitial = MockDb.createMockDb();

    const mockNewOwnerEvent = ENSRegistryWithFallback_NewOwner_createMockEvent({
        node: "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae",
        label: "0xed23485acabad9a8dcfd46f6aa6d014d7de0336e053701a5dff28be996c1f78f",
        owner: "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401",
    })

    mockNameRegistered(mockDbInitial)

});

export const mockNameRegistered = (mockDbInitial: mockDBType) => {
    // Creating a mock event
    const mockNameRegisteredEvent = ETHRegistrarController_NameRegistered_createMockEvent({
        name: "swaglord123",
        label: "0xed23485acabad9a8dcfd46f6aa6d014d7de0336e053701a5dff28be996c1f78f",
        // owner: "0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401",
        owner: Addresses.defaultAddress,
        baseCost: BigInt(2697984627609664),
        premium: BigInt(0),
        expires: BigInt(1712438951),
    })


    // Processing the mock event on the mock database
    const updatedMockDb = ETHRegistrarController_NameRegistered_processEvent({
        event: mockNameRegisteredEvent,
        mockDb: mockDbInitial,
    });


    // Expected entity that should be created
    const exAccountEntity: AccountEntity = {id: Addresses.defaultAddress};

    const exNameRegisteredEntity: DomainEntity = {
        id: "0x9d25b19719eb56754c40d2d54381110c6d87cafadb8bd8996a8ea9393e1f080f",
        ttl: BigInt(0),
        name: "swaglord123.eth",
        owner: Addresses.defaultAddress,
        srcAddress: mockNameRegisteredEvent.srcAddress,
        subdomainCount: 0,
        expiryDate: BigInt(mockNameRegisteredEvent.params.expires + GRACE_PERIOD_SECONDS),
        baseCost: mockNameRegisteredEvent.params.baseCost,
        renewPremium: mockNameRegisteredEvent.params.premium,
        blockTimestamp: mockNameRegisteredEvent.blockTimestamp,
        label: mockNameRegisteredEvent.params.label,
        registrant: Addresses.defaultAddress,
        parent: null,
        resolver: null,
        wrappedOwner: null
    };

    const exRegistrationEntity: RegistrationEntity = {
        cost: mockNameRegisteredEvent.params.baseCost,
        domain: "0x9d25b19719eb56754c40d2d54381110c6d87cafadb8bd8996a8ea9393e1f080f",
        id: mockNameRegisteredEvent.params.label,
        registrant: exAccountEntity.id,
        expiryDate: mockNameRegisteredEvent.params.expires,
        registrationDate: BigInt(mockNameRegisteredEvent.blockTimestamp)
    };

    // Getting the entity from the mock database
    const domEntity = updatedMockDb.entities.Domain.get("0x9d25b19719eb56754c40d2d54381110c6d87cafadb8bd8996a8ea9393e1f080f");
    const accEntity = updatedMockDb.entities.Account.get(Addresses.defaultAddress);
    const regEntity = updatedMockDb.entities.Registration.get(mockNameRegisteredEvent.params.label);

    // Asserting that the entity in the mock database is the same as the ex entity
    assert.deepEqual(exNameRegisteredEntity, domEntity);
    assert.deepEqual(exAccountEntity, accEntity);
    assert.deepEqual(exRegistrationEntity, regEntity);
}
//test SubDomain create
