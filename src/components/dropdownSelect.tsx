import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import React, { useRef, useState } from "react";
import styled from "@emotion/styled";
import { DropdownSelectData, NumberOfItemsPerList } from "@/types/proposals";

type DropdownSelectProps = {
  error: boolean;
  widthPercent?: number;
  data: DropdownSelectData[];
  placeholder: string;
  message?: string;
  noOfItemsPerList: NumberOfItemsPerList;
};

type DropdownItemsProps = {
  data?: DropdownSelectData[];
  selected?: DropdownSelectData;
  onSelect: (val: DropdownSelectData) => void;
  noOfItemsPerList: NumberOfItemsPerList;
};

type SelectInputProps = {
  error: boolean;
};

const Container = styled.div`
  width: 100%;
  background-color: #0f0f0f;
  position: absolute;
  z-index: 100;
  top: 60px;
  max-height: 300px;
  min-height: 100px;
  overflow-y: auto;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 5px -3px,
    rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px;
`;

const Item = styled.div<{ noOfItemsPerList: NumberOfItemsPerList }>`
  height: ${({ noOfItemsPerList }) =>
    noOfItemsPerList === 1 ? "var(--mdc-menu-item-height, 48px)" : "72px"};
  padding-left: 16px;
  padding-right: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  :hover {
    background-color: rgba(235, 234, 226, 0.12);
  }
`;

const ItemTitle = styled.span`
  -webkit-font-smoothing: antialiased;
  font-family: var(
    --mdc-typography-subtitle1-font-family,
    var(--mdc-typography-font-family, Roboto, sans-serif)
  );
  font-size: var(--mdc-typography-subtitle1-font-size, 1rem);
  font-weight: var(--mdc-typography-subtitle1-font-weight, 400);
  letter-spacing: var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);
`;

const ItemBody = styled.span`
  -webkit-font-smoothing: antialiased;
  font-family: var(
    --mdc-typography-body2-font-family,
    var(--mdc-typography-font-family, Roboto, sans-serif)
  );
  font-size: var(--mdc-typography-body2-font-size, 0.875rem);
  font-weight: var(--mdc-typography-body2-font-weight, 400);
  letter-spacing: var(--mdc-typography-body2-letter-spacing, 0.0178571em);
  text-decoration: var(--mdc-typography-body2-text-decoration, inherit);
  text-transform: var(--mdc-typography-body2-text-transform, inherit);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin-top: 0px;
  line-height: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  color: #999;
  margin-top: 5px;
`;

const SelectInput = styled(Select)(({ error }: SelectInputProps) => ({
  "&": {
    position: "relative",
    maxWidth: "100%",
    overflow: "hidden",
    height: 58,
  },
  "&:after": {
    borderBottom: error ? "1px solid #ff5a58" : "1px solid #b2ff0b",
  },
  "& .Mui-focused": {
    borderBottom: error ? "1px solid #ff5a58" : "1px solid #000",
  },
}));

const DropdownItems = ({
  data,
  selected,
  onSelect,
  noOfItemsPerList,
}: DropdownItemsProps): JSX.Element => {
  return (
    <Container>
      {data?.map((item, index) => {
        return (
          <Item
            onClick={() => {
              onSelect(item);
            }}
            key={`${index}` + item?.label}
            style={{
              backgroundColor:
                selected?.value === item?.value
                  ? "rgba(178, 255, 11,0.1)"
                  : "none",
            }}
            noOfItemsPerList={noOfItemsPerList}
          >
            <ItemTitle>{item?.label}</ItemTitle>

            {item?.body && <ItemBody>{item?.body}</ItemBody>}
          </Item>
        );
      })}
    </Container>
  );
};

const DropdownSelect = ({
  error = false,
  widthPercent,
  data,
  placeholder,
  message = "",
  noOfItemsPerList = 1,
}: DropdownSelectProps): JSX.Element => {
  const [selected, setSelected] = React.useState<DropdownSelectData>({
    label: "",
    body: "",
    value: "",
  });
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  return (
    <React.Fragment>
      <FormControl
        variant="filled"
        style={{ width: widthPercent ? `${widthPercent}%` : "100%" }}
        className="text-input-container"
      >
        <InputLabel
          htmlFor="component-filled"
          id="demo-simple-select-filled-label"
          className={
            error
              ? "text-input-label-error"
              : focused
              ? "text-input-label-focused"
              : "text-input-label"
          }
        >
          {placeholder}
        </InputLabel>
        <SelectInput
          labelId="demo-simple-select-filled-label"
          id="demo-simple-select-filled select-container"
          className="select-input-field"
          value={selected.value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          error={false}
          inputRef={inputRef}
        >
          {data?.map((item, index) => {
            return (
              <MenuItem value={item?.value} key={`${index}` + item?.label} />
            );
          })}
        </SelectInput>
        {focused && (
          <DropdownItems
            data={data}
            selected={selected}
            onSelect={(val) => {
              setSelected(val);
              inputRef?.current?.focus();
              setFocused(!focused);
            }}
            noOfItemsPerList={noOfItemsPerList}
          />
        )}
      </FormControl>
      <FormHelperText
        className={error ? "text-input-field-error" : "text-input-field-help"}
      >
        {focused ? `${message || " "}` : " "}
      </FormHelperText>
    </React.Fragment>
  );
};

export default DropdownSelect;
