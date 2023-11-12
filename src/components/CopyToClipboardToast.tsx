import { Alert } from '@mui/material';
import React, { ReactNode, useState } from 'react';


interface CopyToClipboardProps {
    link: string;
    title: string;
    children: ReactNode;
    extraClass?: string;
}

const CopyToClipboardToast = (props: CopyToClipboardProps) => {
    const { link, title, children, extraClass } = props;
    const [copied, setCopied] = useState<string>('');

    const copyToClipboard = () => {
        const textToCopy = link || '';

        navigator.clipboard.writeText(textToCopy);
        setCopied(title);

        setTimeout(() => {
            setCopied('');
        }, 3000);
    };

    return (
        <div className='inline'>
            <div
                className={`fixed ${extraClass || "top-5"} z-10 transform duration-300 transition-all ${copied ? 'right-5' : '-right-full'
                    }`}
            >
                <Alert severity='success'>{`${copied} Copied to clipboard`}</Alert>
            </div>

            <div className='inline cursor-pointer' onClick={copyToClipboard}>
                {children}
            </div>
        </div>
    );
};

export default CopyToClipboardToast;