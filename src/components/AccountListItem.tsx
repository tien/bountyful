import { shortenAddress } from "../utils";
import Identicon from "./ui/Identicon/Identicon";
import { ListItem } from "./ui/ListItem";
import { ReactNode } from "react";

type AccountListItemProps = {
  address: string;
  label?: ReactNode;
};

export const AccountListItem = (props: AccountListItemProps) => (
  <ListItem
    leadingContent={<Identicon address={props.address} size="2rem" />}
    overlineContent={props.label}
    headlineContent={shortenAddress(props.address)}
  />
);
