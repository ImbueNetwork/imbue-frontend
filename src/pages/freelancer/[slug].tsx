/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import {
  FaFacebook,
  FaRegShareSquare,
  FaTwitter,
  FaTelegram,
  FaDiscord,
  FaStar,
  FaRegThumbsUp,
  FaRegThumbsDown,
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
import { GrCertificate } from 'react-icons/gr'
import { AiOutlineUser } from 'react-icons/ai'
import { MdOutlineWatchLater } from 'react-icons/md'
import { ImStack } from 'react-icons/im'
import styles from '@/styles/freelancers.module.css'
import fiverrIcon from "@/assets/images/fiverr.png"
import ImbueIcon from "@/assets/svgs/loader.svg"
import { authenticate } from "@/pages/api/info/user";
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { StyledEngineProvider } from "@mui/system";


export type ProfileProps = {
  initFreelancer: Freelancer;
  user: User
};

const Profile = ({ initFreelancer, user }: ProfileProps): JSX.Element => {
  const router = useRouter();
  const slug = router.query.slug as string;
  const [freelancer, setFreelancer] = useState<any>(initFreelancer);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [browsingUser, setBrowsingUser] = useState<User>(user);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const isCurrentFreelancer = browsingUser && browsingUser.id == freelancer?.user_id;

  const socials = [
    {
      label: "Facebook",
      key: "facebook_link",
      // value: freelancer?.facebook_link,
      value: "facebook.com",
      icon: (
        <FaFacebook color="#4267B2"
          onClick={() => window.open(freelancer?.facebook_link, "_blank")}
        />
      ),
    },
    {
      label: "Twitter",
      key: "twitter_link",
      // value: freelancer?.twitter_link,
      value: "twitter.com",
      icon: (
        <FaTwitter color="#1DA1F2"
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

  const work = {
    title: "Product Development Engineer",
    ratings: 3,
    time: "Jan 19, 2023 - Jan 20, 2023",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed rhoncus elit nec imperdiet mollis. Donec et pharetra magna. Fusce sed urna vestibulum, pretium turpis eu, ultricies urna. Donec faucibus, justo sed pretium commodo, felis sapien malesuada mauris, a finibus orci dolor non ante. Morbi aliquam tortor in massa efficitur pulvinar. Ut interdum tempor aliquet. Duis eget dignissim nunc. Ut non ligula nec lectus cursus tincidunt eget nec mauris",
    budget: 23000,
    budgetType: "Fixed Price"
  }

  const reviews = [
    {
      name: "Sam",
      ratings: 3,
      time: "1 month",
      description: "I have created a web NFT marketplace landing page for imbue , you can check on my profile to see more",
      countryCode: "US",
      country: "United States",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
      name: "Sausan",
      ratings: 3,
      time: "1 month",
      description: "I have created a web NFT marketplace landing page for imbue , you can check on my profile to see more",
      countryCode: "NO",
      country: "Norway",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
      name: "Aala S.",
      ratings: 3,
      time: "1 month",
      description: "I have contacted idris muhammad for building web3 for new eBook product that i am developing for my coaching business",
      countryCode: "CA",
      country: "Canada",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
    },

  ]

  const setup = async () => {
    if (freelancer) {
      setTargetUser(await fetchUser(freelancer?.user_id));
    }
  };

  useEffect(() => {
    setup();
  }, [freelancer]);

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
    <div className="profile-container -mt-8">
      <div className="banner">
        <Image
          src={require("@/assets/images/profile-banner.png")}
          priority
          alt="profile banner"
          className="banner-image w-full object-cover h-[242px]"
        />
      </div>

      <div className="flex justify-evenly mx-[80px]">

        <div className="flex flex-col gap-[70px] w-[40%]">
          <div className="flex flex-col gap-[16px] pb-[30px] px-[100px] bg-theme-grey-dark rounded-xl border border-light-white">
            <div className="h-[160px] w-[160px] bg-[#2c2c2c] rounded-[100%] p-[50px] z-[2] relative mt-[-120px] unset mx-auto">
              <Image
                src={require("@/assets/images/profile-image.png")}
                alt="profile h-full w-full image"
              />
            </div>
            <div className="flex flex-col gap-[16px] -mt-11 z-10">
              <h3 className="!text-2xl font-bold">{freelancer?.display_name}</h3>
              <div className="flex gap-[15px] items-center">
                <p className="text-[16px] leading-[1.2] text-[#ebeae2] text-primary">
                  @{freelancer?.username?.length > 20 ? freelancer?.username?.slice(0, 20) + '...' : freelancer?.username}
                </p>
                <div className="flex items-center gap-2">
                  <IoPeople color="var(--theme-secondary)" size="24px" />
                  <p className="text-[16px] leading-[1.2] text-[#ebeae2]">
                    {freelancer?.title}
                  </p>
                </div>
              </div>
              <div className="flex gap-[12px]">
                <ReactCountryFlag countryCode="US" />
                <p className="text-[16px] leading-[1.2] text-[#ebeae2]">
                  Los Angeles, United State
                </p>
              </div>
              {/* TODO: Implement reviews */}
              <div className="rating flex gap-3">
                <p className="mb-3">
                  <FaStar color="var(--theme-primary)" />
                  <FaStar color="var(--theme-primary)" />
                  <FaStar color="var(--theme-primary)" />
                  <FaStar color="white" />
                </p>
                <p>
                  <span>Top Rated</span>
                  <span className="review-count ml-1">
                    (1434 reviews)
                  </span>
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
            <hr className="separator" />

            <div className="flex items-center gap-3">
              <p className="text-xl">Among my clients</p>
              <span className="h-4 w-4 flex justify-center items-center rounded-full bg-gray-500 text-black">?</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <Image className="rounded-lg" height={40} width={40} src={fiverrIcon} alt="Fiverr Icon" />
                <p>Fiverr</p>
              </div>
              <div className="flex items-center gap-3">
                <Image className="rounded-lg" height={40} width={40} src={ImbueIcon} alt="Imbue Icon" />
                <p>Imbue</p>
              </div>
            </div>
            <hr className="separator" />

            <div>
              <p className="text-xl">Wallet Address</p>
              <div className="mt-3 border break-words p-3 rounded-md bg-black">
                0x524c3d9e935649A448FA33666048C
              </div>
            </div>
            <hr className="separator" />

            <div>
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-4">
                  <AiOutlineUser size={24} />
                  <p className="text-light-grey">Member Since</p>
                </div>
                <div>
                  Jan 2023
                </div>
              </div>
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-4">
                  <MdOutlineWatchLater size={24} />
                  <p className="text-light-grey">Last project Delivery</p>
                </div>
                <div>
                  2 hour
                </div>
              </div>
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-4">
                  <ImStack size={24} />
                  <p className="text-light-grey">Number of projects</p>
                </div>
                <div>
                  58
                </div>
              </div>
            </div>

          </div>

          <div className="flex">
            <div className="flex flex-col gap-[36px] grow shrink-0 basis-[40%]">
              <div className={styles.freelancerProfileSection}>
                <div className="mx-[30px]">
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

                <hr className="separator" />

                <div className="mx-[30px]">
                  <div className="header-editable">
                    <h5>Skills</h5>
                  </div>
                  <div className="flex flex-wrap gap-[20px] mt-[24px]">
                    {/* TODO: Add Skills */}
                    {freelancer?.skills?.map?.((skill: any) => (
                      <p
                        className={styles.skillsButton}
                        key={skill?.id}
                      >
                        {skill.name}
                      </p>
                    ))}
                  </div>
                </div>

                <hr className="separator" />
                {/* TODO: Implement */}
                <div className="ml-[30px]">
                  <div className="header-editable">
                    <h5>Certification</h5>
                    <div className="flex gap-3 mt-4">
                      <div className="bg-theme-secondary h-11 w-11 rounded-full flex justify-center items-center">
                        <GrCertificate className={styles.whiteIcon} size={24} />
                      </div>
                      <div>
                        <p className="text-light-grey">Web3 Certification of participation</p>
                        <p className="text-light-grey">Jan 14</p>
                      </div>
                    </div>
                  </div>

                </div>
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

          <div className={styles.freelancerProfileSection}>
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
            ) : (<>
              <div className="bio">
                {freelancer?.bio
                  ?.split?.("\n")
                  ?.map?.((line: any, index: number) => (
                    <p className="leading-[1.2] text-base" key={index}>
                      {line}
                    </p>
                  ))}
              </div>
            </>
            )}
            <hr className="separator" />


            <div className="header-editable">
              <h5>Education</h5>
            </div>
            {isEditMode ? (
              <>
                <TextArea
                  maxLength={1000}
                  value={freelancer?.education}
                  onChange={(e) => {
                    if (freelancer) {
                      setFreelancer({
                        ...freelancer,
                        education: e.target.value,
                      });
                    }
                  }}
                  rows={8}
                  className="bio-inpu bg-[#1a1a19] text-white border border-solid border-[#fff]"
                  id="bio-input-id"
                />
              </>
            ) : (<>
              <div className="bio">
                {/* TODO: Implementation */}
                {/* {freelancer?.education
                  ?.split?.("\n")
                  ?.map?.((line: any, index: number) => (
                    <p className="leading-[1.2] text-base" key={index}>
                      {line}
                    </p>
                  ))} */}
                Bsc. Computer Science
              </div>
            </>
            )}
          </div>
        </div>

        <div className="w-[45%]">
          <div className="bg-theme-grey-dark rounded-xl border border-light-white">
            <div className="px-[80px] py-[30px] border-b border-b-light-white">
              <h3 className="mb-3">Work History</h3>
              <p className="text-primary">Completed Projects (3)</p>
            </div>
            <div>
              {
                [...Array(3)].map((v, i) => (
                  <div key={i} className="px-[80px] py-[30px] flex flex-col gap-3 border-b last:border-b-0 border-b-light-white">
                    <p className="text-xl">{work.title}</p>
                    <div className="flex gap-8">
                      <div>
                        {
                          [...Array(4)].map((r, ri) => <FaStar size={24} key={ri} color={(ri + 1) > work.ratings ? "white" : "var(--theme-primary)"} />)
                        }
                      </div>
                      <p className="text-light-grey">{work.time}</p>
                    </div>
                    <p className="text-light-grey">{work.description}</p>
                    <div className="flex justify-between">
                      <p className="">${work.budget}</p>
                      <p className="">{work.budgetType}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <p className="text-primary text-right m-2 cursor-pointer">View More</p>

          <StyledEngineProvider injectFirst>
            <div className="flex flex-col">
              <TextField
                id="outlined-controlled"
                label="Search"
                sx={{ maxWidth: "350px" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl variant="standard" sx={{ m: 1, minWidth: 180, maxWidth: "100px" }}>
                <InputLabel id="demo-simple-select-standard-label">Sort by most relevant</InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  // value={age}
                  // onChange={handleChange}
                  label="Sort by most relevant"
                >
                  <MenuItem value={10}>Ratings</MenuItem>
                  <MenuItem value={20}>Budget</MenuItem>
                  <MenuItem value={30}>Date</MenuItem>
                </Select>
              </FormControl>
            </div>
          </StyledEngineProvider>
          <hr className="separator" />

          <div className="flex flex-col gap-5">
            {
              reviews.map((review, index) => (
                <div key={index} className="flex flex-col gap-3 pt-2 pb-5 border-b last:border-b-0 border-b-light-white">
                  <div className="flex gap-3">
                    <div className="h-[46px] w-[46px] rounded-full overflow-hidden relative">
                      <Image className="object-cover" src={review.image} fill alt="user" />
                    </div>
                    <div>
                      <p>{review.name}</p>
                      <div className="flex gap-2 items-center">
                        <ReactCountryFlag countryCode={review.countryCode} />
                        <span>{review.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {
                      [...Array(4)].map((r, ri) => <FaStar size={24} key={ri} color={(ri + 1) > review.ratings ? "white" : "var(--theme-primary)"} />)
                    }
                    <span className="text-light-grey ml-2">| {review.time}</span>
                  </div>
                  <p className="mt-2">{review.description}</p>
                  <div className="flex gap-4">
                    <p>Helpful?</p>
                    <div className="flex gap-3">
                      <div className="cta-vote">
                        <FaRegThumbsUp />
                        Yes
                      </div>
                      <div className="cta-vote">
                        <FaRegThumbsDown />
                        No
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }

          </div>

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


export const getServerSideProps = async (context: any) => {
  const { req, res, query } = context;

  let initFreelancer: any;
  if (query.slug) {
    initFreelancer = await getFreelancerProfile(query.slug);
  }

  try {
    const user = await authenticate("jwt", req, res);
    if (user) {
      return { props: { isAuthenticated: true, user, initFreelancer } };
    }
  } catch (error: any) {
    console.error(error);
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};

export default Profile;

