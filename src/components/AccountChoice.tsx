import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { getWeb3Accounts } from "@/utils/polkadot";
import * as React from "react";
import { Dialogue } from "./Dialogue";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

type AccountChoiceProps = {
  accountSelected: (account: InjectedAccountWithMeta) => void;
  setVisible: Function;
  visible: boolean;
};

const AccountChoice = ({
  accountSelected,
  visible,
  setVisible,
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
    <Dialog
      open={visible}
      onClose={()=>setVisible(false)}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogContent>
      <DialogTitle id="responsive-dialog-title">
          {"Choose the account you would like to use"}
        </DialogTitle>
                <div className="min-w-[400px] px-2 py-1 flex flex-col gap-2">
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
      </div>
      </DialogContent>

    </Dialog>
  )
};

export default AccountChoice;
