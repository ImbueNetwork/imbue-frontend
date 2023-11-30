import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import 'swiper/css';
export function Controller({
  activeSlide,
  images,
}: {
  activeSlide: number;
  images: string[];
}) {
  const sp = useSwiper();
  const [click, setClick] = useState(false);
  useEffect(() => {
    sp.activeIndex = activeSlide;
  }, [activeSlide, sp]);
  const handleForward = () => {
    sp.slideNext();
    setClick(!click);
  };
  const handleBackward = () => {
    sp.slidePrev();
    setClick(!click);
  };

  useEffect(() => {
    const handleKeyBoardKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleForward();
      } else if (e.key === 'ArrowLeft') {
        handleBackward();
      }
    };

    window.addEventListener('keydown', handleKeyBoardKey);

    return () => {
      window.removeEventListener('keydown', handleKeyBoardKey);
    };
  });

  return (
    <div className='flex justify-between  absolute gap-5 items-center top-[50%] z-20  w-full '>
      <p>
        {sp.activeIndex !== 0 && (
          <IoIosArrowForward
            onClick={handleBackward}
            size={80}
            className='rotate-180 cursor-pointer text-imbue-purple'
          />
        )}
      </p>
      <p>
        {sp.activeIndex !== images.length - 1 && (
          <IoIosArrowForward
            onClick={handleForward}
            size={80}
            className=' cursor-pointer text-imbue-purple'
          />
        )}
      </p>
    </div>
  );
}

export default function ImageCurosal({
  Images,
  activeSlide,
}: {
  Images: any;
  activeSlide: string;
}) {
  const images = useMemo(() => {
    const filterData = Images.filter((img: any) => img.type.includes('image'));
    return filterData;
  }, [Images]);

  const activeIndex = useMemo(() => {
    const index = Images.findIndex((img: any) => img.image_url === activeSlide);
    return index;
  }, [Images, activeSlide]);
  return (
    <Swiper slidesPerView={1} className='relative  w-[80%] h-[80%]'>
      <Controller activeSlide={activeIndex} images={images} />
      {images?.map((item: any) => (
        <SwiperSlide key={'images' + item.image_url}>
          <Image
            className='w-full rounded-xl object-fill h-full'
            src={item.image_url}
            width={1920}
            height={1080}
            alt='images'
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
