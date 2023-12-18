/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
  ENSRegistryWithFallbackContract_ApprovalForAll_handler,
  ENSRegistryWithFallbackContract_ApprovalForAll_loader,
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
  ApprovalForAllEntity,
  DomainEntity,
  DomainNodeEntity,
  ENSRegistryEventsSummaryEntity,
  NewOwnerEntity,
  NewResolverEntity,
  NewTTLEntity,
  TransferEntity
} from "./src/Types.gen";

const GLOBAL_EVENTS_SUMMARY_KEY_1 = "GlobalENSRegistryEventsSummary";

const INITIAL_EVENTS_SUMMARY: ENSRegistryEventsSummaryEntity = {
  id: GLOBAL_EVENTS_SUMMARY_KEY_1,
  approvalForAllsCount: BigInt(0),
  newOwnersCount: BigInt(0),
  newResolversCount: BigInt(0),
  newTTLsCount: BigInt(0),
  transfersCount: BigInt(0)
};

ENSRegistryWithFallbackContract_ApprovalForAll_loader(({ event, context }) => {
  context.ENSRegistryEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_1);
});

ENSRegistryWithFallbackContract_ApprovalForAll_handler(({ event, context }) => {
  let summary = context.ENSRegistryEventsSummary.get(
    GLOBAL_EVENTS_SUMMARY_KEY_1
  );

  let currentSummaryEntity: ENSRegistryEventsSummaryEntity =
    summary ?? INITIAL_EVENTS_SUMMARY;

  let nextSummaryEntity = {
    ...currentSummaryEntity,
    approvalForAllsCount: currentSummaryEntity.approvalForAllsCount + BigInt(1)
  };

  let approvalForAllEntity: ApprovalForAllEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    owner: event.params.owner,
    operator: event.params.operator,
    approved: event.params.approved,
    eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY_1
  };

  context.ENSRegistryEventsSummary.set(nextSummaryEntity);
  context.ApprovalForAll.set(approvalForAllEntity);
});

ENSRegistryWithFallbackContract_NewOwner_loader(({ event, context }) => {
  context.ENSRegistryEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_1);
  context.LabelMeta.load(event.params.label, {
    loaders: { loadDomain: {} }
  });
});

ENSRegistryWithFallbackContract_NewOwner_handler(({ event, context }) => {
  let summary = context.ENSRegistryEventsSummary.get(
    GLOBAL_EVENTS_SUMMARY_KEY_1
  );
  let label = context.LabelMeta.get(event.params.label);

  if (label !== undefined) {
    let parent = context.LabelMeta.getDomain(label);
    let node: DomainNodeEntity = { domain: parent.id, id: event.params.node };

    let domain: DomainEntity = {
      id: event.transactionHash + event.logIndex.toString(),
      isMigrated: false,
      ttl: BigInt(0),
      name: "",
      owner: event.params.owner,
      srcAddress: event.srcAddress,
      resolver: null,
      parent: parent.id,
      node: event.params.node,
      subdomainCount: 0,
      expiryDate: parent.expiryDate,
      baseCost: parent.baseCost,
      renewPremium: parent.renewPremium,
      blockTimestamp: event.blockTimestamp,
      label: event.params.label
    };

    context.Domain.set(domain);
    context.DomainNode.set(node);
  }

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
});

ENSRegistryWithFallbackContract_NewResolver_loader(({ event, context }) => {
  context.ENSRegistryEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_1);
  context.DomainNode.load(event.params.node, { loaders: { loadDomain: {} } });
});

ENSRegistryWithFallbackContract_NewResolver_handler(({ event, context }) => {
  let summary = context.ENSRegistryEventsSummary.get(
    GLOBAL_EVENTS_SUMMARY_KEY_1
  );
  let node = context.DomainNode.get(event.params.node);

  if (node !== undefined) {
    let domain = context.DomainNode.getDomain(node);
    domain = { ...domain, resolver: event.params.resolver };
    context.Domain.set(domain);
  }

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
});

ENSRegistryWithFallbackContract_NewTTL_loader(({ event, context }) => {
  context.ENSRegistryEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_1);
  context.DomainNode.load(event.params.node, { loaders: { loadDomain: {} } });
});

ENSRegistryWithFallbackContract_NewTTL_handler(({ event, context }) => {
  let summary = context.ENSRegistryEventsSummary.get(
    GLOBAL_EVENTS_SUMMARY_KEY_1
  );
  let node = context.DomainNode.get(event.params.node);

  if (node !== undefined) {
    let domain = context.DomainNode.getDomain(node);
    domain = { ...domain, ttl: event.params.ttl };
    context.Domain.set(domain);
  }

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
});

ENSRegistryWithFallbackContract_Transfer_loader(({ event, context }) => {
  context.ENSRegistryEventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY_1);
  context.DomainNode.load(event.params.node, { loaders: { loadDomain: {} } });
});

ENSRegistryWithFallbackContract_Transfer_handler(({ event, context }) => {
  let summary = context.ENSRegistryEventsSummary.get(
    GLOBAL_EVENTS_SUMMARY_KEY_1
  );
  let node = context.DomainNode.get(event.params.node);

  if (node !== undefined) {
    let domain = context.DomainNode.getDomain(node);
    domain = { ...domain, owner: event.params.owner };
    context.Domain.set(domain);
  }

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
});
