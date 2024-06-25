import { styled } from "../../styled-system/jsx";
import { type ButtonVariantProps, button } from "../../styled-system/recipes";
import type { JsxStyleProps } from "../../styled-system/types";
import type { Assign } from "@ark-ui/react";
import { type HTMLArkProps, ark } from "@ark-ui/react/factory";

export interface ButtonProps
  extends Assign<JsxStyleProps, HTMLArkProps<"button">>,
    ButtonVariantProps {}
export const Button = styled(ark.button, button);
