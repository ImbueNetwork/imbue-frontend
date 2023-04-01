import CustomButton from "@/components/customMaterialComponents/Button";
import TextInput from "@/components/customMaterialComponents/textInput";
import { Buttons } from "@/utils/helper";
import React, { useState } from "react";

const TransferStyle = {
  btnWrap: {
    marginTop: 6,
    height: 58,
    backgroundColor: "var(--theme-secondary)",
  },
  hoverStyle: {
    backgroundColor: "var(--theme-primary)",
    color: "black",
  },
};

const fieldSetStyle = { width: "100%", padding: 0 };

const Relay = () => {
  const [value, setValue] = useState("");
  return (
    <div>
      <h1 className="fund-h1">My funds</h1>

      <p>Transfer KSM to Imbue Network</p>
      <fieldset style={fieldSetStyle}>
        <TextInput
          name="unlock"
          placeholder="Amount to transfer*"
          message="The total amount to transfer."
          showSuffix
          suffixText=""
          showPreffix
          preffixText="$KSM"
          value={value}
          inputType="number"
          onChangeText={(val) => {
            setValue(val);
          }}
        />

        <CustomButton
          text="Transfer"
          variant={Buttons.CONTAINED}
          btnWrapStyle={TransferStyle.btnWrap}
          hoverStyle={TransferStyle.hoverStyle}
        />
      </fieldset>
    </div>
  );
};

export default Relay;
