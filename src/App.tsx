import { AccountListItem } from "./components/AccountListItem";
import { Button } from "./components/ui/Button";
import * as Card from "./components/ui/Card";
import { Description } from "./components/ui/Description";
import { Heading } from "./components/ui/Heading";
import { Progress } from "./components/ui/Progress";
import { Text } from "./components/ui/Text";
import config from "./config";
import { useNativeTokenNumberWithPlanck } from "./hooks/useNativeTokenNumber";
import { css } from "./styled-system/css";
import { Collapsible } from "@ark-ui/react";
import type {
  BountiesBountyStatus,
  ChildBountyStatus,
} from "@polkadot-api/descriptors";
import {
  ReDotChainProvider,
  ReDotProvider,
  useLazyLoadQuery,
} from "@reactive-dot/react";
import ChevronDown from "@w3f/polkadot-icons/solid/ChevronDown";
import ChevronUp from "@w3f/polkadot-icons/solid/ChevronUp";
import type { SS58String } from "polkadot-api";
import { Suspense } from "react";

type ChildBountyProps = {
  number: number;
  value: bigint;
  fee: bigint;
  curator_deposit: bigint;
  status: ChildBountyStatus;
  parent_bounty: number;
};

function ChildBounty(props: ChildBountyProps) {
  const description = useLazyLoadQuery((builder) =>
    builder.readStorage("ChildBounties", "ChildBountyDescriptions", [
      props.number,
    ]),
  );

  return (
    <article
      className={css({ bg: "bg.emphasized", rounded: "l3", padding: "2rem" })}
    >
      <header className={css({ marginBottom: "1rem" })}>
        <Heading as="h5">Child bounty #{props.number}</Heading>
        <Text size="sm" className={css({ color: "fg.muted" })}>
          {description?.asText()}
        </Text>
      </header>
      <div
        className={css({ display: "flex", gap: "1rem", marginBottom: "1rem" })}
      >
        {props.status.type !== "Added" && (
          <AccountListItem
            label="Sub-curator"
            address={props.status.value.curator}
          />
        )}
        {props.status.type === "PendingPayout" && (
          <AccountListItem
            label="Beneficiary"
            address={props.status.value.beneficiary}
          />
        )}
      </div>
      <Description term="Status" details={props.status.type} />
      <Description
        term="Value"
        details={useNativeTokenNumberWithPlanck(props.value).toLocaleString()}
      />
    </article>
  );
}

type BountyProps = {
  number: number;
  proposer: SS58String;
  value: bigint;
  fee: bigint;
  curator_deposit: bigint;
  bond: bigint;
  status: BountiesBountyStatus;
};

function BountyCard(props: BountyProps) {
  const [description, childBounties] = useLazyLoadQuery((builder) =>
    builder
      .readStorage("Bounties", "BountyDescriptions", [props.number])
      .readStorageEntries("ChildBounties", "ChildBounties", [props.number]),
  );

  return (
    <article className={css({ display: "contents" })}>
      <Card.Root>
        <Collapsible.Root>
          <Collapsible.Trigger
            className={css({
              textAlign: "start",
              width: "100%",
              cursor: "pointer",
            })}
          >
            <Card.Header
              className={css({
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.5rem",
              })}
            >
              <div>
                <Card.Title>
                  Bounty #{props.number}{" "}
                  {childBounties.length > 0 ? (
                    <>
                      ({childBounties.length} child{" "}
                      {childBounties.length === 1 ? "bounty" : "bounties"})
                    </>
                  ) : null}
                </Card.Title>
                <Card.Description>{description?.asText()}</Card.Description>
              </div>
              <Collapsible.Context>
                {({ open }) =>
                  open ? (
                    <ChevronUp fill="currentcolor" />
                  ) : (
                    <ChevronDown fill="currentcolor" />
                  )
                }
              </Collapsible.Context>
            </Card.Header>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Card.Body>
              <div
                className={css({
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "1rem",
                })}
              >
                <AccountListItem label="Proposer" address={props.proposer} />
                {(props.status.type === "Active" ||
                  props.status.type === "CuratorProposed" ||
                  props.status.type === "PendingPayout") && (
                  <AccountListItem
                    label="Curator"
                    address={props.status.value.curator}
                  />
                )}
              </div>
              <Description term="Status" details={props.status.type} />
              <Description
                className={css({
                  display: props.value === 0n ? "none" : undefined,
                })}
                term="Value"
                details={useNativeTokenNumberWithPlanck(
                  props.value,
                ).toLocaleString()}
              />
              <Description
                className={css({
                  display: props.bond === 0n ? "none" : undefined,
                })}
                term="Bond"
                details={useNativeTokenNumberWithPlanck(
                  props.bond,
                ).toLocaleString()}
              />
              <Description
                className={css({
                  display: props.fee === 0n ? "none" : undefined,
                })}
                term="Fee"
                details={useNativeTokenNumberWithPlanck(
                  props.fee,
                ).toLocaleString()}
              />
              <Description
                term="Curator deposit"
                className={css({
                  display: props.curator_deposit === 0n ? "none" : undefined,
                })}
                details={useNativeTokenNumberWithPlanck(
                  props.curator_deposit,
                ).toLocaleString()}
              />
              {childBounties.length > 0 && (
                <section>
                  <Collapsible.Root>
                    <Collapsible.Trigger>
                      <Button className={css({ margin: "1rem 0" })}>
                        <header>
                          <Heading as="h4" size="lg">
                            Child bounties {childBounties.length}
                          </Heading>
                        </header>
                        <Collapsible.Context>
                          {({ open }) =>
                            open ? (
                              <ChevronUp fill="currentcolor" />
                            ) : (
                              <ChevronDown fill="currentcolor" />
                            )
                          }
                        </Collapsible.Context>
                      </Button>
                    </Collapsible.Trigger>
                    <Collapsible.Content
                      className={css({
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      })}
                    >
                      {childBounties.map(
                        ({
                          keyArgs: [_, childBountyNumber],
                          value: childBounty,
                        }) => (
                          <Suspense
                            key={childBountyNumber}
                            fallback={<Progress value={null} />}
                          >
                            <ChildBounty
                              number={childBountyNumber}
                              {...childBounty}
                            />
                          </Suspense>
                        ),
                      )}
                    </Collapsible.Content>
                  </Collapsible.Root>
                </section>
              )}
            </Card.Body>
          </Collapsible.Content>
        </Collapsible.Root>
      </Card.Root>
    </article>
  );
}

function DApp() {
  const bounties = useLazyLoadQuery((builder) =>
    builder.readStorageEntries("Bounties", "Bounties", []),
  );

  return (
    <main>
      <header className={css({ textAlign: "center" })}>
        <Heading as="h1" size="7xl">
          Bountyful
        </Heading>
        <Heading as="h2" size="xl">
          There are currently {bounties.length}{" "}
          {bounties.length === 1 ? "bounty" : "bounties"}
        </Heading>
      </header>
      <section
        className={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        })}
      >
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            padding: "2rem",
            maxWidth: "50rem",
          })}
        >
          {bounties.map(({ keyArgs: [bountyNumber], value: bounty }) => (
            <Suspense key={bountyNumber} fallback={<Progress value={null} />}>
              <BountyCard number={bountyNumber} {...bounty} />
            </Suspense>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <ReDotProvider config={config}>
      <ReDotChainProvider chainId="polkadot">
        <Suspense
          fallback={
            <div
              className={css({
                position: "fixed",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              })}
            >
              <Progress type="circular" value={null} />
            </div>
          }
        >
          <DApp />
        </Suspense>
      </ReDotChainProvider>
    </ReDotProvider>
  );
}
