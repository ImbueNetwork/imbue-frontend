import React, { useState } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { signWeb3Challenge } from "@/utils/polkadot";
import { SignerResult } from "@polkadot/api/types";
import AccountChoice from "@/components/accountChoice";
import { Dialogue } from "@/components/dialogue";
import Image from "next/image";
import { useRouter } from "next/router";

const getAPIHeaders = {
  accept: "application/json",
};

const postAPIHeaders = {
  ...getAPIHeaders,
  "content-type": "application/json",
};

const logoStyle = { height: "100%", width: "100%" };

async function getAccountAndSign(account: InjectedAccountWithMeta) {
  const resp = await fetch(`/auth/web3/${account.meta.source}/`, {
    headers: postAPIHeaders,
    method: "post",
    body: JSON.stringify(account),
  });

  if (resp.ok) {
    // could be 200 or 201
    const { user, web3Account } = await resp.json();
    const signature = await signWeb3Challenge(account, web3Account.challenge);

    if (signature) {
      return { signature, user };
    } else {
      // TODO: UX for no way to sign challenge?
    }
  }
}

async function authorise(
  signature: SignerResult,
  account: InjectedAccountWithMeta
) {
  const resp = await fetch(`/auth/web3/${account.meta.source}/callback`, {
    headers: postAPIHeaders,
    method: "post",
    body: JSON.stringify({
      signature: signature.signature,
      address: account.address,
    }),
  });

  if (resp.ok) {
    const redirect =
      new URLSearchParams(window.location.search).get("redirect") ||
      "/dashboard";
    const isRelative =
      new URL(document.baseURI).origin ===
      new URL(redirect, document.baseURI).origin;
    if (isRelative) {
      location.replace(redirect);
    } else {
      location.replace("/");
    }
  } else {
    // TODO: UX for 401
  }
}

const Login = () => {
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);
  const router = useRouter();

  const clicked = (): void => {
    setShowPolkadotAccounts(true);
  };

  const accountSelected = async (
    account: InjectedAccountWithMeta
  ): Promise<any> => {
    // :TODO make api call
    // const result = await getAccountAndSign(account);
    // await authorise(result?.signature as SignerResult, account);
    router.push("/dashboard");
  };

  if (showPolkadotAccounts) {
    return (
      <AccountChoice
        accountSelected={(account: InjectedAccountWithMeta) =>
          accountSelected(account)
        }
      />
    );
  } else {
    return (
      <Dialogue
        title="You must be signed in to continue"
        content={<p>Please use the link below to sign in.</p>}
        actionList={
          <li
            className="mdc-deprecated-list-item"
            tabIndex={0}
            data-mdc-dialog-action="web3"
          >
            <span className="mdc-deprecated-list-item__graphic">
              <Image
                src={
                  "https://avatars.githubusercontent.com/u/33775474?s=200&amp;amp;v=4"
                }
                width={40}
                height={40}
                style={logoStyle}
                alt={"avaterImage"}
              />
            </span>
            <span
              onClick={() => clicked()}
              className="mdc-deprecated-list-item__text"
            >
              {"Sign in with your polkadot{.js} extension"}
            </span>
          </li>
        }
      />
    );
  }
};

export default Login;
