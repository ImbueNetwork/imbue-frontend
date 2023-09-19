import React, { useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface CarouselProps {
  slides: React.ReactNode[];
}

const Carousel: React.FC<CarouselProps> = ({ slides }) => {
  const sliderRef = useRef<Slider | null>(null);

  useEffect(() => {
    const autoplayInterval = 3000; // Change this to your desired autoplay interval in milliseconds

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
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    
    autoplay: false, // Autoplay is handled manually
  };

  return (
    <Slider arrows={false}  ref={sliderRef} {...settings}>
      {slides.map((slide, index) => (
        <div key={index}>{slide}</div>
      ))}
    </Slider>
  );
};

export default Carousel;
