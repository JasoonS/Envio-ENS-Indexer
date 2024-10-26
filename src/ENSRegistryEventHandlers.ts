/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
  ENSRegistryWithFallback,
  Account,
  Domain,
  ENSRegistryEventsSummary,
  NewOwner,
  NewResolver,
  NewTTL,
  Resolver,
  Transfer
} from "generated";

import { createResolverID, ETH_NODE, makeSubnode } from "./utils";

const GLOBAL_EVENTS_SUMMARY_KEY_1 = "GlobalENSRegistryEventsSummary";

const INITIAL_EVENTS_SUMMARY: ENSRegistryEventsSummary = {
  id: GLOBAL_EVENTS_SUMMARY_KEY_1,
  approvalForAllsCount: BigInt(0),
  newOwnersCount: BigInt(0),
  newResolversCount: BigInt(0),
  newTTLsCount: BigInt(0),
  transfersCount: BigInt(0)
};

ENSRegistryWithFallback.NewOwner.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.ENSRegistryEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_1);
    const parent = await context.Domain.get(event.params.node);
    const domain = await context.Domain.get(makeSubnode(event.params.node, event.params.label));
    return { summary, parent, domain };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary, parent, domain } = loaderReturn;

    let currentSummaryEntity: ENSRegistryEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      newOwnersCount: currentSummaryEntity.newOwnersCount + BigInt(1)
    };

    let newOwnerEntity: NewOwner = {
      id: event.transaction.hash + event.logIndex.toString(),
      node: event.params.node,
      label: event.params.label,
      owner: event.params.owner,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_1
    };

    await context.ENSRegistryEventsSummary.set(nextSummaryEntity);
    await context.NewOwner.set(newOwnerEntity);

    let subNode = makeSubnode(event.params.node, event.params.label);
    let account: Account = { id: event.params.owner };

    if (domain !== undefined) {
      domain = {
        ...domain,
        parent_id: event.params.node,
        owner_id: event.params.owner,
        labelhash: event.params.label
      };
    } else {
      domain = {
        wrappedDomain_id: undefined,
        // registrar_id: undefined,
        registration_id: undefined,
        baseCost: undefined,
        expiryDate: undefined,
        isMigrated: true,
        labelName: undefined,
        name: undefined,
        parent_id: event.params.node,
        registrant_id: undefined,
        resolver_id: undefined,
        renewPremium: undefined,
        resolvedAddress_id: undefined,
        wrappedOwner_id: undefined,
        id: subNode,
        ttl: BigInt(0),
        owner_id: event.params.owner,
        createdAt: BigInt(event.block.timestamp),
        labelhash: event.params.label,
        subdomainCount: 0
      };
    }

    if (event.params.node == ETH_NODE) {
      domain = { ...domain, id: subNode, parent_id: event.params.node };
    }

    if (domain?.parent_id === undefined && parent !== undefined) {
      parent = {
        ...parent,
        subdomainCount: parent.subdomainCount + 1
      };

      domain = { ...domain, parent_id: event.params.node };
      await context.Domain.set(parent);
    }

    await context.Domain.set(domain);
    await context.Account.set(account);
  }
});

ENSRegistryWithFallback.NewResolver.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.ENSRegistryEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_1);
    let domain = await context.Domain.get(event.params.node);
    return { summary, domain };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary, domain } = loaderReturn;
    if (domain === undefined) {
      throw new Error("Domain is undefined - logic error");
    }

    let currentSummaryEntity: ENSRegistryEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      newResolversCount: currentSummaryEntity.newResolversCount + BigInt(1)
    };

    let newResolverEntity: NewResolver = {
      id: event.transaction.hash + event.logIndex.toString(),
      node: event.params.node,
      resolver: event.params.resolver,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_1
    };

    await context.ENSRegistryEventsSummary.set(nextSummaryEntity);
    await context.NewResolver.set(newResolverEntity);

    let id: string | null;

    if (event.params.resolver == "0x0000000000000000000000000000000000000000") {
      id = null;
    } else {
      id = createResolverID(event.params.resolver, event.params.node)
    }
    // let mutableDomain = domain;

    if (id) {
      let resolver = await context.Resolver.get(id);
      if (resolver === undefined) {
        resolver = {
          address: event.params.resolver,
          domain_id: event.params.node,
          id: id,
          /// Added
          addr_id: event.params.resolver,
          coinTypes: [],
          contentHash: undefined,
          texts: []
        }
        await context.Resolver.set(resolver);

        domain = { ...domain, resolvedAddress_id: undefined };
      } else {
        domain = { ...domain, resolvedAddress_id: resolver.addr_id };
      }
    } else {
      domain = { ...domain, resolvedAddress_id: undefined };
    }
    await context.Domain.set(domain);
  }
});

ENSRegistryWithFallback.NewTTL.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.ENSRegistryEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_1);
    const domain = await context.Domain.get(event.params.node);
    return { summary, domain };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary, domain } = loaderReturn;
    let currentSummaryEntity: ENSRegistryEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      newTTLsCount: currentSummaryEntity.newTTLsCount + BigInt(1)
    };

    let newTTLEntity: NewTTL = {
      id: event.transaction.hash + event.logIndex.toString(),
      node: event.params.node,
      ttl: event.params.ttl,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_1
    };

    await context.ENSRegistryEventsSummary.set(nextSummaryEntity);
    await context.NewTTL.set(newTTLEntity);

    if (domain !== undefined) {
      domain = { ...domain, ttl: event.params.ttl };
      await context.Domain.set(domain);
    }
  }
});

ENSRegistryWithFallback.Transfer.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.ENSRegistryEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_1);
    const domain = await context.Domain.get(event.params.node);
    return { summary, domain };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary, domain } = loaderReturn;

    let currentSummaryEntity: ENSRegistryEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      transfersCount: currentSummaryEntity.transfersCount + BigInt(1)
    };

    let transferEntity: Transfer = {
      id: event.transaction.hash + event.logIndex.toString(),
      node: event.params.node,
      owner: event.params.owner,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_1
    };

    await context.ENSRegistryEventsSummary.set(nextSummaryEntity);
    await context.Transfer.set(transferEntity);

    if (domain !== undefined) {
      domain = { ...domain, owner_id: event.params.owner };
      await context.Domain.set(domain);
    }
  }
});
