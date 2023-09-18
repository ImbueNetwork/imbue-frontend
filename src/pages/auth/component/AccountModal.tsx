import { WalletSelect } from '@talismn/connect-components';
import { WalletAccount } from '@talismn/connect-wallets';
import {
    PolkadotjsWallet,
    SubWallet,
    TalismanWallet,
  } from '@talismn/connect-wallets';


  type AccountChoiceProps = {
    accountSelected: (_account: WalletAccount) => void;
    setVisible: (_visible: boolean) => void;
    visible: boolean;
    filterByInitiator?: boolean;
    initiatorAddress?: string;
    title?: string;
  };



export default function AccountModal({
    accountSelected,
    visible,
    setVisible,
  }: AccountChoiceProps){
    return <div  className="py-5 absolute z-10 bg-white">
        <p>Choose a Wallet</p>
        <p>Recommended</p>
        <WalletSelect
        dappName={'Imbue'}
        open={visible}
        walletList={[
          new TalismanWallet(),
          new SubWallet(),
          new PolkadotjsWallet(),
        ]}
        header={""}
        showAccountsList={visible}
        onWalletConnectClose={() => setVisible(false)}
        onAccountSelected={(account: WalletAccount) => {
          accountSelected(account);
        }}
      />
    </div>
}