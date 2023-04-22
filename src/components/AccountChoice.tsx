import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { getWeb3Accounts } from "@/utils/polkadot";
import * as React from "react";
import { Dialogue } from "./Dialogue";

type AccountChoiceProps = {
  accountSelected: (account: InjectedAccountWithMeta) => void;
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
    <Dialogue
      title="Choose the account you would like to use"
      closeDialouge={closeModal}
      actionList={
        <>
          {filterByInitiator
            ? initiatorOnly?.map?.((account, index: number) => {
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
              })
            : accounts.map((account, index: number) => {
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
          {/* {accounts.map((account, index: number) => {
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
          })} */}
        </>
      }
    />
  );
};

export default AccountChoice;
