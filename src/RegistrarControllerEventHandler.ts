/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
  BaseRegistrar,
  ETHRegistrarController,
  EthRegistrarControllerOld,
  Account,
  BaseRegistrar_NameRegistered,
  BaseRegistrar_NameRenewed,
  BaseRegistrar_Transfer,
  Domain,
  EthRegistrarControllerEventSummary,
  EthRegistrarControllerOld_NameRegistered,
  EthRegistrarControllerOld_NameRenewed,
  NameRegistered,
  NameRenewed,
  Registration
} from "generated";

import { ETH_NODE, GRACE_PERIOD_SECONDS, makeSubnode, nameHash } from "./utils";

const GLOBAL_EVENTS_SUMMARY_KEY = "GlobalEthRegistrarControllerEventsSummary";

const INITIAL_EVENTS_SUMMARY: EthRegistrarControllerEventSummary = {
  id: GLOBAL_EVENTS_SUMMARY_KEY,
  nameRegisteredsCount: BigInt(0),
  nameRenewedsCount: BigInt(0),
  baseRegistrar_NameRegisteredCount: BigInt(0),
  baseRegistrar_NameRenewedCount: BigInt(0),
  baseRegistrar_TransferCount: BigInt(0),
  ethRegistrarControllerOld_NameRegisteredCount: BigInt(0),
  ethRegistrarControllerOld_NameRenewedCount: BigInt(0),
};

ETHRegistrarController.NameRegistered.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary } = loaderReturn;

    let currentSummaryEntity: EthRegistrarControllerEventSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      nameRegisteredsCount: currentSummaryEntity.nameRegisteredsCount + BigInt(1)
    };

    let nameRegisteredEntity: NameRegistered = {
      id: event.transaction.hash + event.logIndex.toString(),
      name: event.params.name,
      label: event.params.label,
      owner: event.params.owner,
      baseCost: event.params.baseCost,
      premium: event.params.premium,
      expires: event.params.expires,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY
    };

    await context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    await context.NameRegistered.set(nameRegisteredEntity);

    let name = event.params.name + ".eth";
    let node = nameHash(name);

    let domain: Domain = {
      registration_id: undefined,
      wrappedDomain_id: undefined,
      resolver_id: undefined,
      createdAt: BigInt(event.block.timestamp),
      isMigrated: true,
      labelName: event.params.name,
      resolvedAddress_id: undefined,
      id: node,
      registrant_id: event.params.owner,
      expiryDate: BigInt(event.params.expires + GRACE_PERIOD_SECONDS),
      labelhash: event.params.label,
      baseCost: event.params.baseCost,
      renewPremium: event.params.premium,
      name: event.params.name + ".eth",
      owner_id: event.params.owner,
      subdomainCount: 0,
      ttl: BigInt(0),
      parent_id: undefined,
      wrappedOwner_id: undefined
    }

    let acc: Account = { id: event.params.owner };
    let registration: Registration = {
      id: event.params.label,
      cost: BigInt(event.params.baseCost),
      domain_id: node,
      registrationDate: BigInt(event.block.timestamp),
      expiryDate: event.params.expires,
      registrant_id: acc.id
    };

    await context.Account.set(acc);
    await context.Domain.set(domain);
    await context.Registration.set(registration);
  }
});

ETHRegistrarController.NameRenewed.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);
    const domain = await context.Domain.get(makeSubnode(ETH_NODE, event.params.label));
    const registration = await context.Registration.get(event.params.label);
    return { summary, domain, registration };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary, domain, registration } = loaderReturn;

    let currentSummaryEntity: EthRegistrarControllerEventSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      nameRenewedsCount: currentSummaryEntity.nameRenewedsCount + BigInt(1)
    };

    let nameRenewedEntity: NameRenewed = {
      id: event.transaction.hash + event.logIndex.toString(),
      name: event.params.name,
      label: event.params.label,
      cost: event.params.cost,
      expires: event.params.expires,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY
    };

    await context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    await context.NameRenewed.set(nameRenewedEntity);

    if (registration) {
      registration = {
        ...registration,
        expiryDate: event.params.expires
      };
      await context.Registration.set(registration);
    }

    if (domain) {
      domain = {
        ...domain,
        expiryDate: BigInt(event.params.expires + GRACE_PERIOD_SECONDS)
      };
      await context.Domain.set(domain);
    }
  }
});

