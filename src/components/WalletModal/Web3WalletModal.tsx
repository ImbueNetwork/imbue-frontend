import ArrowBack from '@mui/icons-material/ArrowBackIosOutlined';
import CloselIcon from '@mui/icons-material/Close';
import { Backdrop, Modal, Slide } from '@mui/material';
import { getWallets, Wallet, WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const style: any = {
    position: 'absolute',
    inset: 0,
    // transform: 'translate(-50%, -50%)',
    margin: 'auto',
    width: '50%',
    bgcolor: '#ffffff',
    borderRadius: '24px',
    boxShadow: 24,
    minWidth: '50rem',
    height: '32rem',
};

interface Web3ModalProps {
    polkadotAccountsVisible: boolean;
    showPolkadotAccounts: (_value: boolean) => void;
    accountSelected: (_account: WalletAccount) => void;
}

const Web3WalletModal = (props: Web3ModalProps) => {
    const { polkadotAccountsVisible, showPolkadotAccounts, accountSelected } = props;

    const [supportedWallets, setSuppotedWallets] = useState<Wallet[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

    const [accounts, setAccounts] = useState<WalletAccount[]>([])

    useEffect(() => {
        const supportedWallets = getWallets();
        setSuppotedWallets(supportedWallets);
    }, [])

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={polkadotAccountsVisible}
            onClose={() => showPolkadotAccounts(false)}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Slide direction="up" in={polkadotAccountsVisible}>
                <div className='absolute bottom-0 lg:inset-0 lg:m-auto w-full lg:w-1/2 rounded-3xl shadow-xl bg-white lg:h-[32rem]  lg:min-w-[50rem]'>
                    <div className="flex flex-col lg:flex-row items-stretch h-full">
                        <div className="lg:w-1/2 p-6 border-r">
                            <p className="text-black text-lg mb-4 font-semibold font-inter ml-2">Choose a Wallet</p>

                            <p className="text-black text-sm text-opacity-70 mb-4 font-medium font-inter ml-2">Recommended</p>
                            {
                                supportedWallets.map((wallet, index) => (
                                    <div
                                        className={`flex items-center justify-between gap-5 p-2 rounded-lg hover:bg-imbue-lime hover:text-black ${selectedWallet?.extensionName === wallet.extensionName && "bg-imbue-purple text-white"} cursor-pointer transition-all duration-300`}
                                        key={index}

                                        onClick={async () => {
                                            try {
                                                if (!wallet.installed) return window.open(wallet.installUrl)

                                                await wallet.enable('Imbue');
                                                await wallet.subscribeAccounts((accounts: WalletAccount[] | undefined) => {
                                                    if (accounts?.length) {
                                                        setSelectedWallet(wallet)
                                                        setAccounts(accounts);
                                                    }
                                                });
                                            } catch (err) {
                                                // eslint-disable-next-line no-console
                                                console.error(err)
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3 ">
                                            <Image height={40} width={40} src={wallet.logo.src} alt={wallet.logo.alt} />
                                            <p className="text-base font-inter font-semibold">
                                                {
                                                    wallet.title
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            {
                                                wallet.installed
                                                    ? (
                                                        <div className="flex items-center gap-1 bg-imbue-purple text-white py-1.5 px-2 rounded-full">
                                                            <p className="text-xs">Installed</p>
                                                            <Image height={10} width={10} src={require('../../assets/svgs/loader.svg')} alt="download wallet" />
                                                        </div>
                                                    )
                                                    : (
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs">Get wallet</p>
                                                            <Image height={10} width={10} src={require('../../assets/svgs/download.svg')} alt="download wallet" />
                                                        </div>
                                                    )
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        <div className="lg:w-1/2 flex items-center justify-center h-full relative">
                            {
                                selectedWallet
                                    ? (
                                        <div className="h-auto max-h-full w-full p-7 str-chat">
                                            <ArrowBack onClick={() => setSelectedWallet(null)} className='text-imbue-purple cursor-pointer absolute top-7 left-7' />
                                            <CloselIcon onClick={() => showPolkadotAccounts(false)} className='text-imbue-purple cursor-pointer absolute top-7 right-7 rounded-full bg-[#EBEAE2] p-0.5' />
                                            <p className="text-center font-inter font-semibold text-base mb-8">Select {selectedWallet.title} account</p>
                                            <div className="flex flex-col gap-2 overflow-y-auto max-h-96 pr-1">
                                                {
                                                    accounts?.map((account) => (
                                                        <div
                                                            key={account.address}
                                                            className="py-4 px-6 rounded-xl bg-[#EBEAE2] hover:bg-imbue-light-purple cursor-pointer w-full"
                                                            onClick={() => accountSelected(account)}
                                                        >
                                                            <p className="text-sm text-black">{account.name}</p>
                                                            <p className="text-black text-xs">
                                                                {
                                                                    account?.address.substring(0, 12) +
                                                                    '...' +
                                                                    account?.address.substring(35)
                                                                }
                                                            </p>

                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>)
                                    : (
                                        <div className="p-14">
                                            <p className="text-center font-inter font-semibold text-base mb-8">About Wallets?</p>
                                            <div className="flex items-start gap-4 mb-8">
                                                <div className="w-14">
                                                    <Image className="object-cover" height={200} width={200} src={require('../../assets/icons/polkadotIcon.png')} alt="recommended wallet" />
                                                </div>
                                                <div className="w-full">
                                                    <p className="text-sm font-semibold">We recommend Polkadot wallets</p>
                                                    <p className="text-xs text-[#B1B0B9] mt-1 leading-5">Polkadot Wallets are built with you in mind. You can store digital assets and sign in securely without needing to trust a third party,</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 mb-8">
                                                <div className="w-14">
                                                    <Image className="object-cover" height={200} width={200} src={require('../../assets/icons/digital_assets.png')} alt="recommended wallet" />
                                                </div>
                                                <div className="w-full">
                                                    <p className="text-sm font-semibold">A Home for your Digital Assets</p>
                                                    <p className="text-xs text-[#B1B0B9] mt-1 leading-5">Wallets are used to send, receive, store, and display digital assets like Bitcoin and NFTs.</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 mb-8">
                                                <div className="w-14">
                                                    <Image className="object-cover" height={200} width={200} src={require('../../assets/icons/new_login.svg')} alt="recommended wallet" />
                                                </div>
                                                <div className="w-full">
                                                    <p className="text-sm font-semibold">A New Way to Log In</p>
                                                    <p className="text-xs text-[#B1B0B9] mt-1 leading-5">Instead of creating new accounts and passwords on every website, just connect your wallet instead.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                </div>
            </Slide>
        </Modal>
    );
};

export default Web3WalletModal;