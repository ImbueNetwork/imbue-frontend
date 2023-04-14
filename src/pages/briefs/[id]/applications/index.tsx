import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import ReactCountryFlag from "react-country-flag";
import { FaPaperclip, FaRegThumbsDown, FaRegThumbsUp } from "react-icons/fa";
import { Project, User } from "../../../api/models";
import { getBrief, getBriefApplications } from "../../../../redux/services/briefService";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { border, StyledEngineProvider } from "@mui/system";
import ProfilePhoto from '../../../../assets/images/profile-image.png'
import Image from "next/image";
import { fetchUser, getCurrentUser, redirect } from "@/utils";
import { useRouter } from "next/router";
import ChatPopup from "@/components/ChatPopup";
import { BriefInsights } from "@/components/Briefs/BriefInsights";
import { Brief } from "@/model";
import styles from '../../../../styles/brief-applications.module.css'

interface BriefApplicationsProps {
    brief: Brief;
    browsingUser: User;
}

interface ApplicationContainerProps {
    application: any;
    redirectToApplication: Function;
    handleMessageBoxClick: Function
}



export const ApplicationContainer = ({ application, redirectToApplication, handleMessageBoxClick }: ApplicationContainerProps) => {
    return (
        <div className={styles.applicantWrapper} >
            <Image
                src={ProfilePhoto}
                className={styles.freelancerProfilePic}
                alt=""
            />
            <div className={styles.applicationWrapper}>
                <div className={styles.freelancerInfo}>
                    <div className={styles.userId}>
                        @{application?.freelancer?.username}
                    </div>
                    {/* <div className="country">
                        <div className="country-flag">
                            <ReactCountryFlag countryCode="us" />
                        </div>
                        <div className="country-name text-grey">
                            United States
                        </div>
                    </div> */}

                    <div className={styles.ctasContainer}>
                        {/* TODO: Like/unlike feature. On hold */}
                        {/* <div className="cta-votes">
                                            <div className="cta-vote">
                                                <FaRegThumbsUp />
                                                Yes
                                            </div>
                                            <div className="cta-vote">
                                                <FaRegThumbsDown />
                                                No
                                            </div>
                                        </div> */}
                        <button className="primary-btn in-dark w-button" onClick={() => redirectToApplication(application?.id)}>
                            View proposal
                        </button>
                        <button onClick={() => handleMessageBoxClick(application?.user_id)} className="secondary-btn in-dark w-button">
                            Message
                        </button>
                    </div>
                </div>
                <div className={styles.selectFreelancer}>
                    <div className={styles.freelancerTitle}>
                        {application.freelancer.title}
                    </div>
                </div>
                <div className="text-base font-bold">
                    {application.name}
                </div>
                <div className={styles.coverLetter}>
                    <div>
                        <span className="font-bold">Cover Letter - </span>
                        {/* TODO: Implement cover letters */}
                        {/* {application.freelancer.bio
                                            .split("\n")
                                            .map((line, index) => (
                                                <span key={index}>{line}</span>
                                            ))} */}
                        <span className="font-bold">Hello, I would like to help you! I have 4+ years Experience with web 3, so i’ll make things work properly. Feel free to communicate!</span>
                    </div>
                </div>
                <div className="flex flex-row justify-between mt-6">
                    <div className="attachment">
                        <span className="font-bold">Attachment(s)</span>
                        <div className="flex p-3 gap-2">
                            {/* TODO: Implement */}
                            <FaPaperclip />
                            <div className="text-grey text-small">
                                https://www.behance.net/abbioty
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex gap-2 flex-col items-center">
                            <span className="font-bold text-primary">
                                Milestones ({application?.milestones?.length})
                            </span>
                            <div className="text-small text-grey">
                                ${Number(application.required_funds).toLocaleString()}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

const BriefApplications = () => {
    const [briefApplications, setBriefApplications] = useState<any[]>();
    const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [sortValue, setSortValue] = useState<string>('match');
    const [brief, setBrief] = useState<Brief>()
    const [browsingUser, setBrowsingUser] = useState<User>()
    
    const router = useRouter()
    const { id: briefID } = router.query;

    const handleMessageBoxClick = async (user_id: any) => {
        if (browsingUser) {
            console.log(user_id);
            const tg = (await fetchUser(user_id));
            console.log(tg);
            setTargetUser(tg)
            setShowMessageBox(true);
        } else {
            // router.push("login")
            // redirect("login", `/dapp/briefs/${brief?.id}/`)
        }
    }

    useEffect(() => {
        async function setup(id: string | string[]) {
            setBrowsingUser(await getCurrentUser());
            const briefData = await getBrief(id);
            setBrief(briefData)

            if (briefData?.id) {
                setBriefApplications(await getBriefApplications(briefData?.id))
            }
        }
        briefID && setup(briefID);
    }, [briefID]);

    const redirectToApplication = (applicationId: any) => {
        router.push(`/briefs/${brief?.id}/applications/${applicationId}/`)
    };

    if (!brief) return <h2>No brief found</h2>

    return (
        <div className="page-wrapper applicationList">
            {browsingUser && showMessageBox && <ChatPopup {...{ showMessageBox, setShowMessageBox, targetUser, browsingUser }} />}
            <p className={styles.sectionTitle + " mb-4"}>Review proposals</p>
            
            <BriefInsights brief={brief} />

            <div className="w-full ml-auto flex items-center justify-between mt-6">
                    <h3 className={styles.sectionTitle }>All applicants</h3>
                    <StyledEngineProvider injectFirst>
                        <FormControl>
                            <InputLabel id="demo-simple-select-helper-label">Sort</InputLabel>
                            <Select
                                labelId="demo-simple-select-helper-label"
                                id="demo-simple-select-helper"
                                value={sortValue}
                                label="Sort"
                                onChange={(e) => setSortValue(e.target.value)}>
                                <MenuItem value="match">Best Match</MenuItem>
                                <MenuItem value='ratings'>Ratings</MenuItem>
                                <MenuItem value='budget'>Budget</MenuItem>
                            </Select>
                        </FormControl>
                    </StyledEngineProvider>
                </div>

            <div className={styles.section}>
                {
                    briefApplications?.length
                        ? <div className="applicants-list">
                            {briefApplications?.map((application, index) => (
                                <ApplicationContainer key={index} {...{ application, redirectToApplication, handleMessageBoxClick }} />
                            ))}
                        </div>
                        : <h3>No Application for this brief</h3>
                }

                {/* TODO Display empty if no applications */}
            </div>
        </div>
    );
};

export default BriefApplications;

// document.addEventListener("DOMContentLoaded", async (event) => {
//     let paths = window.location.pathname.split("/");
//     let briefId = paths.length >= 2 && parseInt(paths[paths.length - 2]);

//     if (briefId) {
//         const brief: any = await getBrief(briefId);
//         const browsingUser = await getCurrentUser();
//         const isBriefOwner = brief?.user_id == browsingUser.id;

//         if(!brief) return
//         if (isBriefOwner) {
//             ReactDOMClient.createRoot(
//                 document.getElementById("brief-applications")!
//             ).render(<BriefApplications brief={brief} browsingUser={browsingUser} />);
//         } else {
//             redirect(`briefs/${briefId}/`)
//         }

//     }
// });
