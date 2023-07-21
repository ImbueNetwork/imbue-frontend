import styled from '@emotion/styled';
import {
  FilledInput,
  FormControl,
  FormHelperText,
  InputLabel,
} from '@mui/material';
import React, { useState } from 'react';

type TextAreaProps = {
  name: string;
  message?: string;
  error?: boolean;
  placeholder?: string;
  mt?: number;
};

type InputProps = {
  error: boolean;
};

const Input = styled(FilledInput)(({ error }: InputProps) => ({
  '&:after': {
    borderBottom: error ? '1px solid #ff5a58' : '1px solid #b2ff0b',
  },
  '& .Mui-focused': {
    borderBottom: error ? '1px solid #ff5a58' : '1px solid #000',
  },
}));

const SpacedRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TextArea = ({
  name,
  error = false,
  placeholder,
  message,
  mt,
}: TextAreaProps): JSX.Element => {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState<any>();

  const countText = (str: string): number => {
    return str.length;
  };

  return (
    <div style={{ marginTop: mt || 0 }}>
      <FormControl variant='filled' className='text-input-container'>
        <InputLabel
          htmlFor='component-filled'
          className={
            error
              ? 'text-input-label-error'
              : focused
              ? 'text-input-label-focused'
              : 'text-input-label'
          }
        >
          {placeholder}
        </InputLabel>
        <Input
          id='component-filled'
          name={name}
          multiline
          rows={12}
          error={error}
          value={text?.slice(0, 5000)}
          onChange={(e) => setText(e?.target?.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className='text-area-input-field'
        />
      </FormControl>
      <SpacedRow>
        <FormHelperText
          className={error ? 'text-input-field-error' : 'text-input-field'}
        >
          {focused ? `${message || ' '}` : ' '}
        </FormHelperText>
        <FormHelperText className='text-input-field'>
          {countText(text)}/5000
        </FormHelperText>
      </SpacedRow>
    </div>
  );
};

export default TextArea;
