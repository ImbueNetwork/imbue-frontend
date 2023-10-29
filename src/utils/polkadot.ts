/* eslint-disable no-console */
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import type { DispatchError } from '@polkadot/types/interfaces';
import { stringToHex } from '@polkadot/util';

import * as config from '../config';
export const imbueNetwork = 'Imbue Network';
import { WalletAccount } from '@talismn/connect-wallets';

export type PolkadotJsApiInfo = {
  api: ApiPromise;
  provider: WsProvider;
  webSockAddr: string;
};

export type ImbueApiInfo = {
  imbue: PolkadotJsApiInfo;
  relayChain: PolkadotJsApiInfo;
};

export const initImbueAPIInfo = async () => {
  showLoading();
  const { imbueNetworkWebsockAddr, relayChainWebsockAddr } = await fetch(
    `${config.apiBase}info`
  ).then((resp) => resp.json());
  const imbueApi = await initPolkadotJSAPI(imbueNetworkWebsockAddr);
  const relayChainApi = await initPolkadotJSAPI(relayChainWebsockAddr);
  hideLoading();
  return {
    imbue: imbueApi,
    relayChain: relayChainApi,
  };
};

function showLoading(): void {
  const modal = document.getElementById('modal');
  const loading = document.getElementById('loading');

  if (modal && loading) {
    loading.hidden = false;
    modal.classList.add('show');
  }
}

function hideLoading(): void {
  const modal = document.getElementById('modal');
  const loading = document.getElementById('loading');

  if (modal && loading) {
    loading.hidden = true;
    modal.classList.remove('show');
  }
}

export async function initPolkadotJSAPI(
  webSockAddr: string
): Promise<PolkadotJsApiInfo> {
  const provider = new WsProvider(webSockAddr);
  provider.on('error', (e) => {
    errorNotification(e);
    console.log(e);
  });

  provider.on('disconnected', (e) => {
    console.log(e);
  });

  provider.on('connected', (e) => {
    console.log('Polkadot JS connected', e);
  });

  try {
    const api = await ApiPromise.create({ provider });
    await api.isReady;

    return {
      api,
      provider,
      webSockAddr,
    };
  } catch (e) {
    throw new Error('Unable to initialize PolkadotJS API');
  }
}

export function errorNotification(e: Error) {
  dispatchEvent(
    new CustomEvent(config.event.notification, {
      bubbles: true,
      composed: true,
      detail: {
        title: e.name,
        content: e.message,
        actions: {},
        isDismissable: true,
      },
    })
  );
}

export const enableAppForExtension = async (
  appName: string,
  attempts = 10
): Promise<InjectedExtension[]> => {
  const { web3Enable } = await import('@polkadot/extension-dapp');
  const extensions = await web3Enable(appName);

  return new Promise((resolve, reject) => {
    if (!extensions.length) {
      // this.status("Error", web3Error("No extensions found."));
      if (attempts > 0) {
        setTimeout(() => {
          resolve(enableAppForExtension(appName, attempts - 1));
        }, 2000);
      } else {
        // this.dismissStatus();
        reject(new Error('Unable to enable any web3 extension.'));
      }
    } else {
      // this.dismissStatus();
      resolve(extensions);
    }
  });
};

export const getWeb3Accounts = async () => {
  const { web3Accounts } = await import('@polkadot/extension-dapp');
  try {
    const extensions = await enableAppForExtension(imbueNetwork);
    if (!extensions.length) {
      console.log('No extensions found.');
      return [];
    } else {
      return web3Accounts();
    }
  } catch (e) {
    console.warn(e);
  }
  return [];
};

export const signWeb3Challenge = async (
  account: WalletAccount,
  challenge: string
) => {
  const signer = account?.wallet?.signer;
  const signature = await signer.signRaw({
    address: account.address,
    data: stringToHex(challenge),
    type: 'bytes',
  });
  return signature;
};

export function getDispatchError(dispatchError: DispatchError): string {
  let message: string = dispatchError.type;

  if (dispatchError.isModule) {
    try {
      const mod = dispatchError.asModule;
      const error = dispatchError.registry.findMetaError(mod);

      message = `${error.name}`;
    } catch (error) {
      // swallow
    }
  } else if (dispatchError.isToken) {
    message = `${dispatchError.type}.${dispatchError.asToken.type}`;
  }

  return message;
}
