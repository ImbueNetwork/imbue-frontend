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
import * as config from "@/config";
import Link from "next/link";
import styled from "@emotion/styled";
import { getCurrentUser } from "@/utils";
import { authorise, getAccountAndSign } from "@/redux/services/polkadotService";
import { WalletAccount } from "@talismn/connect-wallets";

const logoStyle = { height: "100%", width: "100%" };

type LoginProps = {
  visible: boolean;
  redirectUrl: string;
  setVisible: (val: boolean) => void;
};

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

const Login = ({ visible, setVisible, redirectUrl }: LoginProps) => {
  const [userOrEmail, setUserOrEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
  const router = useRouter();

  const imbueLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    setErrorMessage(undefined);
    event.preventDefault();

    const resp = await fetch(`${config.apiBase}/auth/imbue/`, {
      headers: postAPIHeaders,
      method: "post",
      body: JSON.stringify({
        userOrEmail,
        password,
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
        setVisible(false);
        router.push(redirectUrl);
      }
    } else {
      setErrorMessage("incorrect username or password");
    }
  };

  const clicked = (): void => {
    showPolkadotAccounts(true);
  };

  const accountSelected = async (
    account: WalletAccount
  ): Promise<any> => {
    const result = await getAccountAndSign(account);
    await authorise(result?.signature as SignerResult,result?.challenge!, account);
    setVisible(false);
    router.push(redirectUrl);
  };

  if (visible) {
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
                      href="/join"
                      onClick={() => {
                        setVisible(false);
                      }}
                      className="signup"
                    > Sign up
                    </Link>
                  </div>
                </div>
              </form>

              <li
                className="mdc-deprecated-list-item flex flex-row items-center mt-8 cursor-pointer"
                tabIndex={0}
                data-mdc-dialog-action="web3"
                onClick={() => clicked()}
              >
                <span className="mdc-deprecated-list-item__graphic h-[40px] w-[40px] flex mr-[16px]">
                  <Image
                    src={
                      "https://raw.githubusercontent.com/TalismanSociety/talisman-connect/master/packages/connect-wallets/src/lib/talisman-wallet/TalismanLogo.svg"
                    }
                    width={40}
                    height={40}
                    className="w-full cursor-pointer"
                    style={logoStyle}
                    alt={"avaterImage"}
                  />
                </span>
                <span
                  className="cursor-pointer"
                >
                  {"Sign in with a wallet"}
                </span>
              </li>
            </div>
          }
        />
      );
    }
  } else {
    return <></>;
  }
};

export default Login;
