import Image from 'next/image';
import React from 'react';
import profilePic from '../../assets/images/profile-image.png';
import { MdContentCopy } from 'react-icons/md';
import { GiSmartphone } from 'react-icons/gi';
import styles from '../../styles/modules/edit-profile.module.css';
import ProfilePictureIcon from '@mui/icons-material/AccountCircleOutlined';
import ProfileNameIcon from '@mui/icons-material/PersonPinOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import PasswordIcon from '@mui/icons-material/VpnKeyOutlined';
import WarningIcon from '@mui/icons-material/ReportOutlined';
import AboutICon from '@mui/icons-material/ListAltOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocationIcon from '@mui/icons-material/FmdGoodOutlined';
import WebsiteIcon from '@mui/icons-material/LanguageOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AccountsdIcon from '@mui/icons-material/SupervisorAccountOutlined';
import SkillsIcon from '@mui/icons-material/SignLanguageOutlined';
import EducationdIcon from '@mui/icons-material/SchoolOutlined';
import CertifieddIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import DevicesdIcon from '@mui/icons-material/DevicesOutlined';
import ActivitiesIcon from '@mui/icons-material/FileCopyOutlined';

const basicInfo = [
	{
		title: 'Profile Picture',
		icon: <ProfilePictureIcon />,
		verified: false,
		value: 'Please Upload a profile picture',
	},
	{
		title: 'Profile Name',
		icon: <ProfileNameIcon />,
		verified: true,
		value: 'Idris Company',
	},
	{
		title: 'Email Authentication',
		icon: <EmailIcon />,
		verified: false,
		value: 'For login, password reset, and change of security settings',
	},
	{
		title: 'Password',
		icon: <PasswordIcon />,
		verified: true,
		value: '',
	},
];

const aboutInfo = [
	{
		title: 'About',
		icon: <AboutICon />,
		verified: false,
		value: 'The Blockchain world has never been more exciting than right now. But in this .... ',
	},
	{
		title: 'Location',
		icon: <LocationIcon />,
		verified: true,
		value: 'Los Angeles, United State',
	},
	{
		title: 'Website',
		icon: <WebsiteIcon />,
		verified: false,
		value: 'https://www.behance.net/abbioty',
	},
	{
		title: 'Wallet Address',
		icon: <WalletIcon />,
		verified: true,
		value: '0x524c3d9e935649A448FA33666048C',
	},
	{
		title: 'Linked account',
		icon: <AccountsdIcon />,
		verified: true,
		value: '',
	},
	{
		title: 'Skills',
		icon: <SkillsIcon />,
		verified: true,
		value: '',
	},
];

const educationInfo = [
	{
		title: 'Education',
		icon: <EducationdIcon />,
		verified: 'not required',
		value: 'Bsc. Computer Science',
	},
	{
		title: 'Certification',
		icon: <CertifieddIcon />,
		verified: 'not required',
		value: 'Web3 Certification of participation',
	},
];

const activitiesInfo = [
	{
		title: 'Active Devices Management',
		icon: <DevicesdIcon />,
		verified: 'not required',
		value: 'You have 3 active devices logged in',
	},
	{
		title: 'Account Activities',
		icon: <ActivitiesIcon />,
		verified: 'not required',
		value: 'Account statement? view statement ',
	},
];

const EditProfile = () => {
	return (
		<div>
			<div className={styles.basicInfo}>
				<div className="flex items-center gap-9">
					<Image className={`w-16 lg:w-32`} src={profilePic} alt="Profile Pic" />
					<div className="flex flex-col gap-2 w-2/3">
						<p className="text-xl font-bold">Idris Mohammad</p>
						<div className="flex gap-2 items-center">
							<span className={styles.walletAddress}>0x524c3d9e935649A448FA33666048C</span>
							<div className="cursor-pointer">
								<MdContentCopy size={24} />
							</div>
						</div>
					</div>
				</div>

				<div className="mt-6 flex items-center">
					<span className="text-lg font-bold lg:w-fit whitespace-nowrap">Security Level :</span>
					<div className='flex flex-col w-full lg:flex-row lg:items-center ml-3'>
						<span className="text-lg text-primary">Medium</span>
						<div className="h-3 rounded-3xl bg-[#1C2608] w-1/2 lg:w-1/3 lg:ml-3">
							<div className={`w-[75%] bg-theme-secondary h-full rounded-3xl`}></div>
						</div>
					</div>
				</div>

				<div className="mt-6 flex flex-wrap items-center">
					<span className="text-light-grey">Last login device: 6:13 16-04-2023 |</span>
					<GiSmartphone size={24} />
					<span className="text-primary ml-1">iPhone 12pro</span>
				</div>

				<div className="mt-10 flex flex-col border-t border-light-white">
					{basicInfo.map((info, i) => (
						<EditItem key={i} icon={info.icon} title={info.title} data={info} />
					))}
				</div>
			</div>

			<div className={`${styles.infoSection} flex flex-col`}>
				{aboutInfo.map((info, i) => (
					<EditItem key={i} icon={info.icon} title={info.title} data={info} />
				))}
			</div>

			<div className={`${styles.infoSection} flex flex-col`}>
				{educationInfo.map((info, i) => (
					<EditItem key={i} icon={info.icon} title={info.title} data={info} />
				))}
			</div>

			<div className={`${styles.infoSection} flex flex-col`}>
				{activitiesInfo.map((info, i) => (
					<EditItem key={i} icon={info.icon} title={info.title} data={info} />
				))}
			</div>
		</div>
	);
};

function EditItem({ icon, title, data }: any): JSX.Element {
	return (
		<div className="w-full flex flex-col gap-3 items-start lg:flex-row lg:items-center lg:justify-between py-5 lg:py-11 border-y border-y-light-white first:border-t-0 last:border-b-0">
			<div className="flex gap-4 items-center lg:w-1/5">
				<div className="rounded-full border border-theme-coral w-fit h-fit p-1">{icon}</div>
				<span className="text-xl font-bold">{title}</span>
			</div>

			<div className="lg:w-1/2 flex flex-col gap-3">
				{data?.verified ? (
					<div>
						{data.verified !== 'not required' && (
							<div className="flex items-center gap-1">
								<VerifiedUserIcon htmlColor="#b2ff0b" />
								Verified
							</div>
						)}
					</div>
				) : (
					<div className="flex items-center gap-1 text-light-grey">
						<WarningIcon />
						Not setup
					</div>
				)}
				<span className={`${data?.verified || 'text-light-grey'}`}>{data.value}</span>
			</div>

			<button className="primary-btn in-dark w-1/3 lg:w-fit">Edit</button>
		</div>
	);
}

export default EditProfile;
