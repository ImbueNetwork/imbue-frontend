/* eslint-disable no-unused-vars */
import ChainService from '@/redux/services/chainService';
import { getProjectBalance } from '@/redux/services/projectServices';

import { initImbueAPIInfo } from './polkadot';
const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const { hexToU8a, isHex } = require('@polkadot/util');

interface MilestoneItem {
  name: string;
  amount: number | undefined;
  description: string;
}

export interface MilestoneError {
  name?: string;
  amount?: string;
  description?: string;
}

interface InputErrorType {
  title?: string;
  description?: string;
  approvers?: string;
  milestones: Array<{ name?: string; amount?: string; description?: string }>;
}

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
  user: any,
  projectId?: number
) => {
  try {
    if(!projectId) {
      const imbueApi = await initImbueAPIInfo();
      const chainService = new ChainService(imbueApi, user);
  
      if (!walletAddress) return;
      const balance: any = await chainService.getBalance(
        walletAddress,
        currency_id
      );
      return balance;
    } else {
      return getProjectBalance(projectId);
    }

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

export const validateApplicationInput = (
  application: 'brief' | 'grant',
  inputErrors: InputErrorType,
  milestones: MilestoneItem[],
  title?: string,
  description?: string,
  approvers?: any
) => {
  let isValid = true;
  let firstErrorIndex = -1;
  const newMilestones: any = [];
  let newInputs: InputErrorType = {
    ...inputErrors,
    approvers: '',
    milestones: newMilestones,
  };
  const blockUnicodeRegex = /^[\x20-\x7E]*$/;

  if (
    (title === undefined ||
      title === null ||
      title.length === 0 ||
      !blockUnicodeRegex.test(title)) &&
    application === 'grant'
  ) {
    isValid = false;
    firstErrorIndex = 0;
    newInputs = {
      ...newInputs,
      title: 'Please enter a valid grant title',
    };
  }

  if (!validateInputLength(title, 10, 50) && application === 'grant') {
    isValid = false;
    firstErrorIndex = 0;
    newInputs = {
      ...newInputs,
      title: 'Grant title should be between 10 - 50 characters',
    };
  }

  if (
    (description === undefined ||
      description === null ||
      description.length === 0) &&
    application === 'grant'
  ) {
    isValid = false;
    firstErrorIndex = firstErrorIndex === -1 ? 1 : firstErrorIndex;
    newInputs = {
      ...newInputs,
      description: 'Please enter a valid grant description',
    };
  }

  if (!validateInputLength(description, 50, 5000) && application === 'grant') {
    isValid = false;
    firstErrorIndex = firstErrorIndex === -1 ? 1 : firstErrorIndex;
    newInputs = {
      ...newInputs,
      description: 'Grant description should be between 50 - 5000 characters',
    };
  }

  if (approvers?.length < 4 && application === 'grant') {
    isValid = false;
    firstErrorIndex = firstErrorIndex === -1 ? 2 : firstErrorIndex;
    newInputs = {
      ...newInputs,
      approvers: 'Please select atleast 4 valid grant approvers',
    };
  }

  for (let i = 0; i < milestones.length; i++) {
    const { amount = 0, name, description } = milestones[i];

    if (
      name === undefined ||
      name === null ||
      name.length === 0 ||
      !blockUnicodeRegex.test(name)
    ) {
      newMilestones[i] = {
        ...newMilestones[i],
        name: 'A valid name is required',
      };
      isValid = false;
      firstErrorIndex = firstErrorIndex === -1 ? i + 3 : firstErrorIndex;
    } else if (name.length < 10) {
      newMilestones[i] = {
        ...newMilestones[i],
        name: 'Milestone title should be between 10 - 50 characters',
      };
      isValid = false;
      firstErrorIndex = firstErrorIndex === -1 ? i + 3 : firstErrorIndex;
    }

    if (
      amount === undefined ||
      amount === null ||
      amount === 0 ||
      amount > 1e8
    ) {
      newMilestones[i] = {
        ...newMilestones[i],
        amount: 'A valid amount is required. Must be less than 100,000,000',
      };
      isValid = false;
      firstErrorIndex = firstErrorIndex === -1 ? i + 3 : firstErrorIndex;
    }

    if (
      description === undefined ||
      description === null ||
      description.length === 0
    ) {
      newMilestones[i] = {
        ...newMilestones[i],
        description: 'A valid description is required.',
      };
      isValid = false;
      firstErrorIndex = firstErrorIndex === -1 ? i + 3 : firstErrorIndex;
    } else if (description.length < 50) {
      newMilestones[i] = {
        ...newMilestones[i],
        description:
          'Milestone description should be between 50 - 5000 characters.',
      };
      isValid = false;
      firstErrorIndex = firstErrorIndex === -1 ? i + 3 : firstErrorIndex;
    }
  }

  const errors = { ...newInputs, milestones: newMilestones };

  return { isValid, firstErrorIndex, errors };
};

export const isUrlAndSpecialCharacterExist = (text: string) => {
  const pattern =
    /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;
  const pattern1 = /[^A-Za-z0-9_ ]/g;
  const testUrl = pattern.test(text) || pattern1.test(text);
  return testUrl;
};

export const isUrlExist = (text: string) => {
  const pattern =
    /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;
  const testUrl = pattern.test(text);
  return testUrl;
};

export const validateInputLength = (
  text: string | undefined,
  min: number,
  max: number
): boolean => {
  return text !== undefined && text?.length >= min && text?.length <= max;
};

export const handleApplicationInput = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  milestoneIndex: number | undefined = undefined,
  inputErrors: InputErrorType,
  milestones: any,
  title: string,
  description: string
) => {
  const { name, value } = event.target;

  const milestoneErrors: any = [...inputErrors.milestones];
  let newInputErrors = { ...inputErrors };

  switch (name) {
    case 'mainTitle':
      title = value;
      if (validateInputLength(value, 10, 50)) {
        newInputErrors = { ...inputErrors, title: '' };
      } else {
        newInputErrors = {
          ...inputErrors,
          title: 'Grant title should be between 10 - 50 characters',
        };
      }
      break;
    case 'mainDescription':
      description = value;
      if (validateInputLength(value, 50, 5000)) {
        newInputErrors = { ...inputErrors, description: '' };
      } else {
        newInputErrors = {
          ...inputErrors,
          description:
            'Grant description should be between 50 - 5000 characters',
        };
      }
      break;
    case 'milestoneTitle':
      if (milestoneIndex === undefined) break;
      milestones = [
        ...milestones.slice(0, milestoneIndex),
        {
          ...milestones[milestoneIndex],
          name: value,
        },
        ...milestones.slice(milestoneIndex + 1),
      ];
      if (validateInputLength(value, 10, 50)) {
        milestoneErrors[milestoneIndex] = {
          ...milestoneErrors[milestoneIndex],
          name: '',
        };
      } else {
        milestoneErrors[milestoneIndex] = {
          ...milestoneErrors[milestoneIndex],
          name: 'A valid milestone title is required between 10 - 50 characters',
        };
      }
      break;
    case 'milestoneDescription':
      if (milestoneIndex === undefined) break;
      milestones = [
        ...milestones.slice(0, milestoneIndex),
        {
          ...milestones[milestoneIndex],
          description: value,
        },
        ...milestones.slice(milestoneIndex + 1),
      ];
      if (validateInputLength(value, 50, 5000)) {
        milestoneErrors[milestoneIndex] = {
          ...milestoneErrors[milestoneIndex],
          description: '',
        };
      } else {
        milestoneErrors[milestoneIndex] = {
          ...milestoneErrors[milestoneIndex],
          description:
            'A valid milestone description is required between 50 - 5000 characters',
        };
      }
      break;
    case 'milestoneAmount':
      if (milestoneIndex === undefined || Number(value) > 1e20) break;
      milestones = [
        ...milestones.slice(0, milestoneIndex),
        {
          ...milestones[milestoneIndex],
          amount: Number(value),
        },
        ...milestones.slice(milestoneIndex + 1),
      ];
      if (Number(value) > 0 && Number(value) <= 1e8) {
        milestoneErrors[milestoneIndex] = {
          ...milestoneErrors[milestoneIndex],
          amount: '',
        };
      } else {
        milestoneErrors[milestoneIndex] = {
          ...milestoneErrors[milestoneIndex],
          amount:
            'A valid milestone amount is required under. Total must be under 100M',
        };
      }
      break;
    default:
      break;
  }

  const errors = { ...newInputErrors, milestones: milestoneErrors };
  return {
    titleRes: title,
    descriptionRes: description,
    milestonesRes: milestones,
    errors,
  };
};

export const strToIntRange = (strList: any) => {
  return Array.isArray(strList)
    ? strList?.[0]?.split?.(',')?.map?.((v: any) => Number(v))
    : strList?.split?.(',')?.map((v: any) => Number(v));
};

export const isNumOrSpecialCharacter = (character: string) => {
  return /[^A-Za-z]/g.test(character);
};

export  const isValidEmail = (val: string) => {
  return /\S+@\S+\.\S+/.test(val);
};