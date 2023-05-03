/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { FiEdit, FiPlusCircle } from 'react-icons/fi';
import { timeData } from '@/config/briefs-data';
import * as config from '@/config';
import { Brief, Currency, Freelancer, Project, OffchainProjectState, User, ProjectOnChain } from '@/model';
import { changeBriefApplicationStatus as updateBriefApplicationStatus, getBrief } from '@/redux/services/briefService';
import { BriefInsights } from '@/components/Briefs/BriefInsights';
import { fetchProject, fetchUser, getCurrentUser, redirect } from '@/utils';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import { HirePopup } from '@/components/HirePopup';
import ChatPopup from '@/components/ChatPopup';
import ChainService from '@/redux/services/chainService';
import { getWeb3Accounts, initImbueAPIInfo } from '@/utils/polkadot';
import { blake2AsHex } from '@polkadot/util-crypto';
import { Backdrop, Badge, Button, CircularProgress, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Login from '@/components/Login';
import { WalletAccount } from '@talismn/connect-wallets';
import AccountChoice from '@/components/AccountChoice';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface MilestoneItem {
	name: string;
	amount: number | undefined;
}

export type ApplicationPreviewProps = {
	brief: Brief;
	user: User;
	application: Project;
	freelancer: Freelancer;
};

const applicationStatusId = ['Draft', 'Pending Review', 'Changes Requested', 'Rejected', 'Accepted'];

const ApplicationPreview = (): JSX.Element => {
	const [brief, setBrief] = useState<Brief | any>();
	const [user, setUser] = useState<User | any>();
	const [application, setApplication] = useState<Project | any>();
	const [freelancer, setFreelancer] = useState<Freelancer | any>();

	const router = useRouter();
	const { id, applicationId }: any = router.query;
	const briefId = id;

	const [loginModal, setLoginModal] = useState<boolean>(false);
	const [currencyId, setCurrencyId] = useState(application?.currency_id);
	const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
	const [openPopup, setOpenPopup] = useState<boolean>(false);
	const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
	const [targetUser, setTargetUser] = useState<User | null>(null);
	const [briefOwner, setBriefOwner] = useState<any>();
	const applicationStatus = OffchainProjectState[application?.status_id];
	const isApplicationOwner = user?.id == application?.user_id;
	const isBriefOwner = user?.id == brief?.user_id;
	const [freelancerAccount, setFreelancerAccount] = useState<WalletAccount>();
	const [loading, setLoading] = useState<boolean>(false);

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleOptionsClose = () => {
		setAnchorEl(null);
	};

	const mobileView = useMediaQuery('(max-width:480px)');

	useEffect(() => {
		const getSetUpData = async () => {
			const applicationResponse = await fetchProject(applicationId);
			const freelancerUser = await fetchUser(Number(applicationResponse?.user_id));
			const freelancerResponse = await getFreelancerProfile(freelancerUser?.username);

			const brief: Brief | undefined = await getBrief(briefId);
			const userResponse = await getCurrentUser();

			setFreelancer(freelancerResponse);
			setBrief(brief);
			setApplication(applicationResponse);
			setUser(userResponse);
		};

		if (briefId && applicationId) {
			getSetUpData();
		}
	}, [briefId, applicationId]);

	useEffect(() => {
		async function setup() {
			if (brief) {
				const briefOwner: User = await fetchUser(brief?.user_id);
				setBriefOwner(briefOwner);
			}
		}
		setup();
	}, [brief, freelancer]);

	const viewFullBrief = () => {
		router.push(`/briefs/${brief?.id}/`);
	};

	const updateProject = async (chainProjectId?: number) => {
		setLoading(true);
		await fetch(`${config.apiBase}/project/${application.id}`, {
			headers: config.postAPIHeaders,
			method: 'put',
			body: JSON.stringify({
				user_id: user.id,
				name: `${brief.headline}`,
				total_cost_without_fee: totalCostWithoutFee,
				imbue_fee: imbueFee,
				currency_id: currencyId,
				milestones: milestones
					.filter((m) => m.amount !== undefined)
					.map((m) => {
						return {
							name: m.name,
							amount: m.amount,
							percentage_to_unlock: (((m.amount ?? 0) / totalCostWithoutFee) * 100).toFixed(0),
						};
					}),
				required_funds: totalCost,
				chain_project_id: chainProjectId,
			}),
		});
		setLoading(false);
		setIsEditingBio(false);
	};

	const startWork = async (account: WalletAccount) => {
		setLoading(true);
		const imbueApi = await initImbueAPIInfo();
		const chainService = new ChainService(imbueApi, user);
		delete application.modified;
		const briefHash = blake2AsHex(JSON.stringify(application));
		const result = await chainService?.commenceWork(account, briefHash);
		while (true) {
			if (result.status || result.txError) {
				if (result.status) {
					console.log('***** success');
					const projectId = parseInt(result.eventData[2]);
					while (true) {
						const projectIsOnChain = await chainService.getProjectOnChain(projectId);
						if (projectIsOnChain) {
							await updateProject(projectId);
							router.push(`/projects/${applicationId}`);
						}
						await new Promise((f) => setTimeout(f, 1000));
					}
				} else if (result.txError) {
					console.log('***** failed');
					console.log(result.errorMessage);
				}
				break;
			}
			await new Promise((f) => setTimeout(f, 1000));
		}
		setLoading(false);
	};

	const filteredApplication = application?.milestones
		?.filter?.((m: any) => m?.amount !== undefined)
		?.map?.((m: any) => {
			return { name: m?.name, amount: Number(m?.amount) };
		});

	const imbueFeePercentage = 5;
	const applicationMilestones = application ? filteredApplication : [];

	const [milestones, setMilestones] = useState<MilestoneItem[]>(applicationMilestones);

	useEffect(() => {
		setMilestones(applicationMilestones);
	}, [application]);

	const currencies = Object.keys(Currency).filter((key: any) => !isNaN(Number(Currency[key])));

	const durationOptions = timeData.sort((a, b) => (a.value > b.value ? 1 : a.value < b.value ? -1 : 0));

	const totalCostWithoutFee = milestones?.reduce?.((acc, { amount }) => acc + (amount ?? 0), 0);

	const imbueFee = (totalCostWithoutFee * imbueFeePercentage) / 100;
	const totalCost = imbueFee + totalCostWithoutFee;
	const onAddMilestone = () => {
		setMilestones([...milestones, { name: '', amount: undefined }]);
	};

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrencyId(Number(event.target.value));
	};

	const handleMessageBoxClick = async (user_id: number, freelancer: any) => {
		if (user_id) {
			setShowMessageBox(true);
			setTargetUser(await fetchUser(user_id));
		} else {
			setLoginModal(true);
		}
	};

	const updateApplicationState = async (application: any, projectStatus: OffchainProjectState) => {
		await updateBriefApplicationStatus(application?.brief_id, application?.id, projectStatus);
		window.location.reload();
	};

	const totalPercent = milestones.reduce((sum, { amount }) => {
		const percent = Number(((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0));
		return sum + percent;
	}, 0);

	const allAmountAndNamesHaveValue = () => {
		for (let i = 0; i < milestones.length; i++) {
			const { amount, name } = milestones[i];

			if (amount === undefined || amount === null || amount === 0 || name === undefined || name === null || name.length === 0) {
				return false;
			}
		}

		return true;
	};

	const milestoneAmountsAndNamesHaveValue = allAmountAndNamesHaveValue();

	return (
		<>
			<div className="application-container hq-layout px-4 mt-3 lg:mt-0 lg:px-0 ">
				{user && showMessageBox && (
					<ChatPopup
						{...{
							showMessageBox,
							setShowMessageBox,
							browsingUser: user,
							targetUser,
						}}
					/>
				)}

				{isBriefOwner && (
					<>
						<div className="flex items-center w-full justify-between lg:px-10">
							<div className="flex gap-5 items-center">
								<Image className="w-16 h-16 rounded-full object-cover cursor-pointer"
									src={require('@/assets/images/profile-image.png')}
									priority
									alt="profileImage" />
								<Badge badgeContent={"Hired"} color="primary" invisible={!(application?.status_id === OffchainProjectState.Accepted)}>
									<p className="text-2xl font-bold">{freelancer?.display_name}</p>
								</Badge>
							</div>
							{
								<p className="text-base text-primary max-w-[50%] break-words">@
									{(mobileView && freelancer?.username?.length > 16)
										? `${freelancer?.username.substr(0, 16)}...`
										: freelancer?.username
									}
								</p>
							}


							<div className='relative'>
								<IconButton
									aria-label="more"
									id="long-button"
									aria-controls={open ? 'long-menu' : undefined}
									aria-expanded={open ? 'true' : undefined}
									aria-haspopup="true"
									onClick={handleOptionsClick}
								>
									<MoreVertIcon htmlColor='white' />
								</IconButton>
								<Menu
									id="basic-menu"
									anchorEl={anchorEl}
									open={open}
									onClose={handleOptionsClose}
									MenuListProps={{
										'aria-labelledby': 'basic-button',
									}}
								>
									<MenuItem onClick={() => {
										handleOptionsClose()
										router.push(`/freelancers/${freelancer?.username}/`)
									}}>
										Freelancer Profile
									</MenuItem>
									<MenuItem onClick={() => {
										handleOptionsClose()
										handleMessageBoxClick(application?.user_id, freelancer?.username)
									}}>Message</MenuItem>
									{application?.status_id == OffchainProjectState.PendingReview && (
										<>
											<MenuItem onClick={() => {
												handleOptionsClose()
												setOpenPopup(true)
											}}>
												Hire
											</MenuItem>
											<MenuItem
												onClick={() => {
													handleOptionsClose()
													updateApplicationState(application, OffchainProjectState.ChangesRequested);
												}}>
												Request Changes
											</MenuItem>
											<MenuItem
												onClick={() => {
													handleOptionsClose()
													updateApplicationState(application, OffchainProjectState.Rejected);
												}}>
												Reject
											</MenuItem>

										</>
									)}
								</Menu>
							</div>
						</div>
					</>
				)}

				{isApplicationOwner && (
					<div className="flex items-center w-full lg:justify-between lg:px-10 flex-wrap">
						<div className="flex gap-5 items-center">
							<Image className="w-16 h-16 rounded-full object-cover cursor-pointer"
								src={require('@/assets/images/profile-image.png')}
								priority
								alt="profileImage" />
							<p className="text-2xl font-bold">{briefOwner?.display_name}</p>
						</div>
						{
							<p className="text-base text-primary break-words text-center ml-3">@
								{(mobileView && briefOwner?.username?.length > 16)
									? `${briefOwner?.username.substr(0, 16)}...`
									: briefOwner?.username
								}
							</p>
						}

						<div className='ml-auto lg:ml-0'>
							<button className="primary-btn in-dark w-button !text-xs lg:!text-base" onClick={() => brief && handleMessageBoxClick(brief?.user_id, freelancer?.username)}>
								Message
							</button>
							{application?.status_id === 4 ? (
								<button className="Accepted-btn text-black in-dark text-xs lg:text-base rounded-full py-[7px] px-3 ml-3 lg:ml-0 lg:px-6 md:py-[14px]" onClick={() => brief?.project_id && setOpenPopup(true)} >
									Start Work
								</button>
							) : (
								<button className={`${applicationStatusId[application?.status_id]}-btn in-dark text-xs lg:text-base rounded-full py-3 px-3 lg:px-6 lg:py-[14px]`}>{applicationStatusId[application?.status_id]}</button>
							)}
						</div>


						<AccountChoice accountSelected={(account) => startWork(account)} visible={openPopup} setVisible={setOpenPopup} initiatorAddress={application?.initiator} filterByInitiator />
					</div>
				)}

				<HirePopup
					{...{
						openPopup,
						setOpenPopup,
						brief,
						freelancer,
						application,
						milestones,
						totalCostWithoutFee,
						imbueFee,
						totalCost,
						setLoading,
					}}
				/>

				<Backdrop
					sx={{ color: '#fff', zIndex: 5 }}
					open={loading}
				// onClick={handleClose}
				>
					<CircularProgress color="inherit" />
				</Backdrop>

				{
					<div>
						<h3 className="ml-[2rem] mb-[0.5rem] text-xl leading-[1.5] font-bold m-0 p-0  flex">Job description</h3>
						{brief && <BriefInsights brief={brief} />}
					</div>
				}
				<div>
					<div className="w-full flex flex-col gap-[20px] bg-theme-grey-dark border border-light-white rounded-[20px] py-4 lg:py-[20px] ">
						<div className="flex flex-row justify-between mx-5 lg:mx-14 -mb-3">
							<h3 className="flex text-lg lg:text-xl leading-[1.5] font-bold m-0 p-0">
								Milestones
								{!isEditingBio && isApplicationOwner && (
									<div className="ml-[10px] relative top-[-2px]" onClick={() => setIsEditingBio(true)}>
										<FiEdit />
									</div>
								)}
							</h3>
							<h3 className="flex text-lg lg:text-xl leading-[1.5] font-bold m-0 p-0">Client&apos;s budget: ${Number(brief?.budget).toLocaleString()}</h3>
						</div>
						<hr className="separator" />
						{isEditingBio && <p className="mx-5 lg:mx-14 lg:text-xl font-bold">How many milestone do you want to include?</p>}
						<div className="milestone-list lg:mb-5">
							{milestones?.map?.(({ name, amount }, index) => {
								const percent = Number(((100 * (amount ?? 0)) / totalCostWithoutFee)?.toFixed?.(0));
								return (
									<div className="flex flex-row items-start w-full border-b border-b-light-white last:border-b-0 px-5 pb-9 lg:px-14" key={index}>
										<div className="mr-4 lg:mr-9 text-lg">{index + 1}.</div>
										<div className="flex flex-row justify-between w-full">
											<div className="w-3/5 lg:w-1/2">
												<h3 className="mb-2 text-lg lg:mb-5 lg:text-xl font-bold m-0 p-0">Description</h3>
												{isEditingBio ? (
													<textarea
														className="input-description"
														value={name}
														disabled={!isEditingBio}
														onChange={(e) =>
															setMilestones([
																...milestones?.slice(0, index),
																{
																	...milestones[index],
																	name: e.target.value,
																},
																...milestones?.slice(index + 1),
															])
														}
													/>
												) : (
													<p className="text-base text-[#ebeae2] m-0">{milestones[index]?.name}</p>
												)}
											</div>
											<div className="flex flex-col w-1/3 lg:w-1/5 items-end">
												<h3 className="mb-2 text-lg lg:mb-5 lg:text-xl font-bold m-0 p-0">Amount</h3>
												{isEditingBio ? (
													<input
														type="number"
														className="input-budget"
														disabled={!isEditingBio}
														value={amount || ''}
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
												) : (
													<p className="text-base text-[#ebeae2] m-0">{milestones[index]?.amount}</p>
												)}

												{totalCostWithoutFee !== 0 && isEditingBio && (
													<div className="flex flex-col items-end mt-[auto] gap-[8px] w-full">
														<div className="progress-value text-base">{percent}%</div>
														<div className="progress-bar">
															<div
																className="progress"
																style={{
																	width: `${percent}%`,
																}}></div>
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
						{isEditingBio && (
							<h4 className="clickable-text btn-add-milestone mx-5 lg:mx-14 lg:text-2xl" onClick={onAddMilestone}>
								<FiPlusCircle color="var(--theme-primary)" />
								Add milestone
							</h4>
						)}
					</div>
				</div>

				<div className="w-full bg-theme-grey-dark border border-light-white rounded-[20px] py-[20px]">
					<p className="mx-5 lg:mx-14 mb-4 text-xl font-bold">Costs</p>
					<hr className="separator" />

					<div className="flex flex-row items-center mb-[20px] mx-5 lg:mx-14 mt-7">
						<div className="flex flex-col flex-grow">
							<h3 className="text-lg lg:text-xl font-bold m-0 p-0">Total price of the project</h3>
							<div className="text-sm lg:text-base text-inactive">This includes all milestones, and is the amount client will see</div>
						</div>
						<div className="budget-value">${Number(totalCostWithoutFee?.toFixed?.(2)).toLocaleString()}</div>
					</div>

					<div className="flex flex-row items-center mb-[20px] mx-5 lg:mx-14">
						<div className="flex flex-col flex-grow">
							<h3 className="text-lg lg:text-xl font-bold m-0 p-0">Imbue Service Fee 5%</h3>
						</div>
						<div className="budget-value">${Number(imbueFee?.toFixed?.(2))?.toLocaleString?.()}</div>
					</div>

					<div className="flex flex-row items-center mb-[20px] mx-5 lg:mx-14">
						<div className="flex flex-col flex-grow">
							<h3 className="text-lg lg:text-xl font-bold m-0 p-0">Total</h3>
						</div>
						<div className="budget-value">${Number(totalCost.toFixed(2))?.toLocaleString?.()}</div>
					</div>
				</div>

				<div>
					<h3 className="lg:ml-[2rem] mb-[0.5rem] text-xl font-bold m-0 p-0 flex">Payment terms</h3>
					<div className="bg-theme-grey-dark border lg:flex-row border-light-white px-5 py-5 rounded-[20px] payment-details lg:px-14">
						<div className="duration-selector">
							<h3 className="text-xl font-bold m-0 p-0">How long will this project take?</h3>
							<select
								className="bg-[#1a1a19] border border-light-white rounded-[5px] text-base px-[20px] py-[10px] mt-4 round"
								name="duration"
								placeholder="Select a duration"
								required
								disabled={!isEditingBio}>
								{durationOptions.map(({ label, value }, index) => (
									<option value={value} key={index} className="duration-option">
										{label}
									</option>
								))}
							</select>
						</div>
						<div className="payment-options mt-5 lg:mt-0">
							<h3 className="text-xl font-bold m-0 p-0 lg:self-end">Currency</h3>
							<div className="network-amount">
								<select
									name="currencyId"
									onChange={handleChange}
									className="bg-[#1a1a19] round border border-light-white rounded-[5px] text-base px-[20px] py-[10px] mt-4"
									placeholder="Select a currency"
									disabled={!isEditingBio}
									defaultValue={Number(application?.currency_id)}
									required>
									{currencies.map((currency, index) => (
										<option value={index} key={index} className="duration-option">
											{currency}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</div>

				<div className="buttons-container">
					<button className="primary-btn in-dark w-button" onClick={() => viewFullBrief()}>
						Back To Brief
					</button>
					{isEditingBio && (
						<button className="primary-btn in-dark w-button" disabled={totalPercent !== 100 || !milestoneAmountsAndNamesHaveValue} onClick={() => updateProject()}>
							Update
						</button>
					)}

					{/* TODO: Add Drafts Functionality */}
					{/* <button className="secondary-btn">Save draft</button> */}
				</div>
			</div>
			<Login
				visible={loginModal}
				setVisible={(val) => {
					setLoginModal(val);
				}}
				redirectUrl={`/freelancers/${freelancer?.username}/`}
			/>
		</>
	);
};

export default ApplicationPreview;
