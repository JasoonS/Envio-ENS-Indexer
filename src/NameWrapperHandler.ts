/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
  NameWrapper,
  Account,
  Domain,
  ExpiryExtended,
  FusesSet,
  NameUnwrapped,
  NameWrapped,
  NameWrapperEventsSummary,
  OwnershipTransferred,
  TransferBatch,
  TransferSingle,
  WrappedDomain
} from "generated";

import { ETH_NODE } from "./utils";

const GLOBAL_EVENTS_SUMMARY_KEY_2 = "GlobalEventsSummary";

const INITIAL_EVENTS_SUMMARY: NameWrapperEventsSummary = {
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
};

const PARENT_CANNOT_CONTROL: bigint = BigInt(65536);

function checkPccBurned(fuses: bigint): boolean {
  return (fuses & PARENT_CANNOT_CONTROL) == PARENT_CANNOT_CONTROL;
}

NameWrapper.ExpiryExtended.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.NameWrapperEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_2);
    const domain = await context.Domain.get(event.params.node);
    return { summary, domain };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary, domain } = loaderReturn;

    let currentSummaryEntity: NameWrapperEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      expiryExtendedsCount: currentSummaryEntity.expiryExtendedsCount + BigInt(1)
    };

    let expiryExtendedEntity: ExpiryExtended = {
      id: event.transaction.hash + event.logIndex.toString(),
      node: event.params.node,
      expiry: event.params.expiry,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    await context.NameWrapperEventsSummary.set(nextSummaryEntity);
    await context.ExpiryExtended.set(expiryExtendedEntity);

    if (domain !== undefined) {
      domain = { ...domain, expiryDate: event.params.expiry };
      await context.Domain.set(domain);
    }
  }
});

NameWrapper.FusesSet.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.NameWrapperEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_2);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary } = loaderReturn;

    let currentSummaryEntity: NameWrapperEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      fusesSetsCount: currentSummaryEntity.fusesSetsCount + BigInt(1)
    };

    let fusesSetEntity: FusesSet = {
      id: event.transaction.hash + event.logIndex.toString(),
      node: event.params.node,
      fuses: event.params.fuses,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    await context.NameWrapperEventsSummary.set(nextSummaryEntity);
    await context.FusesSet.set(fusesSetEntity);
  }
});

NameWrapper.NameUnwrapped.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.NameWrapperEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_2);
    const domain = await context.Domain.get(event.params.node);
    return { summary, domain };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary, domain } = loaderReturn;

    let currentSummaryEntity: NameWrapperEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      nameUnwrappedsCount: currentSummaryEntity.nameUnwrappedsCount + BigInt(1)
    };

    let nameUnwrappedEntity: NameUnwrapped = {
      id: event.transaction.hash + event.logIndex.toString(),
      node: event.params.node,
      owner: event.params.owner,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    await context.NameWrapperEventsSummary.set(nextSummaryEntity);
    await context.NameUnwrapped.set(nameUnwrappedEntity);

    if (domain !== undefined) {
      domain = {
        ...domain,
        wrappedOwner_id: undefined
      };

      if (domain.expiryDate && domain.parent_id !== ETH_NODE) {
        domain = { ...domain, expiryDate: undefined };
      }

      await context.Domain.set(domain);
    }
  }
});

NameWrapper.NameWrapped.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.NameWrapperEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_2);
    const domain = await context.Domain.get(event.params.node);
    const owner = await context.Account.get(event.params.owner);
    return { summary, domain, owner };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary, domain, owner } = loaderReturn;

    let currentSummaryEntity: NameWrapperEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      nameWrappedsCount: currentSummaryEntity.nameWrappedsCount + BigInt(1)
    };

    let nameWrappedEntity: NameWrapped = {
      id: event.transaction.hash + event.logIndex.toString(),
      node: event.params.node,
      name: event.params.name,
      owner: event.params.owner,
      fuses: event.params.fuses,
      expiry: event.params.expiry,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    await context.NameWrapperEventsSummary.set(nextSummaryEntity);
    await context.NameWrapped.set(nameWrappedEntity);

    let domainID = event.params.node;

    if (owner === undefined) {
      owner = <Account>{
        id: event.params.owner
      };
      await context.Account.set(owner);
    }

    if (domain !== undefined) {
      domainID = domain.id;
      domain = {
        ...domain,
        name: event.params.name,
        owner_id: owner.id,
        wrappedOwner_id: owner.id
      };

      if (
        checkPccBurned(event.params.fuses) &&
        (!domain.expiryDate || event.params.expiry > domain.expiryDate!)
      ) {
        domain = { ...domain, expiryDate: event.params.expiry };
      }

      await context.Domain.set(domain);
    }

    let wrappedDomain: WrappedDomain = {
      domain_id: domainID,
      expiryDate: event.params.expiry,
      fuses: event.params.fuses,
      id: event.params.node,
      name: event.params.name,
      owner_id: event.params.owner
    };
    await context.WrappedDomain.set(wrappedDomain);
  }
});

NameWrapper.OwnershipTransferred.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.NameWrapperEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_2);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary } = loaderReturn;

    let currentSummaryEntity: NameWrapperEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      ownershipTransferredsCount:
        currentSummaryEntity.ownershipTransferredsCount + BigInt(1)
    };

    let ownershipTransferredEntity: OwnershipTransferred = {
      id: event.transaction.hash + event.logIndex.toString(),
      previousOwner: event.params.previousOwner,
      newOwner: event.params.newOwner,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    await context.NameWrapperEventsSummary.set(nextSummaryEntity);
    await context.OwnershipTransferred.set(ownershipTransferredEntity);
  }
});

NameWrapper.TransferBatch.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.NameWrapperEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_2);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary } = loaderReturn;

    let currentSummaryEntity: NameWrapperEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      transferBatchsCount: currentSummaryEntity.transferBatchsCount + BigInt(1)
    };

    let transferBatchEntity: TransferBatch = {
      id: event.transaction.hash + event.logIndex.toString(),
      operator: event.params.operator,
      from: event.params.from,
      to: event.params.to,
      ids: event.params.ids,
      values: event.params.values,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    await context.NameWrapperEventsSummary.set(nextSummaryEntity);
    await context.TransferBatch.set(transferBatchEntity);
  }
});

NameWrapper.TransferSingle.handlerWithLoader({
  loader: async ({ event, context }) => {
    const summary = await context.NameWrapperEventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY_2);
    return { summary };
  },
  handler: async ({ event, context, loaderReturn }) => {
    let { summary } = loaderReturn;

    let currentSummaryEntity: NameWrapperEventsSummary =
      summary ?? INITIAL_EVENTS_SUMMARY;

    let nextSummaryEntity = {
      ...currentSummaryEntity,
      transferSinglesCount: currentSummaryEntity.transferSinglesCount + BigInt(1)
    };

    let transferSingleEntity: TransferSingle = {
      id: event.transaction.hash + event.logIndex.toString(),
      operator: event.params.operator,
      from: event.params.from,
      to: event.params.to,
      eventId: event.params.id,
      value: event.params.value,
      eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_2
    };

    await context.NameWrapperEventsSummary.set(nextSummaryEntity);
    await context.TransferSingle.set(transferSingleEntity);
  }
});
