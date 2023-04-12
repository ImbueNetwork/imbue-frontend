import CustomButton from "@/components/CustomMaterialComponents/Button";
import TextInput from "@/components/CustomMaterialComponents/TextInput";
import { postAPIHeaders } from "@/config";
import { redirectBack } from "@/utils";
import { Buttons } from "@/utils/helper";
import React, { useEffect, useState } from "react";


const Logout = () => {
  const logout = async () => {
    await fetch(`/api/auth/logout`, {
      headers: postAPIHeaders,
      method: "get",
    });
    await redirectBack();
  };


  useEffect(() => {
    void logout();
  }, []);

};

export default Logout;
