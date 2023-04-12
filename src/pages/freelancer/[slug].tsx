/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import {
  FaFacebook,
  FaRegShareSquare,
  FaTwitter,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { IoPeople } from "react-icons/io5";
import { Freelancer, User } from "@/model";
import {
  getFreelancerProfile,
  updateFreelancer,
} from "@/redux/services/freelancerService";
import { fetchUser, getCurrentUser } from "../../utils";
import ChatPopup from "@/components/ChatPopup";
import Image from "next/image";
import { TextArea } from "@/components/Briefs/TextArea";
import { useRouter } from "next/router";

export type ProfileProps = {
  initFreelancer: Freelancer;
};

const Profile = (): JSX.Element => {
  const router = useRouter();
  const slug = router.query.slug as string;
  const [freelancer, setFreelancer] = useState<any | undefined>();
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [browsingUser, setBrowsingUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const isCurrentFreelancer =
    browsingUser && browsingUser.id == freelancer?.user_id;

  const socials = [
    {
      label: "Facebook",
      key: "facebook_link",
      value: freelancer?.facebook_link,
      icon: (
        <FaFacebook
          onClick={() => window.open(freelancer?.facebook_link, "_blank")}
        />
      ),
    },
    {
      label: "Twitter",
      key: "twitter_link",
      value: freelancer?.twitter_link,
      icon: (
        <FaTwitter
          onClick={() => window.open(freelancer?.twitter_link, "_blank")}
        />
      ),
    },
    {
      label: "Telegram",
      key: "telegram_link",
      value: freelancer?.telegram_link,
      icon: (
        <FaTelegram
          onClick={() => window.open(freelancer?.telegram_link, "_blank")}
        />
      ),
    },
    {
      label: "Discord",
      key: "discord_link",
      value: freelancer?.discord_link,
      icon: (
        <FaDiscord
          onClick={() => window.open(freelancer?.discord_link, "_blank")}
        />
      ),
    },
  ];

  const getCurrentFreelancer = async () => {
    if (slug) {
      const profileResponse: any = await getFreelancerProfile(slug);
      setFreelancer(profileResponse);
      setup(profileResponse);
    } else {
      router.back();
    }
  };

  const setup = async (freelancerObject: Freelancer) => {
    if (freelancer) {
      const browsingUserResponse = await getCurrentUser();
      setBrowsingUser(browsingUserResponse);
      setTargetUser(await fetchUser(freelancerObject?.user_id));
    }
  };

  useEffect(() => {
    getCurrentFreelancer();
  }, [slug]);

  //The fields must be pre populated correctly.
  const onSave = async () => {
    if (freelancer) {
      await updateFreelancer(freelancer);
      flipEdit();
    }
  };

  const handleMessageBoxClick = () => {
    if (browsingUser) {
      setShowMessageBox(true);
    }
  };

  const flipEdit = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="profile-container">
      <div className="banner">
        <Image
          src={require("@/assets/images/profile-banner.png")}
          priority
          alt="profile banner"
          className="banner-image w-full object-cover h-[242px]"
        />
      </div>
      <div className="flex flex-col gap-[70px] w-[90%] ml-[auto] mr-[auto]">
        <div className="flex flex-col gap-[16px] bg-[#2c2c2c] rounded-[10px] pb-[30px]">
          <div className="h-[160px] w-[160px] bg-[#2c2c2c] rounded-[100%] p-[50px] z-[2] relative ml-[50px] mt-[-120px] unset">
            <Image
              src={require("@/assets/images/profile-image.png")}
              alt="profile h-full w-full image"
            />
          </div>
          <div className="px-[100px] flex flex-col gap-[16px]">
            <h3 className="!text-2xl font-bold">{freelancer?.display_name}</h3>
            <div className="flex gap-[12px]">
              <ReactCountryFlag countryCode="US" />
              <p className="text-[16px] leading-[1.2] text-[#ebeae2]">
                Los Angeles, United State
              </p>
            </div>
            {/* TODO: Implement reviews */}
            {/* <div className="rating">
                            <p>
                                <FaStar color="var(--theme-yellow)" />
                                <FaStar color="var(--theme-yellow)" />
                                <FaStar color="var(--theme-yellow)" />
                                <FaStar color="var(--theme-yellow)" />
                            </p>
                            <p>
                                <span>Top Rated</span>
                                <span className="review-count">
                                    (1434 reviews)
                                </span>
                            </p>
                        </div> */}
            <div className="flex gap-[15px]">
              <p className="text-[16px] leading-[1.2] text-[#ebeae2]">
                @{freelancer?.username}
              </p>
              <IoPeople color="var(--theme-secondary)" size="24px" />
              <p className="text-[16px] leading-[1.2] text-[#ebeae2]">
                {freelancer?.title}
              </p>
            </div>
            <div className="connect-buttons flex gap-[24px] mb-[20px]">
              {!isCurrentFreelancer && (
                <>
                  <button
                    onClick={() => handleMessageBoxClick()}
                    className=" message"
                  >
                    Message
                  </button>
                </>
              )}
              {!isEditMode && isCurrentFreelancer && (
                <button onClick={() => flipEdit()} className="message">
                  Edit Profile <FiEdit />
                </button>
              )}
              {isEditMode && isCurrentFreelancer && (
                <button onClick={() => onSave()} className="message">
                  Save Changes <FiEdit />
                </button>
              )}

              <button className="share">
                <FaRegShareSquare color="white" />
                Share Profile
              </button>
            </div>
            {/* TODO: Implement */}
            {/* <div className="divider"></div>
                        <div className="show-more">
                            Show more{"  "}
                            <MdKeyboardArrowDown size="20" />
                        </div> */}
          </div>
        </div>

        <div className="pt-[30px] pr-[50px] pb-[80px] pl-[100px] flex flex-col gap-[16px] bg-[#2c2c2c] rounded-[10px] ">
          <div className="header-editable">
            <h5>About</h5>
          </div>
          {isEditMode ? (
            <>
              <TextArea
                maxLength={1000}
                value={freelancer?.bio}
                onChange={(e) => {
                  if (freelancer) {
                    setFreelancer({
                      ...freelancer,
                      bio: e.target.value,
                    });
                  }
                }}
                rows={8}
                className="bio-inpu bg-[#1a1a19] text-white border border-solid border-[#fff]"
                id="bio-input-id"
              />
            </>
          ) : (
            <div className="bio">
              {freelancer?.bio
                ?.split?.("\n")
                ?.map?.((line: any, index: number) => (
                  <p className="leading-[1.2] text-base" key={index}>
                    {line}
                  </p>
                ))}
            </div>
          )}
        </div>

        <div className="flex">
          <div className="flex flex-col gap-[36px] grow shrink-0 basis-[40%]">
            <div className="py-[32px] px-[24px] flex flex-col gap-[16px] bg-[#2c2c2c] rounded-[10px]">
              <div className="ml-[80px]">
                <h5>Linked Account</h5>
                <div className="flex flex-col gap-[16px] mt-[24px]">
                  {socials?.map(({ label, key, value, icon }, index) =>
                    !isEditMode ? (
                      <div
                        className="w-[300px] h-[40px] flex justify-between items-center"
                        key={index}
                      >
                        <p className="text-base leading--1.2]">{label} </p>
                        <button className="bg-[#262626] w-[32px] h-[32px] rounded-[10px] text-[#ebeae2] border-none text-[20px] font-semibold items-center justify-center">
                          {socials && value ? icon : "+"}
                        </button>
                      </div>
                    ) : (
                      <div
                        className="w-[300px] h-[40px] flex justify-between items-center"
                        key={index}
                      >
                        <TextArea
                          value={freelancer && freelancer[key]}
                          onChange={(e) => {
                            if (freelancer) {
                              setFreelancer({
                                ...freelancer,
                                [key]: e.target.value,
                              });
                            }
                          }}
                          //   className="bio-input"
                          className="bio-inpu bg-[#1a1a19] text-white border border-solid border-[#fff]"
                          id="bio-input-id"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="w-full border border-solid border-[#ffffff80]" />

              <div className="ml-[80px]">
                <div className="header-editable">
                  <h5>Skills</h5>
                </div>
                <div className="flex flex-wrap gap-[20px] mt-[24px]">
                  {/* TODO: Add Skills */}
                  {freelancer?.skills?.map?.((skill: any) => (
                    <p
                      className="py-[12px] px-[24px] border border-solid border-white rounded-[8px] text-base"
                      key={skill?.id}
                    >
                      {skill.name}
                    </p>
                  ))}
                </div>
              </div>

              <div className="w-full border border-solid border-[#ffffff80]" />
              {/* TODO: Implement */}
              {/* <div className="subsection">
                                <div className="header-editable">
                                    <h5>Certification</h5>
                                    <div className="btn-add">Add Now</div>
                                </div>
                                <p className="text-grey">
                                    Add your certification
                                </p>
                            </div> */}
            </div>
            {/* <div className="section portfolio-breakdown">
                            <div className="subsection">
                                <h5>Portfolio Breakdown</h5>
                            </div>
                            <div className="divider" />
                            <div className="subsection">
                                {portfolio?.map(
                                    ({ category, rate }, index) => (
                                        <div
                                            className="breakdown-item"
                                            key={index}
                                        >
                                            <p className="category">
                                                {category}
                                            </p>
                                            <div className="progress-container">
                                                <div
                                                    className="progress-indicator"
                                                    style={{
                                                        width: `${rate}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="rate">{rate}%</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div> 
                        {/* <div className="section activities">
                            <div className="subsection">
                                <h5>Account Activities</h5>
                            </div>
                            <div className="divider" />
                            <div className="activity-list">
                                <div className="activity-record">
                                    <p>Trusted Device Management</p>
                                    <button className="primary-button">
                                        Management
                                    </button>
                                </div>
                            </div>
                        </div> */}
          </div>
          {/* <div className="projects">
                        {this.state.projects?.map(
                            (
                                {
                                    image,
                                    milestoneComplete,
                                    milestoneCount,
                                    percent,
                                    title,
                                },
                                index
                            ) => (
                                <div className="project" key={index}>
                                    <div className="project-image-container">
                                        <img
                                            src="/public/project.png"
                                            width="100%"
                                            height="100%"
                                        />
                                        <div className="dark-layer" />
                                    </div>
                                    <div className="project-info">
                                        <h5>{title}</h5>
                                        <div className="project-progress">
                                            <div
                                                className="project-progress-indicator"
                                                style={{
                                                    width: `${percent}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="milestone-progress">
                                            <p>{percent}%</p>
                                            <p>{`Milestone ${milestoneComplete ?? 0
                                                }/${milestoneCount}`}</p>
                                        </div>
                                    </div>
                                    <button className="primary-button full-width">
                                        Read More
                                    </button>
                                </div>
                            )
                        )}
                    </div> */}
        </div>
      </div>
      {browsingUser && showMessageBox && (
        <ChatPopup
          {...{ showMessageBox, setShowMessageBox, targetUser, browsingUser }}
        />
      )}
    </div>
  );
};

export default Profile;
