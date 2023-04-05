const buttonType = {
  outline: {
    style: {
      "&": {
        border: "var(--secondary-button-border)",
      },
      "&:hover": {
        backgroundColor: "var(--secondary-button-background-hover-color)",
        border: "var(--secondary-button-border)",
      },
    },
    text: {
      color: "white",
    },
  },
  contained: {},
};

export enum Buttons {
  CONTAINED = "contained",
  OUTLINED = "outlined",
}

export const buttonStyleBasedOnVariantPassed = (
  variant: string
): Record<any, any> => {
  switch (variant) {
    case Buttons.OUTLINED:
      return buttonType.outline;
    case Buttons.CONTAINED:
      return buttonType.contained;

    default:
      return buttonType.outline;
  }
};
