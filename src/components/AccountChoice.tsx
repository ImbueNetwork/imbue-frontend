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
  initiator?: string;
};

const AccountChoice = ({
  accountSelected,
  closeModal,
  filterByInitiator,
  initiator,
}: AccountChoiceProps): JSX.Element => {
  const [accounts, setAccounts] = React.useState<InjectedAccountWithMeta[]>([]);
  const [filteredWallet, setFilteredWallet] = React.useState<WalletAccount[]>([]);

  React.useEffect(() => {
    getAccounts();
  }, []);

  const getAccounts = async () => {
    const accountsResponse: InjectedAccountWithMeta[] = await getWeb3Accounts();
    setAccounts(accountsResponse);
  };

  const initiatorOnly = accounts.filter((account) => {
    const { address } = account;
    return address === initiator;
  });

  return (
    <WalletSelect
      dappName={"Imbue"}
      open={true}
      walletList={[
        new TalismanWallet(),
        new PolkadotjsWallet(),
        new SubWallet(),
      ]}
      header="Connect wallet"
      showAccountsList={true}
      onWalletConnectClose={closeModal}
      onAccountSelected={(account: WalletAccount) => {
        accountSelected(account);
      }}
    />
  );
};

export default AccountChoice;
