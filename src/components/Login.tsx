import React, { useState } from "react";
import { signWeb3Challenge } from "@/utils/polkadot";
import { SignerResult } from "@polkadot/api/types";
import AccountChoice from "@/components/AccountChoice";
import { Dialogue } from "@/components/Dialogue";
import Image from "next/image";
import { useRouter } from "next/router";
import { postAPIHeaders } from "@/config";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
} from "@mui/material";
import * as config from "@/config";
import Link from "next/link";
import styled from "@emotion/styled";
import { authorise, getAccountAndSign } from "@/redux/services/polkadotService";
import { useTheme } from "@mui/material/styles";
import { WalletAccount } from "@talismn/connect-wallets";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useGoogleLogin, GoogleLogin } from "@react-oauth/google";
import jwt from "jsonwebtoken";
import * as utils from "@/utils";

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

    const resp = await fetch(
      `${config.apiBase}auth/imbue/`, {
      headers: postAPIHeaders,
      method: "post",
      body: JSON.stringify({
        userOrEmail,
        password,
      }),
    });

    if (resp.ok) {
      utils.redirect(redirectUrl);
    } else {
      setErrorMessage("incorrect username or password");
    }
  };

  const closeModal = (): void => {
    showPolkadotAccounts(true);
    setVisible(false);
  };

  const googleLogin = async (response: any) => {
    const resp = await fetch(
      `${config.apiBase}auth/google/`, {
      headers: postAPIHeaders,
      method: "post",
      body: JSON.stringify(response),
    });

    if (resp.ok) {
      utils.redirect(redirectUrl);
    } else {
      setErrorMessage("incorrect username or password");
    }
  };

  const accountSelected = async (account: WalletAccount): Promise<any> => {
    try {
      const result = await getAccountAndSign(account);
      const resp = await authorise(
        result?.signature as SignerResult,
        result?.challenge!,
        account
      );
      if (resp.ok) {
        utils.redirect(redirectUrl);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Dialog
        open={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="responsive-dialog-title"
      >
        {
          <div className="lg:min-w-[450px] py-2">
            <DialogTitle className="text-center" id="responsive-dialog-title">
              {"You must be signed in to continue"}
            </DialogTitle>
            <DialogContent>
              <p className="text-base text-[#ebeae2] mb-7 relative text-center">
                Please use the link below to sign in.
              </p>
              <div>
                <form
                  id="contribution-submission-form"
                  name="contribution-submission-form"
                  method="get"
                  onSubmit={imbueLogin}
                >
                  <div className="login justify-center items-center w-full flex flex-col">
                    <div className="flex justify-center pb-[10px] w-[80%]">
                      <CssTextField
                        label="Email/Username"
                        onChange={(e: any) => setUserOrEmail(e.target.value)}
                        className="mdc-text-field"
                        required
                      />
                    </div>
                    <div className="flex justify-center pb-[10px] w-[80%]">
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
                    <div className="w-[70%] mt-1 mb-5">
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
                        className="signup text-primary ml-1"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </form>

                <div className="login justify-center items-center w-full flex flex-col">
                  <li className="lg:max-w-[65%] mt-1 mb-2">
                    <GoogleOAuthProvider clientId={config.googleClientId}>
                      <GoogleLogin
                        theme="filled_black"
                        shape="rectangular"
                        useOneTap={true}
                        onSuccess={(creds: any) => googleLogin(creds)}
                        onError={() => {
                          console.log("Login Failed");
                        }}
                      />
                    </GoogleOAuthProvider>
                  </li>
                </div>

                <div className="login justify-center items-center w-full flex flex-col">
                  <li
                    className="mt-4 flex flex-row items-center cursor-pointer"
                    tabIndex={0}
                    data-mdc-dialog-action="web3"
                    onClick={() => closeModal()}
                  >
                    <button className="pill-button primary">
                      {"Sign in with a wallet"}
                    </button>
                  </li>
                </div>
              </div>
            </DialogContent>
          </div>
        }
      </Dialog>

      <AccountChoice
        accountSelected={(account: WalletAccount) => accountSelected(account)}
        visible={polkadotAccountsVisible}
        setVisible={showPolkadotAccounts}
      />
    </>
  );
};

export default Login;
