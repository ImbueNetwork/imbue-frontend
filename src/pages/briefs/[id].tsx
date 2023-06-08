/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Brief, Freelancer, User } from "@/model";
import { getBrief, saveBriefData } from "@/redux/services/briefService";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { fetchUser, getCurrentUser } from "../../utils";
import StarIcon from "@mui/icons-material/Star";
import ArrowIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import { useRouter } from "next/router";
import BioPanel from "@/components/Briefs/BioPanel";
import BioInsights from "@/components/Briefs/BioInsights";
import { getServerSideProps } from "@/utils/serverSideProps";
import ErrorScreen from "@/components/ErrorScreen";
import { getFreelancerProfile } from "@/redux/services/freelancerService";
import SuccessScreen from "@/components/SuccessScreen";

TimeAgo.addLocale(en);

export type BriefProps = {
  brief: Brief;
};

const BriefDetails = (): JSX.Element => {
  const router = useRouter();
  const [success, setSuccess] = useState<boolean>(false);
  const [successTitle, setSuccessTitle] = useState<string>("");
  const [brief, setBrief] = useState<Brief>({
    id: "",
    headline: "",
    industries: [],
    description: "",
    skills: [],
    scope_id: 0,
    scope_level: "",
    duration: "",
    duration_id: 0,
    budget: 0,
    created: new Date(),
    created_by: "",
    experience_level: "",
    experience_id: 0,
    number_of_briefs_submitted: 0,
    user_id: 0,
  });

  const [browsingUser, setBrowsingUser] = useState<User | null>(null);
  const [freelancer, setFreelancer] = useState<Freelancer>();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const isOwnerOfBrief = browsingUser && browsingUser.id == brief.user_id;
  const [showSimilarBrief, setShowSimilarBrief] = useState<boolean>(false);
  const [showClientHistory, setShowClientHistory] = useState<boolean>(false);
  const [error, setError] = useState<any>();

  // TODO: need to get project category array from the brief
  const projectCategories = brief?.industries?.map?.((item) => item?.name);

  const id: any = router?.query?.id || 0;

  const fetchData = async () => {
    if (id) {
      const briefData: Brief | Error | undefined = await getBrief(id);
      if (briefData?.id) {
        const targetUser = await fetchUser(briefData.user_id);
        setBrief(briefData);
        const currentUser = await getCurrentUser();
        const _freelancer = await getFreelancerProfile(currentUser.username);
        setBrowsingUser(currentUser);
        setTargetUser(targetUser);
        setFreelancer(_freelancer);
      } else {
        setError({ message: "No Brief Found" });
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const redirectToApply = () => {
    //TODO: redirect to apply for brief
    router.push(`/briefs/${brief.id}/apply`);
  };

  const handleMessageBoxClick = async () => {
    if (browsingUser) {
      setShowMessageBox(true);
    } else {
      // redirect("login", `/dapp/briefs/${brief.id}/`);
    }
  };

  const saveBrief = async () => {
    const resp = await saveBriefData({
      ...brief,
      currentUserId: browsingUser?.id,
    });
    if (resp?.brief_id) {
      setSuccessTitle("Brief Saved Successfully");
      setSuccess(true);
    } else {
      setError({ message: "Brief already Saved" });
    }
  };

  const ClientHistory = (
    <div className="transparent-conatainer relative max-width-750px:!px-3">
      <div className="flex justify-between w-full">
        <h3>Client Contact History (4)</h3>
        <div
          className={`transition transform ease-in-out duration-600 ${
            showClientHistory && "rotate-180"
          } cursor-pointer`}
        >
          <ArrowIcon
            onClick={() => setShowClientHistory(!showClientHistory)}
            className="scale-150"
          />
        </div>
      </div>
      <div className={`${!showClientHistory && "hidden"} my-6`}>
        <hr className="separator" />
        {/* FIXME: replace dummy array with client history data*/}
        {[3, 3, 3].map((history, index) => (
          <div key={`${index}-similar-brief`} className="similar-brief">
            <div className="flex flex-col gap-5">
              <h3>Imbue Project</h3>
              <div className="flex items-center">
                {[4, 4, 4, 4].map((star, index) => (
                  <StarIcon
                    key={`${index}-star-icon`}
                    className={`${index <= 4 && "primary-icon"}`}
                  />
                ))}
                <span className="ml-3">
                  Thanks for choosing me. All the best for your future works...
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <p>January 24 , 2033</p>
              <p>Budget $5000</p>
            </div>
          </div>
        ))}
      </div>
      {showClientHistory && (
        <span className="primary-text font-bold absolute bottom-2 right-4 cursor-pointer">
          View more (1)
        </span>
      )}
    </div>
  );

  const SimilarProjects = (
    <div className="transparent-conatainer relative max-width-750px:!px-3">
      <div className="flex justify-between w-full">
        <h3>Similar projects on Imbue</h3>
        <div
          className={`transition transform ease-in-out duration-600 ${
            showSimilarBrief && "rotate-180"
          } cursor-pointer`}
        >
          <ArrowIcon
            onClick={() => setShowSimilarBrief(!showSimilarBrief)}
            className="scale-150"
          />
        </div>
      </div>

      <div className={`${!showSimilarBrief && "hidden"} my-6`}>
        <hr className="separator" />
        {/* TODO: Need an object for the list of similar projects */}
        {/* FIXME: missing {key} */}
        {/* FIXME: replace dummy array with similar projects data*/}
        {[3, 3, 3].map((history, index) => (
          <div key={`${index}-sim-brief`} className="similar-brief">
            <div className="similar-brief-details">
              <h3 className="max-width-750px:!text-base">NFT Mining</h3>
              <span className="max-width-750px:!text-base max-width-750px:overflow-hidden max-width-750px:text-ellipsis max-width-750px:ml-3 max-width-750px:line-clamp-2">
                Hi guys, I have an NFT I would like to design. The NFT has to
                have a picture of......
              </span>
            </div>
            <button className="primary-btn in-dark w-button max-width-750px:!px-[9px] max-width-750px:mr-0">
              View Brief
            </button>
          </div>
        ))}
      </div>
      {showSimilarBrief && (
        <span className="primary-text font-bold absolute bottom-2 right-4 cursor-pointer">
          View more (1)
        </span>
      )}
    </div>
  );

  return (
    <div className="brief-details-container hq-layout px-[15px] lg:px-[40px]">
      <div className="brief-info max-width-750px:!flex-col">
        {/* TODO: Implement */}
        <BioPanel
          brief={brief}
          isOwnerOfBrief={isOwnerOfBrief}
          projectCategories={projectCategories}
        />
        <BioInsights
          redirectToApply={redirectToApply}
          brief={brief}
          saveBrief={saveBrief}
          isOwnerOfBrief={isOwnerOfBrief}
          handleMessageBoxClick={handleMessageBoxClick}
          showMessageBox={showMessageBox}
          setShowMessageBox={setShowMessageBox}
          targetUser={targetUser}
          browsingUser={browsingUser}
          canSubmitProposal={freelancer?.verified ?? false}
        />
      </div>
      {ClientHistory}
      {SimilarProjects}
      <ErrorScreen {...{ error, setError }}>
        <div className="flex flex-col gap-4 w-1/2">
          <button
            onClick={() => router.push("/briefs")}
            className="primary-btn in-dark w-button w-full !m-0"
          >
            Seach Brief
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className="underline text-xs lg:text-base font-bold"
          >
            Go to Dashboard
          </button>
        </div>
      </ErrorScreen>

      <SuccessScreen title={successTitle} open={success} setOpen={setSuccess}>
        <div className="flex flex-col gap-4 w-1/2">
          <button
            onClick={() => {
              setSuccess(false);
            }}
            className="primary-btn in-dark w-button w-full !m-0"
          >
            Done
          </button>
        </div>
      </SuccessScreen>
    </div>
  );
};

export { getServerSideProps };

export default BriefDetails;
