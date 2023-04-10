import React, { useState } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { signWeb3Challenge } from "@/utils/polkadot";
import { SignerResult } from "@polkadot/api/types";
import AccountChoice from "@/components/AccountChoice";
import { Dialogue } from "@/components/Dialogue";
import Image from "next/image";
import { useRouter } from "next/router";
import { postAPIHeaders } from "@/config";
import { TextField } from "@mui/material";
import * as utils from "@/utils";
import Link from "next/link";
import styled from "@emotion/styled";

const logoStyle = { height: "100%", width: "100%" };

const CssTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#aaa",
  },

  "& label.Mui-error": {
    color: "#aaa",
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
  },
  "& div.Mui-error": {
    borderRadius: 10,
    border: 2,
  },
  "& div.MuiOutlinedInput-root": {
    backgroundColor: "#ebeae21c",
  },
  "& p.MuiFormHelperText-root": {
    backgroundColor: "#282725",
    color: "white",
  },
  "& .MuiInputBase-formControl": {
    "& input": {
      color: "white",
    },
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    ":hover": {
      borderColor: "#b2ff0b",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#b2ff0b",
      borderRadius: 10,
    },
    "& fieldset:hover": {
      borderRadius: 10,
    },
  },
});

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
  const [userOrEmail, setUserOrEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
  const router = useRouter();

  const imbueLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    setErrorMessage(undefined);
    event.preventDefault();

    const resp = await fetch(`/auth/imbue/`, {
      headers: postAPIHeaders,
      method: "post",
      body: JSON.stringify({
        userOrEmail,
        password,
      }),
    });

    if (resp.ok) {
      await utils.redirectBack();
    } else {
      setErrorMessage("incorrect username or password");
    }
  };

  const clicked = (): void => {
    showPolkadotAccounts(true);
  };

  const accountSelected = async (
    account: InjectedAccountWithMeta
  ): Promise<any> => {
    // :TODO make api call
    // const result = await getAccountAndSign(account);
    // await authorise(result?.signature as SignerResult, account);
    router.push("/dashboard");
  };

  if (polkadotAccountsVisible) {
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
        content={
          <p className="text-base text-[#ebeae2] mb-5 relative top-[-10px]">
            Please use the link below to sign in.
          </p>
        }
        actionList={
          <div>
            <form
              id="contribution-submission-form"
              name="contribution-submission-form"
              method="get"
              onSubmit={imbueLogin}
            >
              <div className="login justify-center items-center w-full flex flex-col">
                <div className="flex justify-center pb-[10px] w-[70%]">
                  <CssTextField
                    label="Email/Username"
                    onChange={(e: any) => setUserOrEmail(e.target.value)}
                    className="mdc-text-field"
                    required
                  />
                </div>
                <div className="flex justify-center pb-[10px] w-[70%]">
                  <CssTextField
                    label="Password"
                    onChange={(e: any) => setPassword(e.target.value)}
                    type="password"
                    className="mdc-text-field"
                    required
                  />
                </div>

                <div>
                  <span className={!errorMessage ? "hide" : "error"}>
                    {errorMessage}
                  </span>
                </div>
                <div className="w-[70%] mt-7 mb-5">
                  <button
                    type="submit"
                    // disabled={!this.state.creds.username && !this.state.creds.password}
                    className="primary-btn in-dark confirm w-full !text-center"
                    id="sign-in"
                  >
                    Sign In
                  </button>
                </div>

                <div>
                  <span>Don&apos;t have an account?</span>
                  <Link
                    href="#"
                    onClick={() => router.push("/join")}
                    className="signup"
                  >
                    Sign up
                  </Link>
                  <span
                    onClick={() => showPolkadotAccounts(true)}
                    className="mdc-deprecated-list-item__text"
                  ></span>
                </div>
              </div>
            </form>

            <li
              className="mdc-deprecated-list-item flex flex-row items-center mt-8"
              tabIndex={0}
              data-mdc-dialog-action="web3"
            >
              <span className="mdc-deprecated-list-item__graphic h-[40px] w-[40px] flex mr-[16px]">
                <Image
                  src={
                    "https://avatars.githubusercontent.com/u/33775474?s=200&amp;amp;v=4"
                  }
                  width={40}
                  height={40}
                  className="w-full"
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
          </div>
        }
      />
    );
  }
};

export default Login;
