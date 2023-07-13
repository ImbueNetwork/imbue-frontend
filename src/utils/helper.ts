/* eslint-disable no-unused-vars */
import ChainService from '@/redux/services/chainService';

import { initImbueAPIInfo } from './polkadot';
const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const { hexToU8a, isHex } = require('@polkadot/util');

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

export const getBalance = async (
  walletAddress: string,
  currency_id: number,
  user: any
) => {
  try {
    const imbueApi = await initImbueAPIInfo();
    const chainService = new ChainService(imbueApi, user);

    if (!walletAddress) return;
    const balance: any = await chainService.getBalance(
      walletAddress,
      currency_id
    );
    return balance;
  } catch (error) {
    return {
      status: 'failed',
      message: `An error occured while fetching balance.`,
    };
  }
};

export const isValidAddressPolkadotAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));

    return true;
  } catch (error) {
    return false;
  }
};
