/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
    ResolverContract_ABIChanged_handler,
    ResolverContract_ABIChanged_loader,
    ResolverContract_AddrChanged_handler,
    ResolverContract_AddrChanged_loader,
    ResolverContract_AddressChanged_handler,
    ResolverContract_AddressChanged_loader,
    ResolverContract_AuthorisationChanged_handler,
    ResolverContract_AuthorisationChanged_loader,
    ResolverContract_ContenthashChanged_handler,
    ResolverContract_ContenthashChanged_loader,
    ResolverContract_InterfaceChanged_handler,
    ResolverContract_InterfaceChanged_loader,
    ResolverContract_NameChanged_handler,
    ResolverContract_NameChanged_loader,
    ResolverContract_PubkeyChanged_handler,
    ResolverContract_PubkeyChanged_loader,
    ResolverContract_TextChanged_handler,
    ResolverContract_TextChanged_loader,
    ResolverContract_VersionChanged_handler,
    ResolverContract_VersionChanged_loader
} from "../generated/src/Handlers.gen";

import {
    Resolver_ABIChangedEntity,
    Resolver_AddrChangedEntity,
    Resolver_AddressChangedEntity,
    Resolver_AuthorisationChangedEntity,
    Resolver_ContenthashChangedEntity,
    Resolver_InterfaceChangedEntity,
    Resolver_NameChangedEntity,
    Resolver_PubkeyChangedEntity,
    Resolver_TextChangedEntity,
    Resolver_VersionChangedEntity,
    ResolverEventsSummaryEntity
} from "./src/Types.gen";

const GLOBAL_EVENTS_SUMMARY_KEY = "GlobalEventsSummary";

const INITIAL_EVENTS_SUMMARY: ResolverEventsSummaryEntity = {
    id: GLOBAL_EVENTS_SUMMARY_KEY,
    resolver_ABIChangedCount: BigInt(0),
    resolver_AddrChangedCount: BigInt(0),
    resolver_AddressChangedCount: BigInt(0),
    resolver_AuthorisationChangedCount: BigInt(0),
    resolver_ContenthashChangedCount: BigInt(0),
    resolver_InterfaceChangedCount: BigInt(0),
    resolver_NameChangedCount: BigInt(0),
    resolver_PubkeyChangedCount: BigInt(0),
    resolver_TextChangedCount: BigInt(0),
    resolver_VersionChangedCount: BigInt(0),
};

ResolverContract_ABIChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_ABIChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_ABIChangedCount: currentSummaryEntity.resolver_ABIChangedCount + BigInt(1),
    };

    const resolver_ABIChangedEntity: Resolver_ABIChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        contentType: event.params.contentType,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_ABIChanged.set(resolver_ABIChangedEntity);
});
ResolverContract_AddrChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_AddrChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_AddrChangedCount: currentSummaryEntity.resolver_AddrChangedCount + BigInt(1),
    };

    const resolver_AddrChangedEntity: Resolver_AddrChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        a: event.params.a,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_AddrChanged.set(resolver_AddrChangedEntity);
});
ResolverContract_AddressChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_AddressChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_AddressChangedCount: currentSummaryEntity.resolver_AddressChangedCount + BigInt(1),
    };

    const resolver_AddressChangedEntity: Resolver_AddressChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        coinType: event.params.coinType,
        newAddress: event.params.newAddress,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_AddressChanged.set(resolver_AddressChangedEntity);
});
ResolverContract_AuthorisationChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_AuthorisationChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_AuthorisationChangedCount: currentSummaryEntity.resolver_AuthorisationChangedCount + BigInt(1),
    };

    const resolver_AuthorisationChangedEntity: Resolver_AuthorisationChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        owner: event.params.owner,
        target: event.params.target,
        isAuthorised: event.params.isAuthorised,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_AuthorisationChanged.set(resolver_AuthorisationChangedEntity);
});
ResolverContract_ContenthashChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_ContenthashChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_ContenthashChangedCount: currentSummaryEntity.resolver_ContenthashChangedCount + BigInt(1),
    };

    const resolver_ContenthashChangedEntity: Resolver_ContenthashChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        hash: event.params.hash,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_ContenthashChanged.set(resolver_ContenthashChangedEntity);
});
ResolverContract_InterfaceChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_InterfaceChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_InterfaceChangedCount: currentSummaryEntity.resolver_InterfaceChangedCount + BigInt(1),
    };

    const resolver_InterfaceChangedEntity: Resolver_InterfaceChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        interfaceID: event.params.interfaceID,
        implementer: event.params.implementer,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_InterfaceChanged.set(resolver_InterfaceChangedEntity);
});
ResolverContract_NameChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_NameChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_NameChangedCount: currentSummaryEntity.resolver_NameChangedCount + BigInt(1),
    };

    const resolver_NameChangedEntity: Resolver_NameChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        name: event.params.name,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_NameChanged.set(resolver_NameChangedEntity);
});
ResolverContract_PubkeyChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_PubkeyChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_PubkeyChangedCount: currentSummaryEntity.resolver_PubkeyChangedCount + BigInt(1),
    };

    const resolver_PubkeyChangedEntity: Resolver_PubkeyChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        x: event.params.x,
        y: event.params.y,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_PubkeyChanged.set(resolver_PubkeyChangedEntity);
});
ResolverContract_TextChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_TextChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_TextChangedCount: currentSummaryEntity.resolver_TextChangedCount + BigInt(1),
    };

    const resolver_TextChangedEntity: Resolver_TextChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        indexedKey: event.params.indexedKey,
        key: event.params.key,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_TextChanged.set(resolver_TextChangedEntity);
});
ResolverContract_VersionChanged_loader(({ event, context }) => {
    context.ResolverEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ResolverContract_VersionChanged_handler(({ event, context }) => {
    const summary = context.ResolverEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    const currentSummaryEntity: ResolverEventsSummaryEntity =
        summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
        ...currentSummaryEntity,
        resolver_VersionChangedCount: currentSummaryEntity.resolver_VersionChangedCount + BigInt(1),
    };

    const resolver_VersionChangedEntity: Resolver_VersionChangedEntity = {
        id: event.transactionHash + event.logIndex.toString(),
        node: event.params.node,
        newVersion: event.params.newVersion,
        eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    context.ResolverEventsSummary.set(nextSummaryEntity);
    context.Resolver_VersionChanged.set(resolver_VersionChangedEntity);
});
