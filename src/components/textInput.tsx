import { FormControl, InputLabel, FilledInput, FormHelperText, } from '@mui/material'
import React, { useState } from 'react';
import styled from '@emotion/styled';


type TextInputProps = {
  name: string;
  message?: string;
  error?: boolean;
  placeholder?: string;
};

type InputProps = {
  error: boolean;
};

const Input = styled(FilledInput)(({ error }: InputProps) => ({
  "&:after": {
    borderBottom: error ? "1px solid #ff5a58" : "1px solid #b2ff0b",
  },
  "& .Mui-focused": {
    borderBottom: error ? "1px solid #ff5a58" : "1px solid #000",
  },
}));



const TextInput = ({
  name,
  error = false,
  placeholder,
  message,
}: TextInputProps): JSX.Element => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FormControl variant="filled" className="text-input-container">
        <InputLabel
          htmlFor="component-filled"
          className={
            error
              ? "text-input-label-error"
              : focused
              ? "text-input-label-focused"
              : "text-input-label"
          }
        >
          {placeholder}*
        </InputLabel>
        <Input
          id="component-filled"
          name={name}
          error={error}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="text-input-field"
        />
      </FormControl>
      <FormHelperText
        className={error ? "text-input-field-error" : "text-input-field"}
      >
        {focused ? `${message || " "}` : " "}
      </FormHelperText>
    </div>
  );
};

export default TextInput