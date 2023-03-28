import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import React, { ReactNode, useState } from "react";
import styled from "@emotion/styled";

type DropdownSelectProps = {
  error: boolean;
  widthPercent?: number;
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
  max-height: 400px;
  overflow-y: auto;
`;

const Item = styled.div`
  height: 72px;
  padding-left: 16px;
  padding-right: 16px;
  overflow: hidden;
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
`;

const SelectInput = styled(Select)(({ error }: SelectInputProps) => ({
  "&": {
    position: "relative",
    maxWidth: "100%",
    overflow: "hidden",
    height: 56,
  },
  "&:after": {
    borderBottom: error ? "1px solid #ff5a58" : "1px solid #b2ff0b",
  },
  "& .Mui-focused": {
    borderBottom: error ? "1px solid #ff5a58" : "1px solid #000",
  },
}));

const DropdownItems = (): JSX.Element => {
  return (
    <Container>
      <Item>
        <ItemTitle>Community Development</ItemTitle>
        <ItemBody>
          This broad category includes everything from installing solar panels
          at a health clinic or water catchment systems at a school and training
          firefighters in emergency response to supporting the administration of
          microcredit programs. For those who prefer a tangible sign of
          progress, projects in the area of construction—from installing a
          better stove to building a house—may be especially satisfying.
        </ItemBody>
      </Item>
      <Item>
        <ItemTitle>Community Development</ItemTitle>
        <ItemBody>
          This broad category includes everything from installing solar panels
          at a health clinic or water catchment systems at a school and training
          firefighters in emergency response to supporting the administration of
          microcredit programs. For those who prefer a tangible sign of
          progress, projects in the area of construction—from installing a
          better stove to building a house—may be especially satisfying.
        </ItemBody>
      </Item>
    </Container>
  );
};

const DropdownSelect = ({
  error = false,
  widthPercent,
}: DropdownSelectProps): JSX.Element => {
  const [age, setAge] = React.useState("");
  const [focused, setFocused] = useState(false);

  const handleChange = (event: SelectChangeEvent<any>, child: ReactNode) => {
    console.log(event?.target?.value);
    setAge(event?.target?.value);
  };

  return (
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
        Age*
      </InputLabel>
      <SelectInput
        labelId="demo-simple-select-filled-label"
        id="demo-simple-select-filled select-container"
        className="text-input-field"
        value={age}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        error={false}
      />
      {focused && <DropdownItems />}
    </FormControl>
  );
};

export default DropdownSelect;
