import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { getWeb3Accounts } from "@/utils/polkadot";
import * as React from "react";
import { Dialogue } from "./Dialogue";
import { WalletSelect } from "@talismn/connect-components";
import { Wallet, WalletAccount } from "@talismn/connect-wallets";
import { PolkadotjsWallet, SubWallet, TalismanWallet, EnkryptWallet } from "@talismn/connect-wallets"

type AccountChoiceProps = {
  accountSelected: (account: any) => void;
  closeModal?: () => void;
  filterByInitiator?: boolean;
  initiator_address?: string;
};

const AccountChoice = ({
  accountSelected,
  closeModal,
  filterByInitiator,
  initiator_address,
}: AccountChoiceProps): JSX.Element => {
  const header = filterByInitiator ? `Connect with ${initiator_address}` : "Connect wallet";
  return (
    <>
      <WalletSelect
        dappName={"Imbue"}
        open={true}
        walletList={[
          new TalismanWallet(),
          new PolkadotjsWallet(),
          new SubWallet(),
        ]}
        header={header}
        showAccountsList={true}
        onWalletConnectClose={closeModal}
        onAccountSelected={(account: WalletAccount) => {
          accountSelected(account);
        }}
      />
    </>
  );
};

export default AccountChoice;
