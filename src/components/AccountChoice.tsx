import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { getWeb3Accounts } from "@/utils/polkadot";
import * as React from "react";
import { Dialogue } from "./Dialogue";

type AccountChoiceProps = {
  accountSelected: (account: InjectedAccountWithMeta) => void;
};

const AccountChoice = ({
  accountSelected,
}: AccountChoiceProps): JSX.Element => {
  const [accounts, setAccounts] = React.useState<InjectedAccountWithMeta[]>([]);

  React.useEffect(() => {
    getAccounts();
  }, []);

  const getAccounts = async () => {
    const accountsResponse: InjectedAccountWithMeta[] = await getWeb3Accounts();
    setAccounts(accountsResponse);
  };

  return (
    <Dialogue
      title="Choose the account you would like to use"
      actionList={
        <>
          {accounts.map((account, index: number) => {
            const {
              meta: { name, source },
            } = account;
            return (
              <li className="button-container" key={index}>
                <button
                  className="primary"
                  onClick={() => accountSelected(account)}
                >
                  {`${name} (${source})`}
                </button>
              </li>
            );
          })}
        </>
      }
    />
  );
};

export default AccountChoice;
