/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
    BaseRegistrarContract_NameRegistered_handler,
    BaseRegistrarContract_NameRegistered_loader,
    BaseRegistrarContract_NameRenewed_handler,
    BaseRegistrarContract_NameRenewed_loader,
    BaseRegistrarContract_Transfer_handler,
    BaseRegistrarContract_Transfer_loader,
    ETHRegistrarControllerContract_NameRegistered_handler,
    ETHRegistrarControllerContract_NameRegistered_loader,
    ETHRegistrarControllerContract_NameRenewed_handler,
    ETHRegistrarControllerContract_NameRenewed_loader,
    EthRegistrarControllerOldContract_NameRegistered_handler,
    EthRegistrarControllerOldContract_NameRegistered_loader,
    EthRegistrarControllerOldContract_NameRenewed_handler,
    EthRegistrarControllerOldContract_NameRenewed_loader
} from "../generated/src/Handlers.gen";

import {
    AccountEntity,
    BaseRegistrar_NameRegisteredEntity,
    BaseRegistrar_NameRenewedEntity,
    BaseRegistrar_TransferEntity,
    DomainEntity,
    EthRegistrarControllerEventSummaryEntity,
    EthRegistrarControllerOld_NameRegisteredEntity,
    EthRegistrarControllerOld_NameRenewedEntity,
    NameRegisteredEntity,
    NameRenewedEntity,
    RegistrationEntity
} from "./src/Types.gen";
import { ETH_NODE, GRACE_PERIOD_SECONDS, makeSubnode, nameHash } from "./utils";

const GLOBAL_EVENTS_SUMMARY_KEY = "GlobalEthRegistrarControllerEventsSummary";

const INITIAL_EVENTS_SUMMARY: EthRegistrarControllerEventSummaryEntity = {
    id: GLOBAL_EVENTS_SUMMARY_KEY,
    nameRegisteredsCount: BigInt(0),
    nameRenewedsCount: BigInt(0),
    baseRegistrar_NameRegisteredCount: BigInt(0),
    baseRegistrar_NameRenewedCount: BigInt(0),
    baseRegistrar_TransferCount: BigInt(0),
    ethRegistrarControllerOld_NameRegisteredCount: BigInt(0),
    ethRegistrarControllerOld_NameRenewedCount: BigInt(0),
};


ETHRegistrarControllerContract_NameRegistered_loader(({ event, context }) => {
    context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
    // context.Domain.load(makeSubnode(ETH_NODE, event.params.label), {});
});

ETHRegistrarControllerContract_NameRegistered_handler(({ event, context }) => {
    let summary = context.EthRegistrarControllerEventSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY
    );

    let currentSummaryEntity: EthRegistrarControllerEventSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        nameRegisteredsCount: currentSummaryEntity.nameRegisteredsCount + BigInt(1)
    };

    let nameRegisteredEntity: NameRegisteredEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        name: event.params.name,
        label: event.params.label,
        owner: event.params.owner,
        baseCost: event.params.baseCost,
        premium: event.params.premium,
        expires: event.params.expires,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY
    };

    context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    context.NameRegistered.set(nameRegisteredEntity);

    /*   let subNode = makeSubnode(ETH_NODE, event.params.label)
      let domain = context.Domain.get(subNode)!; */


    let name = event.params.name + ".eth";
    let node = nameHash(name);

    let domain: DomainEntity = {
        createdAt: BigInt(event.blockTimestamp),
        isMigrated: true,
        labelName: event.params.name,
        resolvedAddress: null,
        id: node,
        registrant: event.params.owner,
        expiryDate: BigInt(event.params.expires + GRACE_PERIOD_SECONDS),
        labelhash: event.params.label,
        baseCost: event.params.baseCost,
        renewPremium: event.params.premium,
        name: event.params.name + ".eth",
        owner: event.params.owner,
        subdomainCount: 0,
        ttl: BigInt(0),
        parent: null,
        wrappedOwner: null
    }


    let acc: AccountEntity = { id: event.params.owner };
    let registration: RegistrationEntity = {
        id: event.params.label,
        cost: BigInt(event.params.baseCost),
        domain: node,
        registrationDate: BigInt(event.blockTimestamp),
        expiryDate: event.params.expires,
        registrant: acc.id
    };

    context.Account.set(acc);
    context.Domain.set(domain);
    context.Registration.set(registration);
});

ETHRegistrarControllerContract_NameRenewed_loader(({ event, context }) => {
    context.Domain.load(makeSubnode(ETH_NODE, event.params.label), {});
    context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
    context.Registration.load(event.params.label, {});
});

