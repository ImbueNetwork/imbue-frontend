import { WalletAccount } from '@talismn/connect-wallets';
import React from 'react';

import { Dialogue } from '@/components/Dialogue';


type VotingModalProps = {
    voteOnMilestone: (_account: WalletAccount, _vote: boolean) => void;
    setShowVotingModal: (_account: boolean) => void;
    votingWalletAccount: WalletAccount;
}

const VotingModal = (props: VotingModalProps) => {
    const { voteOnMilestone, setShowVotingModal, votingWalletAccount } = props

    return (
        <div>
            <Dialogue
                title='Want to appove milestone?'
                // closeDialouge={() => setShowVotingModal(false)}
                actionList={
                    <>
                        <li className='button-container !bg-transparent !hover:bg-gray-950  !border !border-solid !border-white'>
                            <button
                                className='primary !bg-transparent !hover:bg-transparent'
                                onClick={() => {
                                    voteOnMilestone(votingWalletAccount, true);
                                    setShowVotingModal(false);
                                }}
                            >
                                Yes
                            </button>
                        </li>
                        <li className='button-container !bg-transparent !hover:bg-transparent  !border !border-solid !border-white'>
                            <button
                                className='primary !bg-transparent !hover:bg-transparent'
                                onClick={() => {
                                    voteOnMilestone(votingWalletAccount, false);
                                    setShowVotingModal(false);
                                }}
                            >
                                No
                            </button>
                        </li>
                    </>
                }
            />
        </div>
    );
};

export default VotingModal;