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
const BlackBg = styled.div`
  height: 100%;
  width: 100%;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  top: 0px;
  left: 0px;
`;

function FullScreenLoader() {
  return (
    <BlackBg>
      <LoaderContainer
        id="loading"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          height: 150,
        }}
        hidden={false}
      >
        <Image src={appLoader} alt={"spinner"} style={spinnerStyle} />
      </LoaderContainer>
    </BlackBg>
  );
}

export default FullScreenLoader;
