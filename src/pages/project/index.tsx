import Image from "next/image";
import React, { useState } from "react";

const openForVotingTag = (): JSX.Element => {
  return (
    <div className="flex flex-row items-center">
      <div className="h-[15px] w-[15px] rounded-[7.5px] bg-[#BAFF36]" />
      <p className="text-xl font-normal leading-[23px] text-[#BAFF36] mr-[27px] ml-[14px]">
        Open for Voting
      </p>
    </div>
  );
};

const projectStateTag = (): JSX.Element => {
  return (
    <div className="flex flex-row items-center">
      <p className="text-[14px] font-normal leading-[16px] text-white">
        Started 25 February 2023
      </p>
      <p className="text-xl font-normal leading-[23px] text-[#411DC9] mr-[27px] ml-[14px]">
        In Progress
      </p>
    </div>
  );
};

const ExpandableDropDowns = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="transparent-conatainer relative !bg-[#2c2c2c] !py-[20px] !border !border-white rounded-[20px]">
      <div
        onClick={() => {
          setExpanded(!expanded);
        }}
        className="flex justify-between w-full items-center"
      >
        <div className="flex flex-row">
          <h3 className="text-[39px] font-normal leading-[60px]">
            Milestone 1
          </h3>
          <h3 className="text-[24px] ml-[32px] font-normal leading-[60px]">
            c++ Network Experts for banking app
          </h3>
        </div>
        <div className="flex flex-row items-center">
          {openForVotingTag()}

          <Image
            src={require(expanded
              ? "@/assets/svgs/minus_btn.svg"
              : "@/assets/svgs/plus_btn.svg")}
            height={25}
            width={25}
            alt="dropdownstate"
          />
        </div>
      </div>

      <div className={`${!expanded && "hidden"} my-6`}>
        <p className="text-[14px] font-normal text-white">
          Percentage of funds to be released{" "}
          <span className="text-[#BAFF36]">45%</span>
        </p>
        <p className="text-[14px] font-normal text-white">
          Funding to be released{" "}
          <span className="text-[#BAFF36]">$45,000 USD</span>
        </p>

        <p className="text-[16px] font-normal text-[#a6a6a6] leading-[178.15%] mt-[23px] w-[80%]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
          purus sit amet luctus venenatis, lectus magna fringilla urna,
          porttitor rhoncus dolor purus non enim praesent elementum facilisis
          leo, vel fringilla est ullamcorper eget nulla facilisi etiam dignissim
          diam quis enim lobortis scelerisque fermentum dui faucibus in ornare
          quam viverra orci sagittis eu volutpat odio facilisis mauris sit amet
          massa vitae tortor condimentum lacinia quis vel eros donec ac odio
          tempor orci dapibus ultrices in iaculis nunc sed augue lacus, viverra
          vitae congue eu, consequat ac felis donec et odio pellentesque diam
          volutpat commodo sed egestas egestas fringilla phasellus faucibus
        </p>

        <button
          className="primary-btn in-dark w-button font-normal h-[43px] items-center content-center !py-0 mt-[25px] px-8"
          data-testid="next-button"
        >
          Vote
        </button>
      </div>
    </div>
  );
};

function Project() {
  return (
    <div>
      <div className="flex flex-row bg-[#2c2c2c] border border-opacity-25 -border--theme-light-white rounded-[20px] p-[50px]">
        <div className="flex flex-col gap-[20px] flex-grow flex-shrink-0 basis-[75%] mr-[5%]">
          <div className="brief-title">
            <h3 className="text-[32px] leading-[1.5] font-normal m-0 p-0">
              Product Development Engineer
            </h3>
            <span className="text-[#b2ff0b] cursor-pointer text-[20px] font-normal !m-0 !p-0 relative top-4">
              View full brief
            </span>
          </div>
          <div className="text-inactive w-[80%]">
            <p className="text-[16px] font-normal leading-[178.15%]">
              How can you help a potential buyer can’t ‘hold’ your products
              online? Help your reader imagine what it would be like to own your
              NFT. Use words that describe what what your NFT is about and how
              owning it will elicit a certain feeling..........How can you help
              a potential buyer can’t ‘hold’ your products online? Help your
              reader imagine what it would be like to own your NFT. U
            </p>
          </div>
          <p className="text-inactive text-[16px] font-normal leading-[1.5] m-0 p-0">
            Posted Feb 21, 2023
          </p>

          <p className="text-white text-[20px] font-normal leading-[1.5] mt-[16px] p-0">
            Freelancer hired
          </p>

          <div className="flex flex-row items-center mt-[20px]">
            <Image
              src={require("@/assets/images/profile-image.png")}
              alt="freelaner-icon"
              height={50}
              width={50}
              className="border border-solid border-white rounded-[25px]"
            />

            <p className="text-white text-[20px] font-normal leading-[1.5] p-0 mx-[27px]">
              Idris Muhammad
            </p>

            <button
              className="primary-btn in-dark w-button !mt-0 font-normal h-[43px] items-center content-center !py-0 ml-[40px] px-8"
              data-testid="next-button"
            >
              Message
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-[50px] flex-grow flex-shrink-0 basis-[20%]">
          <div className="flex flex-col">
            <div className="flex flex-row justify-between w-[70%]">
              <Image
                src={require("@/assets/svgs/shield.svg")}
                height={24}
                width={24}
                alt={"shieldIcon"}
              />

              <h3 className="text-xl leading-[1.5] font-normal m-0 p-0">
                Milestone <span className="text-[#BAFF36]">2/4</span>
              </h3>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-row justify-between w-[70%]">
              <Image
                src={require("@/assets/svgs/dollar_sign.svg")}
                height={24}
                width={24}
                alt={"dollarSign"}
              />
              <h3 className="text-xl leading-[1.5] font-normal m-0 p-0">
                40,000 $IMBU
              </h3>
            </div>

            <div className="text-inactive ml-[20%] mt-[7px]">
              Budget - Fixed
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-row justify-between w-[70%]">
              <Image
                src={require("@/assets/svgs/calendar_icon.svg")}
                height={24}
                width={24}
                alt={"calenderIcon"}
              />

              <h3 className="text-xl leading-[1.5] font-normal m-0 p-0">
                1 to 3 months
              </h3>
            </div>

            <div className="text-inactive  ml-[20%] mt-[7px]">Timeline</div>
          </div>
        </div>
      </div>

      <ExpandableDropDowns />
      <ExpandableDropDowns />
      <ExpandableDropDowns />
    </div>
  );
}

export default Project;
