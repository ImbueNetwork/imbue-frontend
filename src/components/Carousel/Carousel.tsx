import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// interface CarouselProps {
//   // slides: React.ReactNode[];
// }

const Carousel: React.FC = () => {
  const sliderRef = useRef<Slider | null>(null);

  const slides = [
    <Image key={"image-1"} src={"/slide_1.png"} height={700} width={500} alt="" />,
    <Image key={"image-2"} src={"/slide_2.png"} height={700} width={500} alt="" />,
    <Image key={"image-3"} src={"/slide_3.png"} height={700} width={500} alt="" />,
  ];

  useEffect(() => {
    const autoplayInterval = 3000;

    if (sliderRef.current) {
      sliderRef.current.slickPlay();
    }

    const autoplayTimer = setInterval(() => {
      if (sliderRef.current) {
        sliderRef.current.slickNext();
      }
    }, autoplayInterval);

    return () => {
      clearInterval(autoplayTimer);
    };
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    dotsClass: 'slides_bar',

    autoplay: false,
  };

  return (
    <Slider arrows={false} ref={sliderRef} {...settings}>
      {slides.map((slide, index) => (
        <div key={index}>{slide}</div>
      ))}
    </Slider>
  );
};

export default Carousel;
