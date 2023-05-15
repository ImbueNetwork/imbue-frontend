import { uploadPhoto } from '@/utils/imageUpload';
import Image from 'next/image';
import React, { useState } from 'react';

type UploadImageProps = {
    isEditMode: boolean
}

const UploadImage = ({ isEditMode }: UploadImageProps) => {
    const [image, setImage] = useState<any>()

    const handleUpload = async(files : FileList | null) =>{
        if(files?.length){
            const data = await uploadPhoto(files[0])
            if(data.url) setImage(data.url);
        }
    }

    return (
        <div className="h-[160px] w-[160px] bg-[#2c2c2c] rounded-[100%] p-12 relative mt-[-120px] unset mx-auto">
            <Image
                src={image || require("@/assets/images/profile-image.png")}
                alt="profile image"
                width={100}
                height={100}
                className='w-full h-full object-cover rounded-full'
            />
            {
                isEditMode && (<>
                <input onChange={((e)=>handleUpload(e.target.files))} className='hidden' type="file" name="displayImage" id="displayImage" />
                    <div className='bg-black absolute inset-12 rounded-full opacity-50'></div>
                    <div className='absolute inset-12 text-center flex justify-center items-center'>
                        <label htmlFor='displayImage' className='border p-1.5 rounded-full hover:text-primary hover:border-primary cursor-pointer'>Upload Image</label>
                    </div>
                </>)
            }
        </div>
    );
};

export default UploadImage;