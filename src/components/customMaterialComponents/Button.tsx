import { Buttons, buttonStyleBasedOnVariantPassed } from "@/utils/helper";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import React from "react";

type ButtonProps = {
  customstyle?: React.CSSProperties;
};

type CustomButtonProps = {
  text: string;
  btnWrapStyle?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  hoverStyle?: React.CSSProperties;
  variant?: Buttons;
  onClick?: () => void;
};

const CustomButton = ({
  text,
  btnWrapStyle,
  textStyle,
  variant = Buttons.OUTLINED,
  hoverStyle,
  onClick = () => {},
}: CustomButtonProps): JSX.Element => {
  const buttonDefaultStyle = buttonStyleBasedOnVariantPassed(variant);

  const ButtonWrap = styled(Button)(({ customstyle }: ButtonProps) => ({
    ...buttonDefaultStyle.style,
    "&": {
      ...customstyle,
    },
    ":hover": {
      ...hoverStyle,
    },
  }));

  return (
    <ButtonWrap
      variant={variant}
      customstyle={btnWrapStyle}
      disableRipple
      className="button-container"
      onClick={onClick}
    >
      <p className="button-label" style={{ ...textStyle }}>
        {text}
      </p>
    </ButtonWrap>
  );
};

export default CustomButton;
