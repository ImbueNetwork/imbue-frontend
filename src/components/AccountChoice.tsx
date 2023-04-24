import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { getWeb3Accounts } from "@/utils/polkadot";
import * as React from "react";
import { Dialogue } from "./Dialogue";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { WalletSelect } from "@talismn/connect-components";
import { Wallet, WalletAccount } from "@talismn/connect-wallets";
import { PolkadotjsWallet, SubWallet, TalismanWallet, EnkryptWallet } from "@talismn/connect-wallets"

type AccountChoiceProps = {
  accountSelected: (account: WalletAccount) => void;
  setVisible: Function;
  visible: boolean;
  filterByInitiator?: boolean;
  initiatorAddress?: string;
}

const AccountChoice = ({
  accountSelected,
  visible,
  setVisible,
  filterByInitiator,
  initiatorAddress,
}: AccountChoiceProps): JSX.Element => {
  const header = filterByInitiator ? `Connect with ${initiatorAddress}` : "Connect wallet";
  return (
    <>
      <WalletSelect
        dappName={"Imbue"}
        open={visible}
        walletList={[
          new TalismanWallet(),
          new PolkadotjsWallet(),
          new SubWallet(),
        ]}
        header={header}
        showAccountsList={visible}
        onWalletConnectClose={() => setVisible(false)}
        onAccountSelected={(account: WalletAccount) => {
          accountSelected(account);
        }}
      />
    </>
  );
};

export default AccountChoice;
