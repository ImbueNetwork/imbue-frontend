/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { FiPlusCircle } from "react-icons/fi";
import MilestoneItem from "@/components/Briefs/MileStoneItem";
import { timeData } from "@/config/briefs-data";
import * as config from "@/config";
import { Brief, Currency, User } from "@/model";
import { getBrief, getUserBrief } from "@/redux/services/briefService";
import { BriefInsights } from "@/components/Briefs/BriefInsights";
import AccountChoice from "@/components/AccountChoice";
import { checkEnvironment, getCurrentUser, redirect } from "@/utils";
import { getFreelancerProfile } from "@/redux/services/freelancerService";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { selectAccount } from "@/redux/services/polkadotService";
import { useRouter } from "next/router";

interface MilestoneItem {
  name: string;
  amount: number | undefined;
}

export const SubmitProposal = (): JSX.Element => {
  const [currencyId, setCurrencyId] = useState(0);
  const [brief, setBrief] = useState<Brief | any>();
  const [user, setUser] = useState<User>();
  const userHasWeb3Addresss = !!user?.web3_address;
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);

  const router = useRouter();
  const briefId: any = router?.query?.id || 0;

  useEffect(() => {
    getUserAndFreelancer();
  }, [briefId]);

  useEffect(() => {
    getCurrentUserBrief();
  }, [user]);

  const getUserAndFreelancer = async () => {
    const userResponse = await getCurrentUser();
    setUser(userResponse);
    const freelancer = await getFreelancerProfile(userResponse?.username);
    if (!freelancer) {
      router.push(`/freelancer`);
    }
  };

  const getCurrentUserBrief = async () => {
    if (briefId && user) {
      const userApplication: any = await getUserBrief(user?.id, briefId);
      if (userApplication) {
        //TODO: redirect to brief application
        router.push(`/briefs/${briefId}/applications/${userApplication?.id}/`);
      }
      const briefResponse: Brief | undefined = await getBrief(briefId);
      setBrief(briefResponse);
    }
  };

  const currencies = Object.keys(Currency).filter(
    (key: any) => !isNaN(Number(Currency[key]))
  );
  const imbueFeePercentage = 5;

  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { name: "", amount: undefined },
  ]);

  const durationOptions = timeData.sort((a, b) =>
    a.value > b.value ? 1 : a.value < b.value ? -1 : 0
  );

  const totalCostWithoutFee = milestones.reduce(
    (acc, { amount }) => acc + (amount ?? 0),
    0
  );
  const imbueFee = (totalCostWithoutFee * imbueFeePercentage) / 100;
  const totalCost = imbueFee + totalCostWithoutFee;

  const onAddMilestone = () => {
    setMilestones([...milestones, { name: "", amount: undefined }]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyId(Number(event.target.value));
  };

  const handleSelectAccount = async (account: InjectedAccountWithMeta) => {
    await selectAccount(account);
    setShowPolkadotAccounts(false);
  };

  async function handleSubmit() {
    if (!userHasWeb3Addresss) {
      setShowPolkadotAccounts(true);
    } else {
      await insertProject();
    }
  }

  async function insertProject() {
    //TODO: validate all milestone sum up to 100%
    const resp = await fetch(
      checkEnvironment().concat(`${config.apiBase}/project`),
      {
        headers: config.postAPIHeaders,
        method: "post",
        body: JSON.stringify({
          user_id: user?.id,
          name: `Brief Application: ${brief?.headline}`,
          brief_id: brief?.id,
          total_cost_without_fee: totalCostWithoutFee,
          imbue_fee: imbueFee,
          currency_id: currencyId,
          milestones: milestones
            .filter((m) => m.amount !== undefined)
            .map((m) => {
              return {
                name: m.name,
                amount: m.amount,
                percentage_to_unlock: (
                  ((m.amount ?? 0) / totalCostWithoutFee) *
                  100
                ).toFixed(0),
              };
            }),
          required_funds: totalCost,
        }),
      }
    );

    console.log({ resp });

    if (resp.ok) {
      const applicationId = (await resp.json()).id;
      applicationId &&
        router.push(`/briefs/${brief?.id}/applications/${applicationId}/`);
    } else {
      console.log("Failed to submit the brief");
    }
  }

  const renderPolkadotJSModal = (
    <div>
      <AccountChoice
        accountSelected={(account: InjectedAccountWithMeta) =>
          handleSelectAccount(account)
        }
      />
    </div>
  );

  const totalPercent = milestones.reduce((sum, { amount }) => {
    const percent = Number(
      ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
    );
    return sum + percent;
  }, 0);

  return (
    <div className="flex flex-col gap-[2.5rem] text-base leading-[1.5]">
      <div>
        <h3 className="ml-[2rem] mb-[0.5rem] text-xl leading-[1.5] font-bold m-0 p-0  flex">
          Job description
        </h3>
        {brief && <BriefInsights brief={brief} />}
      </div>
      <div>
        <div className="milestones border border-solid border-[#fff] py-[20px] rounded-[20px] bg-[#2c2c2c]">
          <div className="milestone-header mx-14 -mb-3">
            <h3 className="ml-[2rem] mb-[0.5rem] text-xl leading-[1.5] font-bold m-0 p-0 flex">
              Milestones
            </h3>
            <h3 className="text-xl leading-[1.5] font-bold m-0 p-0">
              Client&apos;s budget: ${Number(brief?.budget)?.toLocaleString()}
            </h3>
          </div>
          <hr className="separator" />

          <p className="mx-14 text-xl font-bold">
            How many milestone do you want to include?
          </p>
          <div className="milestone-list mx-14">
            {milestones.map(({ name, amount }, index) => {
              const percent = Number(
                ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
              );
              return (
                <div className="milestone-row !p-0" key={index}>
                  <div className="milestone-no text-base">{index + 1}</div>
                  <div className="input-wrappers">
                    <div className="description-wrapper">
                      <h3 className="mb-[1.25rem] text-xl font-bold m-0 p-0">
                        Description
                      </h3>
                      <textarea
                        className="input-description bg-[#1a1a19] border border-solid border-white text-base leading-[20px] py-[10px] px-[20px]"
                        value={name}
                        onChange={(e) =>
                          setMilestones([
                            ...milestones.slice(0, index),
                            {
                              ...milestones[index],
                              name: e.target.value,
                            },
                            ...milestones.slice(index + 1),
                          ])
                        }
                      />
                    </div>
                    <div className="flex flex-col w-[fit-content] items-end">
                      <h3 className="mb-[1.25rem] text-xl font-bold m-0 p-0">
                        Amount
                      </h3>
                      <input
                        type="number"
                        className="input-budget bg-[#1a1a19] border border-solid border-white text-base leading-[20px] rounded-[5px] py-[10px] px-[20px]"
                        value={amount || ""}
                        onChange={(e) =>
                          setMilestones([
                            ...milestones.slice(0, index),
                            {
                              ...milestones[index],
                              amount: Number(e.target.value),
                            },
                            ...milestones.slice(index + 1),
                          ])
                        }
                      />
                      {totalCostWithoutFee !== 0 && (
                        <div className="flex flex-col items-end mt-[auto] gap-[8px] w-full">
                          <div className="progress-value text-base">
                            {percent}%
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress"
                              style={{
                                width: `${percent}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p
            className="clickable-text btn-add-milestone mx-14 !mb-0 text-xl font-bold"
            onClick={onAddMilestone}
          >
            <FiPlusCircle color="var(--theme-primary)" />
            Add milestone
          </p>
          <hr className="separator" />

          <div className="flex flex-row items-center mb-[20px] mx-14">
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-bold m-0 p-0">
                Total price of the project
              </h3>
              <div className="text-inactive">
                This includes all milestonees, and is the amount client will see
              </div>
            </div>
            <div className="budget-value">
              ${Number(totalCostWithoutFee.toFixed(2)).toLocaleString()}
            </div>
          </div>
          <hr className="separator" />

          <div className="flex flex-row items-center mb-[20px] mx-14">
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-bold m-0 p-0">
                Imbue Service Fee 5% - Learn more about Imbue’s fees
              </h3>
            </div>
            <div className="budget-value">
              ${Number(imbueFee.toFixed(2)).toLocaleString()}
            </div>
          </div>
          <hr className="separator" />

          <div className="flex flex-row items-center mb-[20px] mx-14">
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-bold m-0 p-0">Total</h3>
            </div>
            <div className="budget-value">
              ${Number(totalCost.toFixed(2)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="ml-[2rem] mb-[0.5rem] text-xl font-bold m-0 p-0 flex">
          Payment terms
        </h3>
        <div className="bg-[#2c2c2c] border border-solid border-[#fff] py-[20px] rounded-[20px] payment-details px-14">
          <div className="duration-selector">
            <h3 className="text-xl font-bold m-0 p-0">
              How long will this project take?
            </h3>
            <select
              name="duration"
              className="bg-[#1a1a19] round border border-solid border-[#fff] rounded-[5px] text-base px-[20px] py-[10px] mt-4"
              placeholder="Select a duration"
              required
            >
              {durationOptions.map(({ label, value }, index) => (
                <option value={value} key={index} className="duration-option">
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="payment-options">
            <h3 className="text-xl font-bold m-0 p-0">Currency</h3>

            <div className="network-amount">
              <select
                name="currencyId"
                onChange={handleChange}
                placeholder="Select a currency"
                className="bg-[#1a1a19] round border border-solid border-[#fff] rounded-[5px] text-base px-[20px] py-[10px] mt-4"
                required
              >
                {currencies.map((currency: any) => (
                  <option
                    value={Currency[currency]}
                    key={Currency[currency]}
                    className="duration-option"
                  >
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="buttons-container">
        <button
          disabled={totalPercent !== 100}
          className="primary-btn in-dark w-button"
          onClick={() => handleSubmit()}
        >
          Submit
        </button>
        {/* TODO: Add Drafts Functionality */}
        {/* <button className="secondary-btn">Save draft</button> */}
      </div>
      {showPolkadotAccounts && renderPolkadotJSModal}
    </div>
  );
};

export default SubmitProposal;
