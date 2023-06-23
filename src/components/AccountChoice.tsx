import { WalletSelect } from '@talismn/connect-components';
import { truncateMiddle } from '@talismn/connect-ui';
import { WalletAccount } from '@talismn/connect-wallets';
import {
  PolkadotjsWallet,
  SubWallet,
  TalismanWallet,
} from '@talismn/connect-wallets';
import * as React from 'react';

type AccountChoiceProps = {
  accountSelected: (_account: WalletAccount) => void;
  setVisible: (_visible: boolean) => void;
  visible: boolean;
  filterByInitiator?: boolean;
  initiatorAddress?: string;
  title?: string;
};

const AccountChoice = ({
  accountSelected,
  visible,
  setVisible,
  filterByInitiator,
  initiatorAddress,
  title,
}: AccountChoiceProps): JSX.Element => {
  const header = filterByInitiator
    ? `Connect with ${truncateMiddle(initiatorAddress)}`
    : 'Connect wallet';
  return (
    <>
      <WalletSelect
        dappName={'Imbue'}
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
