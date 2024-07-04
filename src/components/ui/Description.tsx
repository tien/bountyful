import { css } from "../../../styled-system/css";
import { Text } from "./Text";
import { ReactNode } from "react";

type DescriptionProps = {
  term: ReactNode;
  details: ReactNode;
};

export function Description(props: DescriptionProps) {
  return (
    <div>
      <Text as="label" className={css({ display: "inline", fontWeight: 600 })}>
        {props.term}:{" "}
      </Text>
      <Text as="span">{props.details}</Text>
    </div>
  );
}
