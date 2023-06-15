import { SignerResult } from '@polkadot/api/types';
import { WalletAccount } from '@talismn/connect-wallets';
import { v4 as uuid } from 'uuid';

import { getCurrentUser } from '@/utils';
import { signWeb3Challenge } from '@/utils/polkadot';

const getAPIHeaders = {
  accept: 'application/json',
};

const postAPIHeaders = {
  ...getAPIHeaders,
  'content-type': 'application/json',
};

export async function getAccountAndSign(account: WalletAccount) {
  const challenge = uuid();
  const signature = await signWeb3Challenge(account, challenge);
  if (signature) {
    return { signature, challenge };
  } else {
    return {
      signature: false,
    };
    // TODO: UX for no way to sign challenge?
  }
}

export async function authorise(
  signature: SignerResult,
  challenge: string,
  account: WalletAccount
) {
  const existingUser = await getCurrentUser();

  const resp = await fetch(`/api/auth/web3/polkadot`, {
    headers: postAPIHeaders,
    method: 'post',
    body: JSON.stringify({
      signature: signature.signature,
      challenge,
      account,
      logged_in_user: existingUser,
    }),
  });
  return resp;
}

export const selectAccount = async (account: WalletAccount) => {
  const result = await getAccountAndSign(account);
  if (result?.signature) {
    await authorise(
      result?.signature as SignerResult,
      result?.challenge as string,
      account
    );
  } else {
    // TODO:
    // console.log("Unable to get Account and Sign");
  }
};
