const buttonType = {
  outline: {
    style: {
      '&': {
        border: 'var(--secondary-button-border)',
      },
      '&:hover': {
        backgroundColor: 'var(--secondary-button-background-hover-color)',
        border: 'var(--secondary-button-border)',
      },
    },
    text: {
      color: 'white',
    },
  },
  contained: {},
};

export enum Buttons {
  CONTAINED = 'contained',
  OUTLINED = 'outlined',
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

export function findObjectsByName(
  names: string[],
  objects: { name: string; id: number }[]
): { name: string; id: number }[] {
  const matchedObjects: { name: string; id: number }[] = [];
  for (const object of objects) {
    if (names.includes(object.name)) {
      matchedObjects.push({ name: object.name, id: object.id });
    }
  }
  return matchedObjects;
}
