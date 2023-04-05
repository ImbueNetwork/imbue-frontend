import {
  FormControl,
  InputLabel,
  FilledInput,
  FormHelperText,
} from "@mui/material";
import React, { useState } from "react";
import styled from "@emotion/styled";

type TextInputProps = {
  name: string;
  message?: string;
  error?: boolean;
  placeholder?: string;
  widthPercent?: number;
  mt?: number;
  inputType?: string;
  value?: string | number;
  showSuffix?: boolean;
  showPreffix?: boolean;
  suffixText?: string;
  preffixText?: string;
  disabled?: boolean;
  onChangeText?: (val: string) => void | undefined;
};

type InputProps = {
  error: boolean;
};

const Input = styled(FilledInput)(({ error }: InputProps) => ({
  "&": {
    height: 58,
  },
  "&:after": {
    borderBottom: error ? "1px solid #ff5a58" : "1px solid #b2ff0b",
  },
  "& .Mui-focused": {
    borderBottom: error ? "1px solid #ff5a58" : "1px solid #000",
  },
}));

const SpacedRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  position: relative;
`;

const TextInput = ({
  name,
  error = false,
  placeholder,
  message,
  widthPercent,
  mt,
  inputType = "text",
  value,
  disabled = false,
  showSuffix = false,
  suffixText = ".00",
  onChangeText,
  showPreffix,
  preffixText,
}: TextInputProps): JSX.Element => {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        width: widthPercent ? `${widthPercent}%` : "100%",
        marginTop: mt || 0,
      }}
    >
      <FormControl
        style={{
          backgroundColor: disabled
            ? "rgba(235, 234, 226, 0.23)"
            : "rgba(235, 234, 226, 0.12)",
        }}
        variant="filled"
        className="text-input-container"
      >
        <InputLabel
          htmlFor="component-filled"
          className={
            disabled
              ? "disabled-text"
              : error
              ? "text-input-label-error"
              : focused
              ? "text-input-label-focused"
              : "text-input-label"
          }
        >
          {placeholder}
        </InputLabel>
        <SpacedRow>
          {showPreffix && focused && (
            <span className="preffix">{preffixText}</span>
          )}
          <Input
            id="component-filled"
            name={name}
            error={error}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="text-input-field"
            value={value}
            type={inputType}
            disabled={disabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChangeText && onChangeText(e.target.value);
            }}
            style={{
              width: "100%",
              paddingRight: showSuffix ? 50 : 0,
              paddingLeft: showPreffix ? 50 : 0,
            }}
          />
          {showSuffix && <span className="suffix">{suffixText}</span>}
        </SpacedRow>
      </FormControl>

      <FormHelperText
        className={error ? "text-input-field-error" : "text-input-field-help"}
      >
        {focused ? `${message || " "}` : " "}
      </FormHelperText>
    </div>
  );
};

export default TextInput;
