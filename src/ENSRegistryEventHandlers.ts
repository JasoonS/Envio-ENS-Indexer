/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
    ENSRegistryWithFallbackContract_NewOwner_handler,
    ENSRegistryWithFallbackContract_NewOwner_loader,
    ENSRegistryWithFallbackContract_NewResolver_handler,
    ENSRegistryWithFallbackContract_NewResolver_loader,
    ENSRegistryWithFallbackContract_NewTTL_handler,
    ENSRegistryWithFallbackContract_NewTTL_loader,
    ENSRegistryWithFallbackContract_Transfer_handler,
    ENSRegistryWithFallbackContract_Transfer_loader
} from "../generated/src/Handlers.gen";

import {
    accountEntity,
    domainEntity,
    ENSRegistryEventsSummaryEntity,
    NewOwnerEntity,
    NewResolverEntity,
    NewTTLEntity,
    ResolverEntity,
    TransferEntity
} from "./src/Types.gen";

import { createResolverID, ETH_NODE, makeSubnode } from "./utils";

const GLOBAL_EVENTS_SUMMARY_KEY_1 = "GlobalENSRegistryEventsSummary";

const INITIAL_EVENTS_SUMMARY: ENSRegistryEventsSummaryEntity = {
    id: GLOBAL_EVENTS_SUMMARY_KEY_1,
    approvalForAllsCount: BigInt(0),
    newOwnersCount: BigInt(0),
    newResolversCount: BigInt(0),
    newTTLsCount: BigInt(0),
    transfersCount: BigInt(0)
};
ENSRegistryWithFallbackContract_NewOwner_loader(({ event, context }) => {
    context.ENSRegistryEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_1);
    context.Domain.load(event.params.node, {});
    context.Domain.load(makeSubnode(event.params.node, event.params.label), {});
});

ENSRegistryWithFallbackContract_NewOwner_handler(({ event, context }) => {
    let summary = context.ENSRegistryEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_1
    );

    let currentSummaryEntity: ENSRegistryEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        newOwnersCount: currentSummaryEntity.newOwnersCount + BigInt(1)
    };

    let newOwnerEntity: NewOwnerEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        label: event.params.label,
        owner: event.params.owner,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_1
    };

    context.ENSRegistryEventsSummary.set(nextSummaryEntity);
    context.NewOwner.set(newOwnerEntity);

    let subNode = makeSubnode(event.params.node, event.params.label);
    let account = <accountEntity>{ id: event.params.owner };
    let parent = context.Domain.get(event.params.node);
    let domain = context.Domain.get(subNode);

    if (domain !== undefined) {
        domain = {
            ...domain,
            parent: event.params.node,
            owner: event.params.owner,
            labelhash: event.params.label
        };
    } else {
        domain = <domainEntity>{
            baseCost: null,
            expiryDate: null,
            isMigrated: true,
            labelName: null,
            name: null,
            parent: event.params.node,
            registrant: null,
            resolver: null,
            renewPremium: null,
            resolvedAddress: null,
            wrappedOwner: null,
            id: subNode,
            ttl: BigInt(0),
            owner: event.params.owner,
            createdAt: BigInt(event.blockTimestamp),
            labelhash: event.params.label,
            subdomainCount: 0
        };
    }

    if (event.params.node == ETH_NODE) {
        domain = { ...domain, id: subNode, parent: event.params.node };
    }

    if (domain?.parent === undefined && parent !== undefined) {
        parent = {
            ...parent,
            subdomainCount: parent.subdomainCount + 1
        };

        domain = { ...domain, parent: event.params.node };
        context.Domain.set(parent);
    }


    /*
    if (domain.name == null) {
            // Get label and node names
            let label = ens.nameByHash(event.params.label);

            if (label != null) {
                domain = {...domain, labelName: label};
            }

            if (label === null) {
                label = "[" + event.params.label.slice(2) + "]";
            }

            if (event.params.node == ROOT_NODE) {
                domain = {...domain, name: label};
            } else {
                parent = parent!;
                let name = parent.name;
                if (label && name) {
                    domain = {...domain, name: label + "." + name};
                }
            }
        }
        */

    context.Domain.set(domain);
    context.Account.set(account);
})
    ;

ENSRegistryWithFallbackContract_NewResolver_loader(({ event, context }) => {
    context.ENSRegistryEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_1);
    context.Domain.load(event.params.node, { loaders: {} });
});

ENSRegistryWithFallbackContract_NewResolver_handler(({ event, context }) => {
    let summary = context.ENSRegistryEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_1
    );

    let currentSummaryEntity: ENSRegistryEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        newResolversCount: currentSummaryEntity.newResolversCount + BigInt(1)
    };

    let newResolverEntity: NewResolverEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        resolver: event.params.resolver,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_1
    };

    context.ENSRegistryEventsSummary.set(nextSummaryEntity);
    context.NewResolver.set(newResolverEntity);

    let id: string | null;

    if (event.params.resolver == "0x0000000000000000000000000000000000000000") {
        id = null;
    } else {
        id = createResolverID(event.params.resolver, event.params.node)
    }

    let domain = context.Domain.get(event.params.node)!;

    if (id) {
        let resolver = context.Resolver.get(id);
        if (resolver === undefined) {
            resolver = <ResolverEntity>{
                address: event.params.resolver,
                domain: event.params.node,
                id: id,
            }
            context.Resolver.set(resolver);
            // since this is a new resolver entity, there can't be a resolved address yet so set to null
            domain = { ...domain, resolvedAddress: null };

        } else {
            domain = { ...domain, resolvedAddress: resolver.addr };
        }
    } else {
        domain = { ...domain, resolvedAddress: null };
    }
    context.Domain.set(domain);
});

ENSRegistryWithFallbackContract_NewTTL_loader(({ event, context }) => {
    context.ENSRegistryEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_1);
    context.Domain.load(event.params.node, { loaders: {} });
});

ENSRegistryWithFallbackContract_NewTTL_handler(({ event, context }) => {
    let summary = context.ENSRegistryEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_1
    );
    let currentSummaryEntity: ENSRegistryEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        newTTLsCount: currentSummaryEntity.newTTLsCount + BigInt(1)
    };

    let newTTLEntity: NewTTLEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        ttl: event.params.ttl,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_1
    };

    context.ENSRegistryEventsSummary.set(nextSummaryEntity);
    context.NewTTL.set(newTTLEntity);

    let domain = context.Domain.get(event.params.node);

    if (domain !== undefined) {
        domain = { ...domain, ttl: event.params.ttl };
        context.Domain.set(domain);
    }
});

ENSRegistryWithFallbackContract_Transfer_loader(({ event, context }) => {
    context.ENSRegistryEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_1);
    context.Domain.load(event.params.node, { loaders: {} });
});

ENSRegistryWithFallbackContract_Transfer_handler(({ event, context }) => {
    let summary = context.ENSRegistryEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_1
    );

    let currentSummaryEntity: ENSRegistryEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        transfersCount: currentSummaryEntity.transfersCount + BigInt(1)
    };

    let transferEntity: TransferEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        owner: event.params.owner,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_1
    };

    context.ENSRegistryEventsSummary.set(nextSummaryEntity);
    context.Transfer.set(transferEntity);

    let domain = context.Domain.get(event.params.node);

    if (domain !== undefined) {
        domain = { ...domain, owner: event.params.owner };
        context.Domain.set(domain);
    }
});
