/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
    NameWrapperContract_ExpiryExtended_handler,
    NameWrapperContract_ExpiryExtended_loader,
    NameWrapperContract_FusesSet_handler,
    NameWrapperContract_FusesSet_loader,
    NameWrapperContract_NameUnwrapped_handler,
    NameWrapperContract_NameUnwrapped_loader,
    NameWrapperContract_NameWrapped_handler,
    NameWrapperContract_NameWrapped_loader,
    NameWrapperContract_OwnershipTransferred_handler,
    NameWrapperContract_OwnershipTransferred_loader,
    NameWrapperContract_TransferBatch_handler,
    NameWrapperContract_TransferBatch_loader,
    NameWrapperContract_TransferSingle_handler,
    NameWrapperContract_TransferSingle_loader
} from "../generated/src/Handlers.gen";

import {
    accountEntity,
    ExpiryExtendedEntity,
    FusesSetEntity,
    NameUnwrappedEntity,
    NameWrappedEntity,
    NameWrapperEventsSummaryEntity,
    OwnershipTransferredEntity,
    TransferBatchEntity,
    TransferSingleEntity,
    wrappedDomainEntity
} from "./src/Types.gen";
import { ETH_NODE } from "./utils";

const GLOBAL_EVENTS_SUMMARY_KEY_2 = "GlobalEventsSummary";

const INITIAL_EVENTS_SUMMARY: NameWrapperEventsSummaryEntity = {
    id: GLOBAL_EVENTS_SUMMARY_KEY_2,
    approvalsCount: BigInt(0),
    approvalForAllsCount: BigInt(0),
    controllerChangedsCount: BigInt(0),
    expiryExtendedsCount: BigInt(0),
    fusesSetsCount: BigInt(0),
    nameUnwrappedsCount: BigInt(0),
    nameWrappedsCount: BigInt(0),
    ownershipTransferredsCount: BigInt(0),
    transferBatchsCount: BigInt(0),
    transferSinglesCount: BigInt(0),
    uRIsCount: BigInt(0)
};

const PARENT_CANNOT_CONTROL: bigint = BigInt(65536);

function checkPccBurned(fuses: bigint): boolean {
    return (fuses & PARENT_CANNOT_CONTROL) == PARENT_CANNOT_CONTROL;
}

NameWrapperContract_ExpiryExtended_loader(({ event, context }) => {
    context.NameWrapperEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_2);
    context.Domain.load(event.params.node, { loaders: {} });
});

NameWrapperContract_ExpiryExtended_handler(({ event, context }) => {
    let summary = context.NameWrapperEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_2
    );

    let currentSummaryEntity: NameWrapperEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        expiryExtendedsCount: currentSummaryEntity.expiryExtendedsCount + BigInt(1)
    };

    let expiryExtendedEntity: ExpiryExtendedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        expiry: event.params.expiry,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    context.NameWrapperEventsSummary.set(nextSummaryEntity);
    context.ExpiryExtended.set(expiryExtendedEntity);

    let domain = context.Domain.get(event.params.node);

    if (domain !== undefined) {
        domain = { ...domain, expiryDate: event.params.expiry };
        context.Domain.set(domain);
    }
});

NameWrapperContract_FusesSet_loader(({ event, context }) => {
    context.NameWrapperEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_2);
});

NameWrapperContract_FusesSet_handler(({ event, context }) => {
    let summary = context.NameWrapperEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_2
    );

    let currentSummaryEntity: NameWrapperEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        fusesSetsCount: currentSummaryEntity.fusesSetsCount + BigInt(1)
    };

    let fusesSetEntity: FusesSetEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        fuses: event.params.fuses,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    context.NameWrapperEventsSummary.set(nextSummaryEntity);
    context.FusesSet.set(fusesSetEntity);
});

NameWrapperContract_NameUnwrapped_loader(({ event, context }) => {
    context.NameWrapperEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_2);
    context.Domain.load(event.params.node, { loaders: {} });
});

