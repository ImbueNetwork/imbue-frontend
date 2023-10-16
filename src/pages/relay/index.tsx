import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  FilledInput,
  FormControl,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
} from '@mui/material';
import { Signer } from '@polkadot/api/types';
import { decodeAddress } from "@polkadot/util-crypto/address"
import { WalletAccount } from '@talismn/connect-wallets';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { getBalance } from '@/utils/helper';
import { initImbueAPIInfo } from '@/utils/polkadot';
import { getServerSideProps } from '@/utils/serverSideProps';

import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import SuccessScreen from '@/components/SuccessScreen';
import Web3WalletModal from '@/components/WalletModal/Web3WalletModal';

import { Currency } from '@/model';
import { RootState } from '@/redux/store/store';

const Currencies = [
  {
    name: "IMBU",
    currencyId: 0
  },
  {
    name: "KSM",
    currencyId: 1
  },
  // {AUSD : 2},
  // {KAR : 3},
  {
    name: "MGX",
    currencyId: 4
  },
]

const Relay = () => {
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [showPolkadotAccounts, setShowPolkadotAccounts] = useState<boolean>(false)

  // screens
  const [error, setError] = useState<any>()
  const [success, setSuccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const router = useRouter()

  const transferFromChain = async (account: WalletAccount) => {
    setShowPolkadotAccounts(false);
    setLoading(true);
    const relayApi = (await initImbueAPIInfo()).relayChain.api
    const imbueApi = (await initImbueAPIInfo()).imbue.api
    const transferAmountInt = BigInt(parseFloat(transferAmount.toString()) * 1e12);

    if (relayApi && transferAmountInt) {
      // Todo: loading screen

      const { data: { free: freeBalance } } = await relayApi.query.system.account(account.address) as any
      const userHasEnoughBalance = freeBalance.toBigInt() >= Number(transferAmount)
      if (userHasEnoughBalance) {
        const dest = {
          V3: {
            parents: 0,
            interior: {
              X1: { Parachain: 2121 },
            },
          },
        };
        const beneficiary = {
          V3: {
            parents: 0,
            interior: {
              X1: {
                AccountId32: {
                  id: decodeAddress(account.address)
                }
              }
            }
          }
        };

        const assets = {
          V3: [{
            id: { Concrete: { parents: 0, interior: "Here" } },
            fun: { Fungible: 1000000000000 }
          }]
        };

        const feeAssetItem = 0;
        const weightLimit = 'Unlimited';
        const extrinsic = await relayApi?.tx.xcmPallet.limitedReserveTransferAssets(dest, beneficiary, assets, feeAssetItem, weightLimit);
        try {
          await extrinsic.signAndSend(
            account.address,
            { signer: account.signer as Signer },
            (result) => {
              imbueApi?.query.system.events((events: any) => {
                if (events) {

                  if (!result || !result.status || !events) {
                    return;
                  }


                  // Loop through the Vec<EventRecord>
                  events.forEach((record: any) => {
                    const { event } = record;
                    const currenciesDeposited = `${event.section}.${event.method}` == "ormlTokens.Deposited";
                    if (currenciesDeposited) {
                      // const types = event.typeDef;
                      const accountId = event.data[1];
                      if (accountId == account.address) {
                        setSuccess(true)
                      }
                    }
                  });
                }
              });
            });

        } catch (error: any) {
          // eslint-disable-next-line no-console
          console.error(error)
          setError({ message: "Error occurred.  " + error })
        } finally {
          setLoading(false)
        }
      }
      else {
        const avilableBalance = Number(freeBalance.toBigInt() / BigInt(1e12))
        const errorMessage = `Error: Insuffient balance to complete transfer. Available balance is ${avilableBalance.toFixed(2)}`

        // eslint-disable-next-line no-console
        console.error(errorMessage)
        setError({ message: errorMessage })
      }
    }
  }

  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [requestSent, setRequestSent] = useState(false)
  const [currency_id, setCurrency_id] = useState<number>(0)
  const [balance, setBalance] = useState<number>(0)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const showOptions = Boolean(anchorEl);


  // useEffect(() => {
  //   getAndSetBalace()
  // }, [currency_id, user.id])

  useEffect(() => {
    const getAndSetBalace = async () => {
      if (!requestSent && !loadingUser && !user?.web3_address) return

      setRequestSent(true)
      try {
        const balance = await getBalance(
          user.web3_address as string,
          currency_id,
          user
        );

        setBalance(balance || 0);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        setBalanceLoading(false)
        setRequestSent(false)
      }
    }

    const timer = setInterval(() => {
      getAndSetBalace()
    }, 5000);
    return () => clearInterval(timer);

  }, [balanceLoading, currency_id, loadingUser, requestSent, user]);


  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const selectCurrency = (currencyID: number) => {
    setCurrency_id(currencyID)
    setAnchorEl(null);
  };

  return (
    <div className='bg-background p-10 rounded-2xl'>
      <h1 className='fund-h1'>My funds</h1>

      <p className='my-5 text-content'>Transfer KSM to Imbue Network</p>

      <div className='text-sm text-[#868686] my-3'>
        {balanceLoading
          ? (
            <p className='text-xs font-semibold'> Loading Balance...</p>)
          : (
            <div className='flex items-center gap-5'>
              <div>
                <button
                  className='border rounded-xl px-[10px] py-1 text-xs flex items-start gap-1'
                  onClick={(e) => handleClick(e)}
                >
                  {Currency[currency_id || 0]}
                  <KeyboardArrowDownIcon className='text-sm' />
                </button>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={showOptions}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  {
                    Currencies.map((currency) => (
                      <MenuItem
                        key={currency.currencyId}
                        onClick={() => selectCurrency(currency.currencyId)}
                      >
                        {currency.name}
                      </MenuItem>
                    ))
                  }
                </Menu>
              </div>
              <p>
                Balance : {balance} ${Currency[currency_id || 0]}
              </p>
            </div>
          )
        }
      </div>

      <FormControl
        className='transferFund'
        fullWidth
        sx={{ m: 1 }}
        color='secondary'
        variant='filled'
      >
        <InputLabel htmlFor='filled-adornment-amount'>
          Amount to transfer*
        </InputLabel>
        <FilledInput
          type='number'
          value={transferAmount}
          onChange={(e) => setTransferAmount(Number(e.target.value))}
          className='pt-2 text-lg'
          id='filled-adornment-amount'
          startAdornment={
            <InputAdornment className='mr-' position='start'>
              KSM :
            </InputAdornment>
          }
        />
      </FormControl>
      <button
        className={`rounded-xl transition-colors duration-300 ${transferAmount > 0 ? 'bg-background  hover:bg-primary hover:border-primary' : 'bg-light-grey'} text-content shadow-lg border border-imbue-light-purple w-full py-5 text-lg`}
        onClick={() => setShowPolkadotAccounts(true)}
        disabled={!transferAmount}
      >
        Transfer
      </button>

      <Web3WalletModal
        polkadotAccountsVisible={showPolkadotAccounts}
        showPolkadotAccounts={setShowPolkadotAccounts}
        accountSelected={(account) => transferFromChain(account)}
      />

      {loading && <FullScreenLoader />}

      <SuccessScreen
        title={'You have successfully transferred funds'}
        open={success}
        setOpen={setSuccess}
      >
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => {
              setSuccess(false);
              setTransferAmount(0)
            }}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Transfer Again
          </button>
          <button
            onClick={() => (window.location.href = `/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </SuccessScreen>

      <ErrorScreen {...{ error, setError }}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => setError(null)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Try Again
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </ErrorScreen>
    </div>
  );
};

export { getServerSideProps };

export default Relay;
