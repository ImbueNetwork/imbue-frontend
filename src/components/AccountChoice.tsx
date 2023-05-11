import { getWeb3Accounts } from "@/utils/polkadot";
import * as React from "react";
import { Dialogue } from "./Dialogue";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { WalletSelect } from "@talismn/connect-components";
import { Wallet, WalletAccount } from "@talismn/connect-wallets";
import { PolkadotjsWallet, SubWallet, TalismanWallet, EnkryptWallet } from "@talismn/connect-wallets"
import { truncateMiddle } from '@talismn/connect-ui';
import { title } from "process";

type AccountChoiceProps = {
  accountSelected: (account: WalletAccount) => void;
  setVisible: Function;
  visible: boolean;
  filterByInitiator?: boolean;
  initiatorAddress?: string;
  title?: string;
}

const AccountChoice = ({
  accountSelected,
  visible,
  setVisible,
  filterByInitiator,
  initiatorAddress,
  title
}: AccountChoiceProps): JSX.Element => {

  const header = filterByInitiator ? `Connect with ${truncateMiddle(initiatorAddress)}` : "Connect wallet";
  return (
    <>
      <WalletSelect
        dappName={"Imbue"}
        open={visible}
        walletList={[
          new TalismanWallet(),
          new SubWallet(),
          new PolkadotjsWallet(),
        ]}
        header={title ? title : header}
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
