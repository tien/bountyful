import { Text, type TextProps } from "./Text";
import { forwardRef } from "react";

type HeadingProps<C extends React.ElementType> = TextProps<C>;

type PolymorphicComponent = <C extends React.ElementType = "h2">(
  props: HeadingProps<C>,
) => React.ReactNode | null;

// @ts-expect-error TODO: fix this
export const Heading: PolymorphicComponent = forwardRef((props, ref) => (
  <Text as="h2" variant="heading" ref={ref} {...props} />
));
