import React from 'react';

import styles from '../styles/modules/newBrief.module.css';

export type OptionProps = {
  label: string;
  value: string | number;
  checked?: boolean;
  children?: React.ReactNode;
  onSelect: () => void;
  textclass?: string;
};

export const Option = ({
  label,
  value,
  checked,
  children,
  onSelect,
  textclass,
}: OptionProps): JSX.Element => {
  return (
    <div className='option-container' onClick={onSelect}>
      <div className='option-inner'>
        <input
          type='radio'
          value={value}
          checked={checked}
          onChange={(e) => {
            e.target.checked && onSelect();
          }}
        />
        <p className={`${styles.fieldName} ${textclass}`}>{label}</p>
      </div>
      <div className='option-children-container'>{children}</div>
    </div>
  );
};