NameWrapperContract_NameUnwrapped_handler(({ event, context }) => {
    let summary = context.NameWrapperEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_2
    );

    let currentSummaryEntity: NameWrapperEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        nameUnwrappedsCount: currentSummaryEntity.nameUnwrappedsCount + BigInt(1)
    };

    let nameUnwrappedEntity: NameUnwrappedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        owner: event.params.owner,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    context.NameWrapperEventsSummary.set(nextSummaryEntity);
    context.NameUnwrapped.set(nameUnwrappedEntity);

    let domain = context.Domain.get(event.params.node);
    if (domain !== undefined) {
        domain = {
            ...domain,
            wrappedOwner: null
        };

        if (domain.expiryDate && domain.parent !== ETH_NODE) {
            domain = { ...domain, expiryDate: null };
        }

        context.Domain.set(domain);
    }
});

NameWrapperContract_NameWrapped_loader(({ event, context }) => {
    context.NameWrapperEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_2);
    context.Domain.load(event.params.node, { loaders: {} });
    context.Account.load(event.params.owner);
});

NameWrapperContract_NameWrapped_handler(({ event, context }) => {
    let summary = context.NameWrapperEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_2
    );

    let currentSummaryEntity: NameWrapperEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        nameWrappedsCount: currentSummaryEntity.nameWrappedsCount + BigInt(1)
    };

    let nameWrappedEntity: NameWrappedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        name: event.params.name,
        owner: event.params.owner,
        fuses: event.params.fuses,
        expiry: event.params.expiry,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    context.NameWrapperEventsSummary.set(nextSummaryEntity);
    context.NameWrapped.set(nameWrappedEntity);

    let domain = context.Domain.get(event.params.node);
    let domainID = event.params.node;
    let owner = context.Account.get(event.params.owner);

    if (owner === undefined) {
        owner = <accountEntity>{
            id: event.params.owner
        };
        context.Account.set(owner);
    }

    if (domain !== undefined) {
        domainID = domain.id;
        domain = {
            ...domain,
            name: event.params.name,
            owner: owner.id,
            wrappedOwner: owner.id
        };

        if (
            checkPccBurned(event.params.fuses) &&
            (!domain.expiryDate || event.params.expiry > domain.expiryDate!)
        ) {
            domain = { ...domain, expiryDate: event.params.expiry };
        }

        context.Domain.set(domain);
    }

    let wrappedDomain: wrappedDomainEntity = {
        domain: domainID,
        expiryDate: event.params.expiry,
        fuses: event.params.fuses,
        id: event.params.node,
        name: event.params.name,
        owner: event.params.owner
    };
    context.WrappedDomain.set(wrappedDomain);
});

NameWrapperContract_OwnershipTransferred_loader(({ event, context }) => {
    context.NameWrapperEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_2);
});

NameWrapperContract_OwnershipTransferred_handler(({ event, context }) => {
    let summary = context.NameWrapperEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_2
    );

    let currentSummaryEntity: NameWrapperEventsSummaryEntity =
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
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    context.NameWrapperEventsSummary.set(nextSummaryEntity);
    context.OwnershipTransferred.set(ownershipTransferredEntity);
});

NameWrapperContract_TransferBatch_loader(({ event, context }) => {
    context.NameWrapperEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_2);
});

NameWrapperContract_TransferBatch_handler(({ event, context }) => {
    let summary = context.NameWrapperEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_2
    );

    let currentSummaryEntity: NameWrapperEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        transferBatchsCount: currentSummaryEntity.transferBatchsCount + BigInt(1)
    };

    let transferBatchEntity: TransferBatchEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        operator: event.params.operator,
        from: event.params.from,
        to: event.params.to,
        ids: event.params.ids,
        values: event.params.values,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    context.NameWrapperEventsSummary.set(nextSummaryEntity);
    context.TransferBatch.set(transferBatchEntity);
});

NameWrapperContract_TransferSingle_loader(({ event, context }) => {
    context.NameWrapperEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_2);
});

NameWrapperContract_TransferSingle_handler(({ event, context }) => {
    let summary = context.NameWrapperEventsSummary.get(
        GLOBAL_EVENTS_SUMMARY_KEY_2
    );

    let currentSummaryEntity: NameWrapperEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
        ...currentSummaryEntity,
        transferSinglesCount: currentSummaryEntity.transferSinglesCount + BigInt(1)
    };

    let transferSingleEntity: TransferSingleEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        operator: event.params.operator,
        from: event.params.from,
        to: event.params.to,
        eventId: event.params.id,
        value: event.params.value,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    context.NameWrapperEventsSummary.set(nextSummaryEntity);
    context.TransferSingle.set(transferSingleEntity);
});