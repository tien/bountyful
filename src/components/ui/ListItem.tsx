import { css } from "../../styled-system/css";
import { ReactNode } from "react";

type ListItemProps = {
  leadingContent?: ReactNode;
  overlineContent?: ReactNode;
  headlineContent: ReactNode;
  supportingContent?: ReactNode;
};

export const ListItem = (props: ListItemProps) => (
  <article
    className={css({ display: "flex", alignItems: "center", gap: "0.5rem" })}
  >
    {props.leadingContent && (
      <div className={css({ width: "2rem", height: "2rem" })}>
        {props.leadingContent}
      </div>
    )}
    <div>
      {props.overlineContent && (
        <div className={css({ fontWeight: "bold" })}>
          {props.overlineContent}
        </div>
      )}
      <div>{props.headlineContent}</div>
    </div>
  </article>
);
