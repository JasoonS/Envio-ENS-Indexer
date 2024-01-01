/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
    ETHRegistrarControllerContract_NameRegistered_handler,
    ETHRegistrarControllerContract_NameRegistered_loader,
    ETHRegistrarControllerContract_NameRenewed_handler,
    ETHRegistrarControllerContract_NameRenewed_loader,
    ETHRegistrarControllerContract_OwnershipTransferred_handler,
    ETHRegistrarControllerContract_OwnershipTransferred_loader
} from "../generated/src/Handlers.gen";

import {
    AccountEntity,
    DomainEntity,
    EthRegistrarControllerEventSummaryEntity,
    NameRegisteredEntity,
    NameRenewedEntity,
    OwnershipTransferredEntity,
    RegistrationEntity
} from "./src/Types.gen";
import { ETH_NODE, GRACE_PERIOD_SECONDS, makeSubnode, nameHash } from "./utils";

const GLOBAL_EVENTS_SUMMARY_KEY = "GlobalEthRegistrarControllerEventsSummary";

const INITIAL_EVENTS_SUMMARY: EthRegistrarControllerEventSummaryEntity = {
    id: GLOBAL_EVENTS_SUMMARY_KEY,
    nameRegisteredsCount: BigInt(0),
    nameRenewedsCount: BigInt(0),
    ownershipTransferredsCount: BigInt(0)
};


ETHRegistrarControllerContract_NameRegistered_loader(({ event, context }) => {
    context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
    context.Domain.load(makeSubnode(ETH_NODE, event.params.label), {});
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

    let subNode = makeSubnode(ETH_NODE, event.params.label)
    let domain = context.Domain.get(subNode);

    let acc: AccountEntity = { id: event.params.owner };

    let name = event.params.name + ".eth";
    let node = nameHash(name);

    if (domain !== undefined) {
        domain = {
            ...domain,
            registrant: event.params.owner,
            expiryDate: BigInt(event.params.expires + GRACE_PERIOD_SECONDS),
            label: event.params.label,
            baseCost: event.params.baseCost,
            renewPremium: event.params.premium,
            name: event.params.name + ".eth",
            owner: event.params.owner,
        }
        /*
        * res = NameByHash(event.params.label)
        * set domain = {...domain, name: res + ".eth"}
        * registration.labelName = labelName*/
    } else {
        domain = <DomainEntity>{
            label: event.params.label,
            registrant: event.params.owner,
            subdomainCount: 0,
            ttl: BigInt(0),
            expiryDate: BigInt(event.params.expires + GRACE_PERIOD_SECONDS),
            baseCost: event.params.baseCost,
            renewPremium: event.params.premium,
            blockTimestamp: event.blockTimestamp,
            name: event.params.name + ".eth",
            owner: event.params.owner,
            srcAddress: event.srcAddress,
            id: node,
            parent: null,
            resolver: null,
            wrappedOwner: null
        };
    }


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

ETHRegistrarControllerContract_OwnershipTransferred_loader(
    ({ event, context }) => {
        context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
    }
);

ETHRegistrarControllerContract_OwnershipTransferred_handler(
    ({ event, context }) => {
        let summary = context.EthRegistrarControllerEventSummary.get(
            GLOBAL_EVENTS_SUMMARY_KEY
        );

        let currentSummaryEntity: EthRegistrarControllerEventSummaryEntity =
            summary ?? INITIAL_EVENTS_SUMMARY;

        let nextSummaryEntity = {
            ...currentSummaryEntity,
            ownershipTransferredsCount:
                currentSummaryEntity.ownershipTransferredsCount + BigInt(1)
        };

        let ownershipTransferredEntity: OwnershipTransferredEntity = {
            id: event.transactionHash + event.logIndex.toString(),
            previousOwner: event.params.previousOwner,
            newOwner: event.params.newOwner,
            eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY
        };

        context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
        context.OwnershipTransferred.set(ownershipTransferredEntity);
    }
);
