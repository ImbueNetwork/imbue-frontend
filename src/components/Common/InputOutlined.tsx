import React, { InputHTMLAttributes } from 'react';

interface InputOutlinedProps {
    props?: InputHTMLAttributes<HTMLInputElement>;
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

const InputOutlined = ({ props = {}, inputProps = {} }: InputOutlinedProps) => {

    if (!props?.className) {
        props.className = "h-[2.6rem] my-2 px-[14px] text-[0.875rem] border border-[#BCBCBC] evenShadow focus-within:outline focus-within:outline-1 focus-within:outline-imbue-purple rounded-[4px] flex items-center w-full"
    }

    if (!inputProps?.className) {
        inputProps.className = "outline-none w-full text-black"
    }
    return (
        <div {...props}>
            <input
            multiple
                {...inputProps}
            />
        </div>
    );
};

export default InputOutlined;