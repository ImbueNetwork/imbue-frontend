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
import styles from '@/styles/modules/brief-applications.module.css'
import { ApplicationContainer } from "@/components/Briefs/ApplicationContainer";

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
        <div className="page-wrapper applicationList hq-layout">
            {browsingUser && showMessageBox && <ChatPopup {...{ showMessageBox, setShowMessageBox, targetUser, browsingUser }} />}
            <p className={styles.sectionTitle + " mb-4"}>Review proposals</p>
            
            <BriefInsights brief={brief} />

            <div className="w-full ml-auto flex items-center justify-between mt-6">
                    <h3 className={styles.sectionTitle }>All applicants</h3>
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