BaseRegistrar.NameRegistered.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { summary } = loaderReturn;

    const currentSummaryEntity: EthRegistrarControllerEventSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
      ...currentSummaryEntity,
      baseRegistrar_NameRegisteredCount: currentSummaryEntity.baseRegistrar_NameRegisteredCount + BigInt(1),
    };

    const baseRegistrar_NameRegisteredEntity: BaseRegistrar_NameRegistered = {
      id: event.transaction.hash + event.logIndex.toString(),
      eventId: event.params.id,
      owner: event.params.owner,
      expires: event.params.expires,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    await context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    await context.BaseRegistrar_NameRegistered.set(baseRegistrar_NameRegisteredEntity);
  }
});

BaseRegistrar.NameRenewed.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { summary } = loaderReturn;

    const currentSummaryEntity: EthRegistrarControllerEventSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
      ...currentSummaryEntity,
      baseRegistrar_NameRenewedCount: currentSummaryEntity.baseRegistrar_NameRenewedCount + BigInt(1),
    };

    const baseRegistrar_NameRenewedEntity: BaseRegistrar_NameRenewed = {
      id: event.transaction.hash + event.logIndex.toString(),
      eventId: event.params.id,
      expires: event.params.expires,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    await context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    await context.BaseRegistrar_NameRenewed.set(baseRegistrar_NameRenewedEntity);
  }
});

BaseRegistrar.Transfer.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { summary } = loaderReturn;

    const currentSummaryEntity: EthRegistrarControllerEventSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
      ...currentSummaryEntity,
      baseRegistrar_TransferCount: currentSummaryEntity.baseRegistrar_TransferCount + BigInt(1),
    };

    const baseRegistrar_TransferEntity: BaseRegistrar_Transfer = {
      id: event.transaction.hash + event.logIndex.toString(),
      from: event.params.from,
      to: event.params.to,
      tokenId: event.params.tokenId,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    await context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    await context.BaseRegistrar_Transfer.set(baseRegistrar_TransferEntity);
  }
});

EthRegistrarControllerOld.NameRegistered.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { summary } = loaderReturn;

    const currentSummaryEntity: EthRegistrarControllerEventSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
      ...currentSummaryEntity,
      ethRegistrarControllerOld_NameRegisteredCount: currentSummaryEntity.ethRegistrarControllerOld_NameRegisteredCount + BigInt(1),
    };

    const ethRegistrarControllerOld_NameRegisteredEntity: EthRegistrarControllerOld_NameRegistered = {
      id: event.transaction.hash + event.logIndex.toString(),
      name: event.params.name,
      label: event.params.label,
      owner: event.params.owner,
      cost: event.params.cost,
      expires: event.params.expires,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    await context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    await context.EthRegistrarControllerOld_NameRegistered.set(ethRegistrarControllerOld_NameRegisteredEntity);
  }
});

EthRegistrarControllerOld.NameRenewed.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.EthRegistrarControllerEventSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    const { summary } = loaderReturn;

    const currentSummaryEntity: EthRegistrarControllerEventSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    const nextSummaryEntity = {
      ...currentSummaryEntity,
      ethRegistrarControllerOld_NameRenewedCount: currentSummaryEntity.ethRegistrarControllerOld_NameRenewedCount + BigInt(1),
    };

    const ethRegistrarControllerOld_NameRenewedEntity: EthRegistrarControllerOld_NameRenewed = {
      id: event.transaction.hash + event.logIndex.toString(),
      name: event.params.name,
      label: event.params.label,
      cost: event.params.cost,
      expires: event.params.expires,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
    };

    await context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
    await context.EthRegistrarControllerOld_NameRenewed.set(ethRegistrarControllerOld_NameRenewedEntity);
  }
});
