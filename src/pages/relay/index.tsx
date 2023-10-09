import {
  FilledInput,
  FormControl,
  InputAdornment,
  InputLabel,
} from '@mui/material';
import { Signer } from '@polkadot/api/types';
import { decodeAddress } from "@polkadot/util-crypto/address"
import { WalletAccount } from '@talismn/connect-wallets';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { initImbueAPIInfo } from '@/utils/polkadot';
import { getServerSideProps } from '@/utils/serverSideProps';

import ErrorScreen from '@/components/ErrorScreen';
import FullScreenLoader from '@/components/FullScreenLoader';
import SuccessScreen from '@/components/SuccessScreen';
import Web3WalletModal from '@/components/WalletModal/Web3WalletModal';

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

  return (
    <div className='bg-background p-10 rounded-2xl'>
      <h1 className='fund-h1'>My funds</h1>

      <p className='my-5 text-content'>Transfer KSM to Imbue Network</p>

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
