import * as React from "react";
import { WalletSelect } from "@talismn/connect-components";
import { WalletAccount } from "@talismn/connect-wallets";
import { PolkadotjsWallet, SubWallet, TalismanWallet } from "@talismn/connect-wallets"
import { truncateMiddle } from '@talismn/connect-ui';

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
