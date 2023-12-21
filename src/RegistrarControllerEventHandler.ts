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
  NameRegisteredEntity,
  NameRenewedEntity,
  OwnershipTransferredEntity
} from "./src/Types.gen";
import {byteArrayFromHex, concat, ETH_NODE, uint256ToByteArray, uint8ArrayToHexString} from "./utils";
import keccak256 from "keccak256/keccak256";

const GLOBAL_EVENTS_SUMMARY_KEY = "GlobalEthRegistrarControllerEventsSummary";

const INITIAL_EVENTS_SUMMARY: EthRegistrarControllerEventSummaryEntity = {
  id: GLOBAL_EVENTS_SUMMARY_KEY,
  nameRegisteredsCount: BigInt(0),
  nameRenewedsCount: BigInt(0),
  ownershipTransferredsCount: BigInt(0)
};

const GRACE_PERIOD_SECONDS = BigInt(7776000); // 90 days

var rootNode: Uint8Array = byteArrayFromHex(ETH_NODE);

ETHRegistrarControllerContract_NameRegistered_loader(({ event, context }) => {
  context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
  context.Registration.load(event.params.label, {});
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
  context.Account.set(acc);

  let label = uint256ToByteArray(BigInt(event.transactionIndex));
  let registration = context.Registration.get(event.params.label);
  let domain = context.Domain.get(
    keccak256(uint8ArrayToHexString(concat(rootNode, label))).toString()
  )!;

  let nameMeta: DomainNameMetaEntity = {
    domain: domain.id,
    id: event.params.name
  };

  domain = <DomainEntity>{
    id: keccak256(uint8ArrayToHexString(concat(rootNode, label))).toString(),
    ttl: BigInt(0),
    name: event.params.name + ".eth",
    owner: event.params.owner,
    srcAddress: event.srcAddress,
    subdomainCount: 0,
    expiryDate: BigInt(event.params.expires + GRACE_PERIOD_SECONDS),
    baseCost: event.params.baseCost,
    renewPremium: event.params.premium,
    blockTimestamp: event.blockTimestamp,
    label: event.params.label,
    registrant: event.params.owner
  };

  registration = {
    ...registration,
    cost: BigInt(event.params.baseCost),
    id: event.params.label,
    domain: domain.id,
    registrationDate: BigInt(event.blockTimestamp),
    expiryDate: event.params.expires,
    registrant: acc.id
  };

  context.EthRegistrarControllerEventSummary.set(nextSummaryEntity);
  context.NameRegistered.set(nameRegisteredEntity);
  context.Domain.set(domain);
  context.DomainNameMeta.set(nameMeta);
  context.Registration.set(registration);
});

ETHRegistrarControllerContract_NameRenewed_loader(({ event, context }) => {
  context.EthRegistrarControllerEventSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
  context.Registration.load(event.params.label, {});
});

ETHRegistrarControllerContract_NameRenewed_handler(({ event, context }) => {
  let summary = context.EthRegistrarControllerEventSummary.get(
    GLOBAL_EVENTS_SUMMARY_KEY
  );
  let registration = context.Registration.get(event.params.label)!;
  let label = uint256ToByteArray(BigInt(event.transactionIndex));
  let domain = context.Domain.get(
    keccak256(uint8ArrayToHexString(concat(rootNode, label))).toString()
  )!;

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
