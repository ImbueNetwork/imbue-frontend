import * as config from "@/config";
import { getCurrentUser } from "@/utils";
import { signWeb3Challenge } from "@/utils/polkadot";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { SignerResult } from "@polkadot/api/types";
import { v4 as uuid } from "uuid";

const getAPIHeaders = {
  accept: "application/json",
};

const postAPIHeaders = {
  ...getAPIHeaders,
  "content-type": "application/json",
};

export async function getAccountAndSign(account: InjectedAccountWithMeta) {
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
  account: InjectedAccountWithMeta
) {
  const resp = await fetch(`/api/auth/web3/${account.meta.source}/callback`, {
    headers: postAPIHeaders,
    method: "post",
    body: JSON.stringify({
      signature: signature.signature,
      challenge,
      account,
    }),
  });
  if (resp.ok) {
    const userResponse = await getCurrentUser();
    if (userResponse) {
      const userAuth = {
        isAuthenticated: true,
        user: userResponse,
      };
      localStorage.setItem("userAuth", JSON.stringify(userAuth));
    }
  } else {
    // TODO: UX for 401
  }
}

export const selectAccount = async (account: InjectedAccountWithMeta) => {
  const result = await getAccountAndSign(account);
  if (result?.signature) {
    await authorise(result?.signature as SignerResult, result?.challenge!, account);
  } else {
    console.log("Unable to get Account and Sign");
  }
};
