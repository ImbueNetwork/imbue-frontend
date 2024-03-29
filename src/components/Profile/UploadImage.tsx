/* eslint-disable no-unused-vars */
import { CircularProgress } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { uploadPhoto } from '@/utils/imageUpload';

import { fetchUserRedux } from '@/redux/reducers/userReducers';
import { AppDispatch } from '@/redux/store/store';

type UploadImageProps = {
  isEditMode: boolean;
  setUser: (value: any) => void;
  currentUserData: any;
  initUserData: any;
  saveChanges?: (user: any) => Promise<any>;
  setError: (_error: any) => void;
};

const UploadImage = ({ isEditMode, setUser, initUserData, currentUserData, saveChanges, setError }: UploadImageProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();


  const handleUpload = async (files: FileList | null) => {
    if (files?.length) {
      setLoading(true);

      try {
        const data = await uploadPhoto(files[0]);
        if (data.url) {
          await saveChanges?.({
            ...initUserData,
            profile_photo: data.url,
            profile_image: data.url,
          })
          setUser((prev: any) => {
            return {
              ...prev,
              profile_photo: data.url,
              profile_image: data.url
            };
          });
          dispatch(fetchUserRedux());
        }
      } catch (error) {
        setError({ message: "Could not updpate profile photo" })
        setLoading(false);
      }
    }
  };

  return (
    <div className='h-32 w-32 bg-white rounded-full relative -mt-12 unset border border-light-purple'>
      <Image
        src={currentUserData?.profile_photo || currentUserData?.profile_image || require('@/assets/images/profile-image.png')}
        alt='profile image'
        width={300}
        height={300}
        className='w-full h-full object-cover rounded-full'
        onLoad={() => setLoading(false)}
      />
      {isEditMode && (
        <>
          <input
            onChange={(e) => handleUpload(e.target.files)}
            className='hidden'
            type='file'
            name='displayImage'
            id='displayImage'
          />
          <div className='bg-black absolute inset-12 rounded-full opacity-50'></div>
          <div className='absolute inset-12 text-center flex justify-center items-center'>
            {loading ? (
              <CircularProgress color='primary' />
            ) : (
              <label
                htmlFor='displayImage'
                className='border p-1.5 rounded-full hover:text-primary hover:border-primary cursor-pointer'
              >
                Upload Image
              </label>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UploadImage;
