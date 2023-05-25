import React, { useEffect, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import { getWeb3Accounts, initImbueAPIInfo } from "../utils/polkadot";
import { Currency, OffchainProjectState, User } from "@/model";
import { blake2AsHex } from "@polkadot/util-crypto";
import ChainService from "@/redux/services/chainService";
import { getCurrentUser } from "@/utils";
import { changeBriefApplicationStatus } from "@/redux/services/briefService";
import Image from "next/image";
import styles from "../styles/modules/hire-modal.module.css";
import { useRouter } from "next/router";
import { WalletAccount } from "@talismn/connect-wallets";
import AccountChoice from "./AccountChoice";
import { useMediaQuery } from "@mui/material";
import ErrorScreen from "./ErrorScreen";
import SuccessScreen from "./SuccessScreen";

export const HirePopup = ({
  openPopup: openHirePopup,
  setOpenPopup: setOpenHirePopup,
  brief,
  freelancer,
  application,
  milestones,
  totalCostWithoutFee,
  imbueFee,
  totalCost,
  setLoading,
}: any) => {
  const [popupStage, setstage] = useState<number>(0);
  const mobileView = useMediaQuery('(max-width:480px)');

  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<any>()
  const router = useRouter()

  const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: mobileView ? "98vw" : "65vw",
    bgcolor: "#2c2c2c",
    color: "#fff",
    pt: mobileView ? "10px" : "28px",
    pb: mobileView ? "10px" : "28px",
    boxShadow: 24,
    borderRadius: "20px",
    zIndex: 1,
  };

  const selectedAccount = async (account: WalletAccount) => {
    setLoading(true);
    const imbueApi = await initImbueAPIInfo();
    const user: User | any = await getCurrentUser();
    const chainService = new ChainService(imbueApi, user);

    const briefOwners: string[] = [user?.web3_address];
    const freelancerAddress: string = freelancer.web3_address;
    const budget: bigint = BigInt(totalCost * 1e12);
    const initialContribution: bigint = BigInt(totalCost * 1e12);
    application.status_id = OffchainProjectState.Accepted;
    delete application.modified;
    const briefHash = blake2AsHex(JSON.stringify(application));
    const currencyId = application.currency_id;

    const milestones = application.milestones.map((m: any, idx: number) => ({
      percentageToUnlock: parseInt(m.percentage_to_unlock),
    }));
    const result = await chainService?.hireFreelancer(
      account,
      briefOwners,
      freelancerAddress,
      budget,
      initialContribution,
      briefHash,
      currencyId,
      milestones
    );
    while (true) {
      if (result.status || result.txError) {
        if (result.status) {
          console.log("***** success");
          setSuccess(true)
          const briefId = brief.id;
          await changeBriefApplicationStatus(
            briefId!,
            application.id,
            OffchainProjectState.Accepted
          );
          console.log(result.eventData);
        } else if (result.txError) {
          console.log("***** failed");
          console.log(result.errorMessage);

          // TODO, SHOW ERROR POPUP
          setError({ message: result.errorMessage })
        }
        break;
      }
      await new Promise((f) => setTimeout(f, 1000));
    }
    setLoading(false);
    setstage(0);
    setOpenHirePopup(false);
  };

  const FirstContent = () => {
    return (
      <div className="relative modal-container">
        <div className="flex w-full justify-start items-center px-5 gap-5 pt-8 md:px-10 lg:gap-11 lg:px-16 lg:pb-2">
          <Image
            className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
            src={require("@/assets/images/profile-image.png")}
            alt="profileImage"
          />
          <span className="text-xl font-bold">{freelancer?.display_name}</span>
        </div>
        <h3 className="absolute top-0 text-center w-full text-lg lg:text-xl font-bold primary-text">
          Hire This Freelancer
        </h3>
        <hr className="separator" />

        <div className="milestone-list px-5 lg:px-16 mb-5 max-h-96 overflow-y-scroll">
          {milestones?.map?.(({ name, amount }: any, index: any) => {
            return (
              <div className={styles.milestoneRow} key={index}>
                <h3 className="mr-3 lg:mr-9 text-lg">{index + 1}.</h3>
                <div className="flex justify-between w-full">
                  <div>
                    <h3 className="text-lg mb-1">Description</h3>
                    <p className="text-base">{milestones[index]?.name}</p>
                  </div>
                  <div className="budget-wrapper text-end">
                    <h3 className="text-lg mb-1">Amount</h3>
                    <p>{milestones[index]?.amount}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <hr className="separator" />

        <div className="">
          <div className={`${styles.budgetInfo} mx-5 lg:mx-16 lg:mt-7`}>
            <div className={styles.budgetDescription}>
              <h3 className="mb-2 text-lg">Total price of the project</h3>
              <div className="text-inactive">
                This includes all milestonees, and is the amount client will see
              </div>
            </div>
            <div className="budget-value">
              ${Number?.(totalCostWithoutFee?.toFixed?.(2))?.toLocaleString()}
            </div>
          </div>
          <div className={`${styles.budgetInfo} mx-5 lg:mx-16`}>
            <div className={styles.budgetDescription}>
              <h3 className="text-lg">Imbue Service Fee 5%</h3>
            </div>
            <div className="budget-value">
              ${Number?.(imbueFee?.toFixed?.(2))?.toLocaleString?.()}
            </div>
          </div>
          <div className={`${styles.budgetInfo} mx-5 lg:mx-16`}>
            <div className={styles.budgetDescription}>
              <h3 className="text-lg">Total</h3>
            </div>
            <div className="budget-value">
              ${Number?.(totalCost?.toFixed?.(2))?.toLocaleString?.()}
            </div>
          </div>
        </div>
        <hr className="separator" />

        <button
          onClick={() => setstage(1)}
          className="primary-btn in-dark w-button mx-5 lg:mx-16"
        >
          Approve
        </button>
      </div>
    );
  };

  const SecondContent = () => {
    return (
      <div className="flex flex-col justify-center items-center modal-container px-5 lg:px-0 lg:w-2/3 mx-auto my-auto">
        <h3 className="text-center w-full text-lg lg:text-xl font-bold my-4 primary-text">
          Deposit Fuds
        </h3>
        <p className="text-center w-full text-lg lg:text-xl font-bold my-4">
          Deposit the funds required for the project, these funds will be taken
          from your account once the freelancer starts the project.
        </p>
        <p className="text-center w-full text-lg lg:text-xl font-bold my-4">
          The funds are then paid to the freelancer iin stages only when you
          approve the completion of each milestone
        </p>
        <h3 className="mb-10">
          <span className="primary-text mr-1">
            {Number(totalCost.toFixed(2)).toLocaleString()}
          </span>
          ${Currency[application.currency_id]}
        </h3>
        <button
          onClick={() => {
            setstage(2);
          }}
          className="primary-btn in-dark w-button lg:w-1/3 lg:mx-16"
          style={{ textAlign: "center" }}
        >
          Deposit Funds
        </button>
      </div>
    );
  };

  if (popupStage === 2 && openHirePopup) return (
    <AccountChoice
      title="Choose Your Wallet"
      accountSelected={(account) => selectedAccount(account)}
      visible={true}
      setVisible={setOpenHirePopup}
    />
  )

  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openHirePopup}
        onClose={() => {
          setOpenHirePopup(false);
        }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        sx={{ zIndex: 4 }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openHirePopup}>
          <Box sx={modalStyle}>
            {!popupStage && openHirePopup && <FirstContent />}
            {popupStage === 1 && <SecondContent />}
          </Box>
        </Fade>
      </Modal>

      <ErrorScreen {...{ error, setError }}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => setError(null)}
            className='primary-btn in-dark w-button w-full !m-0'>
            Try Again
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'>
            Go to Dashboard
          </button>
        </div>
      </ErrorScreen>

      <SuccessScreen
        title={`You have successfully hired ${freelancer?.display_name} as a freelacer for your brief`}
        open={success}
        setOpen={setSuccess}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => router.push(`/briefs`)}
            className='primary-btn in-dark w-button w-full !m-0'>
            Go to Project
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'>
            Go to Dashboard
          </button>
        </div>
      </SuccessScreen>
    </>
  );
};
