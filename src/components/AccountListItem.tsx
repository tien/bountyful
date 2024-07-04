import { css } from "../styled-system/css";
import { shortenAddress } from "../utils";
import Identicon from "./ui/Identicon/Identicon";
import { ListItem } from "./ui/ListItem";
import { useLazyLoadQuery } from "@reactive-dot/react";
import { ReactNode, Suspense } from "react";

type IdentityProps = {
  address: string;
};

function Identity(props: IdentityProps) {
  const identity = useLazyLoadQuery((builder) =>
    builder.readStorage("Identity", "IdentityOf", [props.address]),
  );

  const identityDisplay = identity?.[0].info.display.value;

  const displayName =
    identityDisplay !== undefined &&
    typeof identityDisplay !== "number" &&
    "asText" in identityDisplay
      ? identityDisplay.asText()
      : shortenAddress(props.address);

  return <span>{displayName}</span>;
}

type AccountListItemProps = {
  address: string;
  label?: ReactNode;
};

export function AccountListItem(props: AccountListItemProps) {
  return (
    <a
      className={css({ display: "contents" })}
      href={`https://polkadot.subscan.io/account/${props.address}`}
      target="_blank"
    >
      <ListItem
        leadingContent={<Identicon address={props.address} size="2rem" />}
        overlineContent={props.label}
        headlineContent={
          <Suspense fallback="...">
            <Identity address={props.address} />
          </Suspense>
        }
      />
    </a>
  );
}
