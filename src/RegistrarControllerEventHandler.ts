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
    DomainNameMetaEntity,
    EthRegistrarControllerEventSummaryEntity,
    LabelMetaEntity,
    NameRegisteredEntity,
    NameRenewedEntity,
    OwnershipTransferredEntity
} from "./src/Types.gen";

const GLOBAL_EVENTS_SUMMARY_KEY = "GlobalEthRegistrarControllerEventsSummary";

const INITIAL_EVENTS_SUMMARY: EthRegistrarControllerEventSummaryEntity = {
  id: GLOBAL_EVENTS_SUMMARY_KEY,
  nameRegisteredsCount: BigInt(0),
  nameRenewedsCount: BigInt(0),
  ownershipTransferredsCount: BigInt(0)
};

ETHRegistrarControllerContract_NameRegistered_loader(({ event, context }) => {
  context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
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

  let acc: AccountEntity = { id: event.params.owner };

  let nameMeta: DomainNameMetaEntity = {
    domain: event.transactionHash + event.logIndex.toString(),
    id: event.params.name
  };

  let label: LabelMetaEntity = {
    domain: event.transactionHash + event.logIndex.toString(),
    id: event.params.name
  };

  let domain: DomainEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    isMigrated: false,
    ttl: BigInt(0),
    name: event.params.name,
    owner: event.params.owner,
    srcAddress: event.srcAddress,
    resolver: null,
    parent: null,
    node: null,
    subdomainCount: 0,
    expiryDate: event.params.expires,
    baseCost: event.params.baseCost,
    renewPremium: event.params.premium,
    blockTimestamp: event.blockTimestamp,
    label: event.params.label
  };

  context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
  context.NameRegistered.set(nameRegisteredEntity);
  context.Account.set(acc);
  context.Domain.set(domain);
  context.DomainNameMeta.set(nameMeta);
  context.LabelMeta.set(label);
});

ETHRegistrarControllerContract_NameRenewed_loader(({ event, context }) => {
  context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

ETHRegistrarControllerContract_NameRenewed_handler(({ event, context }) => {
  let summary = context.EthRegistrarControllerEventSummary.get(
    GLOBAL_EVENTS_SUMMARY_KEY
  );
  let meta = context.DomainNameMeta.get(event.params.name);

  if (meta !== undefined) {
    let domain = context.DomainNameMeta.getDomain(meta);
    domain = {
      ...domain,
      expiryDate: event.params.expires
    };
    context.Domain.set(domain);
  }

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
