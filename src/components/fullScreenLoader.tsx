import { appLoader } from '@/assets/svgs';
import Image from 'next/image';
import React from 'react'

function FullScreenLoader() {
  return (
    <div
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
      <Image
        src={appLoader}
        alt={"spinner"}
        priority
        style={{
          height: "100%",
          width: "100%",
          animation:'rotation 4s infinite linear',
        }}
      />
    </div>
  );
}

export default FullScreenLoader