ETHRegistrarControllerContract_NameRenewed_handler(({ event, context }) => {
    let summary = context.EthRegistrarControllerEventSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY
    );

    let currentSummaryEntity: EthRegistrarControllerEventSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        nameRenewedsCount: currentSummaryEntity.nameRenewedsCount + BigInt(1)
    };

    let nameRenewedEntity: NameRenewedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        name: event.params.name,
        label: event.params.label,
        cost: event.params.cost,
        expires: event.params.expires,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY
    };

    context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    context.NameRenewed.set(nameRenewedEntity);


    let registration = context.Registration.get(event.params.label)!;
    let domain = context.Domain.get(makeSubnode(ETH_NODE, event.params.label))!;

    registration = {
        ...registration,
        expiryDate: event.params.expires
    };
    context.Registration.set(registration);

    domain = {
        ...domain,
        expiryDate: BigInt(event.params.expires + GRACE_PERIOD_SECONDS)
    };
    context.Domain.set(domain);

});

BaseRegistrarContract_NameRegistered_loader(({ event, context }) => {
    context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

BaseRegistrarContract_NameRegistered_handler(({ event, context }) => {
    const summary = context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: EthRegistrarControllerEventSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        baseRegistrar_NameRegisteredCount: currentSummaryEntity.baseRegistrar_NameRegisteredCount + BigInt(1),
    };

    const baseRegistrar_NameRegisteredEntity: BaseRegistrar_NameRegisteredEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        eventId: event.params.id,
        owner: event.params.owner,
        expires: event.params.expires,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    context.BaseRegistrar_NameRegistered.set(baseRegistrar_NameRegisteredEntity);
});

BaseRegistrarContract_NameRenewed_loader(({ event, context }) => {
    context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

BaseRegistrarContract_NameRenewed_handler(({ event, context }) => {
    const summary = context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: EthRegistrarControllerEventSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        baseRegistrar_NameRenewedCount: currentSummaryEntity.baseRegistrar_NameRenewedCount + BigInt(1),
    };

    const baseRegistrar_NameRenewedEntity: BaseRegistrar_NameRenewedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        eventId: event.params.id,
        expires: event.params.expires,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    context.BaseRegistrar_NameRenewed.set(baseRegistrar_NameRenewedEntity);
});

BaseRegistrarContract_Transfer_loader(({ event, context }) => {
    context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

BaseRegistrarContract_Transfer_handler(({ event, context }) => {
    const summary = context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: EthRegistrarControllerEventSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        baseRegistrar_TransferCount: currentSummaryEntity.baseRegistrar_TransferCount + BigInt(1),
    };

    const baseRegistrar_TransferEntity: BaseRegistrar_TransferEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        from: event.params.from,
        to: event.params.to,
        tokenId: event.params.tokenId,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    context.BaseRegistrar_Transfer.set(baseRegistrar_TransferEntity);
});

EthRegistrarControllerOldContract_NameRegistered_loader(({ event, context }) => {
    context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

EthRegistrarControllerOldContract_NameRegistered_handler(({ event, context }) => {
    const summary = context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: EthRegistrarControllerEventSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        ethRegistrarControllerOld_NameRegisteredCount: currentSummaryEntity.ethRegistrarControllerOld_NameRegisteredCount + BigInt(1),
    };

    const ethRegistrarControllerOld_NameRegisteredEntity: EthRegistrarControllerOld_NameRegisteredEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        name: event.params.name,
        label: event.params.label,
        owner: event.params.owner,
        cost: event.params.cost,
        expires: event.params.expires,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    context.EthRegistrarControllerOld_NameRegistered.set(ethRegistrarControllerOld_NameRegisteredEntity);
});

EthRegistrarControllerOldContract_NameRenewed_loader(({ event, context }) => {
    context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

EthRegistrarControllerOldContract_NameRenewed_handler(({ event, context }) => {
    const summary = context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: EthRegistrarControllerEventSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        ethRegistrarControllerOld_NameRenewedCount: currentSummaryEntity.ethRegistrarControllerOld_NameRenewedCount + BigInt(1),
    };

    const ethRegistrarControllerOld_NameRenewedEntity: EthRegistrarControllerOld_NameRenewedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        name: event.params.name,
        label: event.params.label,
        cost: event.params.cost,
        expires: event.params.expires,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    context.EthRegistrarControllerOld_NameRenewed.set(ethRegistrarControllerOld_NameRenewedEntity);
});