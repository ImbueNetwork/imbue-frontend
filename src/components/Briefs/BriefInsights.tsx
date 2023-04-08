import React, { useEffect, useState } from "react";
import { FaDollarSign, FaPaperclip, FaRegCalendarAlt } from "react-icons/fa";
import { RiShieldUserLine } from "react-icons/ri";
import { Brief, User } from "@/model";
import { getCurrentUser, redirect } from "@/utils";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

interface BriefInsightsProps {
  brief: Brief;
}
TimeAgo.addDefaultLocale(en);

export const BriefInsights = ({ brief }: BriefInsightsProps) => {
  const timeAgo = new TimeAgo("en-US");
  const timePosted = timeAgo.format(new Date(brief.created));
  const router = useRouter()
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [browsingUser, setBrowsingUser] = useState<User>()

  useEffect(() => {
    const fetchUser = async () => {
        setBrowsingUser(await getCurrentUser());
    }
    fetchUser()
}, [])

  // TODO: need target user for pointing message channel
  // const handleMessageBoxClick = async () => {
  //   if (browsingUser) {
  //     setShowMessageBox(true);
  //   } else {
  // redirect("login", `/dapp/briefs/${brief.id}/`);
  //   }
  // };


  return (
    <div className="brief-container">
      <div className="brief-info">
        <div className="description">
          <div className="flex text-2xl gap-4">
            <p className="font-bold text-2xl">{brief.headline}</p>
            <Link className="clickable-text font-semibold text-lg" href={`/briefs/${brief.id}/`}>View full brief</Link>
          </div>
          <div className="text-inactive">
            <p>{brief.description}</p>
          </div>
          <p className="text-inactive">Posted {timePosted} </p>
        </div>
        <div className="insights">
          {
            // TODO: if project api is implemented then this conditon will change accordingly
            router.pathname === "/projects/[id]"
              ? <div className="">
                <div className="insight-item items-center">
                  <RiShieldUserLine color="var(--theme-white)" size={24} />
                  <h3>Milestone <span className="primary-text">2/4</span></h3>
                </div>
                <div className="w-48 bg-[#1C2608] h-1 relative mt-7 mx-auto">
                  <div
                    style={{
                      // width: `${(application?.milestones?.filter((m) => m.is_approved)?.length / application.milestones?.length) * 100}%`
                      width: `${(2 / 3) * 100}%`
                    }}
                    className="h-full rounded-xl Accepted-button absolute">
                  </div>
                  <div className="flex justify-evenly">
                    {
                      // application.milestones.map((m) => (<div className={`h-4 w-4 ${m.is_approved ? "Accepted-button" : "bg-[#1C2608]"} rounded-full -mt-1.5`}></div>))
                      [1, 2, 3].map((m, i) => (<div key={i} className={`h-4 w-4 ${(i + 1) < 3 ? "Accepted-button" : "bg-[#1C2608]"} rounded-full -mt-1.5`}></div>))
                    }
                  </div>
                </div>
              </div>
              : <div className="insight-item">
                <RiShieldUserLine color="var(--theme-white)" size={24} />
                <div className="insight-value">
                  <h3>{brief.experience_level}</h3>
                  <div className="text-inactive">Experience Level</div>
                </div>
              </div>
          }

          <div className="insight-item">
            <FaDollarSign color="var(--theme-white)" size={24} />
            <div className="insight-value">
              <h3>${Number(brief.budget).toLocaleString()}</h3>
              <div className="text-inactive">Fixed Price</div>
            </div>
          </div>
          <div className="insight-item">
            <FaRegCalendarAlt color="var(--theme-white)" size={24} />
            <div className="insight-value">
              <h3>{brief.duration}</h3>
              <div className="text-inactive">Project length</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold">Freelancer Hired</h3>
        <div className="flex items-center pt-9 gap-8">
          <Image
            src={require("@/assets/images/profile-image.png")}
            className="h-[45px] w-[45px] object-cover"
            alt={"profile-picture"}
            height={45}
            width={45}
          />
          <h3 className="text-xl font-bold">
            {/* {application?.freelancer?.username} */}
            Idris Abdullah
          </h3>
          <button
            // onClick={() =>
            //   handleMessageBoxClick(
            //     application?.user_id,
            //     application?.freelancer
            //   )
            // }
            className="primary-btn in-dark w-button my-0"
          >
            Message
          </button>
        </div>
      </div>

      {/* TODO: need browsing user and targer user to show popup */}
      {/* {browsingUser && showMessageBox && (
            <ChatPopup
              showMessageBox={showMessageBox}
              setShowMessageBox={setShowMessageBox}
              targetUser={targetUser}
              browsingUser={browsingUser}
            />
          )} */}
    </div>
  );
};
