import { appLoader } from "@/assets/svgs";
import Image from "next/image";
import React from "react";
import styled from "@emotion/styled";

const LoaderContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 150px;
`;

const spinnerStyle = {
  height: "100%",
  width: "100%",
  animation: "rotation 4s infinite linear",
};

function FullScreenLoader() {
  return (
    <LoaderContainer
      id="loading"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        height: 150,
      }}
      hidden={true}
    >
      <Image src={appLoader} alt={"spinner"} priority style={spinnerStyle} />
    </LoaderContainer>
  );
}

export default FullScreenLoader;
