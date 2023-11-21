import React, { DetailedHTMLProps, InputHTMLAttributes } from 'react';

interface InputOutlinedProps {
    props?: InputHTMLAttributes<HTMLInputElement>;
    inputProps?: DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
}

const TextAreaOutlined = ({ props = {}, inputProps = {} }: InputOutlinedProps) => {

    if (!props?.className) {
        props.className = "my-2 p-[6px] text-[0.875rem] border border-[#BCBCBC] evenShadow focus-within:outline focus-within:outline-1 focus-within:outline-imbue-purple rounded-[4px] w-full"
    }

    inputProps.className = "outline-none !border-0 w-full text-black " + inputProps.className

    return (
        <div {...props}>
            <textarea
                rows={7}
                {...inputProps}
            />
        </div>
    );
};

export default TextAreaOutlined;