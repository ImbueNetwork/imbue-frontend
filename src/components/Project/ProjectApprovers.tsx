import { Dialog, DialogContent, DialogTitle, Skeleton } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Project, User } from '@/model';
import { getApproverProfiles } from '@/redux/services/projectServices';
import { RootState } from '@/redux/store/store';

type ProjectApproversType = {
  approversPreview: User[];
  project: Project;
  setApproverPreview: (_value: User[]) => void;
  projectOwner: User | undefined;
};

const ProjectApprovers = (props: ProjectApproversType) => {
  const { approversPreview, project, setApproverPreview, projectOwner } = props;

  const { user } = useSelector((state: RootState) => state.userState);

  const [loading, setLoading] = useState<boolean>(true);
  const [showApproverList, setShowApproverList] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const getAndSetApprovers = async () => {
      // setting approver list
      let approversPreviewList: any = [...approversPreview];

      try {
        // if (project?.approvers?.length) {
        //     const promises: Promise<User>[] = [];

        //     project?.approvers.map((approverAddress: any) => {
        //         if (approverAddress === user?.web3_address) setIsApprover(true);

        //         promises.push(utils.fetchUserByUsernameOrAddress(approverAddress))
        //     })

        //     const approversList = await Promise.all(promises)

        //     approversList.map((approver, index) => {
        //         if (approver?.id) {
        //             approversPreviewList.push(approver);
        //         } else {
        //             approversPreviewList.push({
        //                 id: 0,
        //                 display_name: '',
        //                 profile_photo: '',
        //                 username: '',
        //                 web3_address: project.approvers[index],
        //                 getstream_token: '',
        //             });
        //         }
        //     })

        // } else if (approversPreviewList.length === 0 && projectOwner) {
        //     approversPreviewList.push({
        //         id: projectOwner?.id,
        //         display_name: projectOwner?.display_name,
        //         profile_photo: projectOwner?.profile_photo,
        //         username: projectOwner?.username,
        //         web3_address: projectOwner?.web3_address,
        //         getstream_token: projectOwner?.getstream_token,
        //     });
        // }
        // setApproverPreview(approversPreviewList);

        if (project?.approvers?.length) {
          const approvers = await getApproverProfiles(project.approvers);
          approversPreviewList = approvers;
        } else {
          approversPreviewList = [
            {
              id: projectOwner?.id,
              display_name: projectOwner?.display_name,
              profile_photo: projectOwner?.profile_photo,
              username: projectOwner?.username,
              web3_address: projectOwner?.web3_address,
              getstream_token: projectOwner?.getstream_token,
            },
          ];
        }

        setApproverPreview(approversPreviewList);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    project?.id && getAndSetApprovers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    project.id,
    setApproverPreview,
    user?.web3_address,
    projectOwner?.id,
    projectOwner?.display_name,
    projectOwner?.profile_photo,
    projectOwner?.username,
    projectOwner?.web3_address,
    projectOwner?.getstream_token,
  ]);

  if (loading || approversPreview?.length === 0)
    return (
      <div className='flex flex-col lg:flex-row lg:items-center gap-5'>
        {[1, 1, 1].map((approver: any, index: number) => (
          <div
            key={index}
            className={`flex text-content gap-4 items-center ${
              approver?.display_name && 'cursor-pointer'
            }`}
            onClick={() =>
              approver.display_name &&
              router.push(`/profile/${approver.username}`)
            }
          >
            <Skeleton
              animation='wave'
              variant='circular'
              width={40}
              height={40}
            />
            <div className='flex flex-col'>
              <Skeleton
                animation='wave'
                variant='text'
                sx={{ fontSize: '.9rem', width: 50 }}
              />
              <Skeleton
                animation='wave'
                variant='text'
                sx={{ fontSize: '.6rem', width: 80 }}
              />
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className='h-full pl-1'>
      <div className='flex justify-between'>
        <p className='text-[#8A5C5A] text-sm pl-3'>Approvers</p>
        {!project.brief_id && (
          <p
            className='bg-white text-black mr-4 px-2 py-1 rounded-full text-xs cursor-pointer'
            onClick={() => setShowApproverList(true)}
          >
            see all
          </p>
        )}
      </div>

      {approversPreview?.length > 0 && (
        <div className='grid grid-cols-12 flex-wrap gap-2 mt-4'>
          {approversPreview?.slice(0, 4).map((approver: any, index: number) => (
            <div
              key={index}
              className={`col-span-12 lg:col-span-3 flex text-content px-2 py-2 rounded-xl gap-2 items-center ${
                approver?.display_name && 'cursor-pointer'
              } ${approver.id === user?.id && 'bg-[#FFDAD8]'}`}
              onClick={() =>
                approver.display_name &&
                router.push(`/profile/${approver.username}`)
              }
            >
              <Image
                src={
                  approver?.profile_photo ||
                  require('@/assets/images/profile-image.png')
                }
                height={80}
                width={80}
                alt=''
                className='rounded-full w-10 h-10 object-cover'
              />
              <div className='flex flex-col'>
                <span className='text-base'>
                  {approver?.display_name.length > 5
                    ? approver.display_name.substring(0, 5) + '...'
                    : approver.display_name}
                </span>
                <p className='text-xs break-all text-imbue-purple-dark text-opacity-40'>
                  {approver?.web3_address?.substring(0, 6) +
                    '...' +
                    approver?.web3_address?.substring(42)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={showApproverList}
        onClose={() => setShowApproverList(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          className: 'w-1/2 pb-2 pr-4 rounded-xl max-h-[70vh] custom-scroll',
        }}
        maxWidth='lg'
      >
        <DialogTitle id='alert-dialog-title'>
          {'People who can vote for this project'}
        </DialogTitle>
        <DialogContent className='pr-1'>
          <div className='flex flex-col gap-5 bg-light-grey rounded-xl p-4'>
            {approversPreview.map((approver, index) => (
              <div
                key={index}
                className={`text-black flex gap-3 ${
                  approver.username && 'cursor-pointer'
                } w-fit`}
                onClick={() =>
                  approver.username &&
                  router.push(`/profile/${approver.username}`)
                }
              >
                <Image
                  src={
                    approver.profile_photo ||
                    require('@/assets/images/profile-image.png')
                  }
                  alt='voter'
                  height={80}
                  width={80}
                  className='rounded-full w-12 h-12 object-cover'
                />

                <div className='flex flex-col'>
                  <p className=''>{approver.display_name}</p>
                  <p className='text-sm my-auto'>{approver.web3_address}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectApprovers;
