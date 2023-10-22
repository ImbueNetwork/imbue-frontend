import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export default function AreaGrah() {
  const options = {
    fill: {
      colors: ['#3B27C1'],
    },
    stroke: {
      height: '1px',
      colors: ['#3B27C1'],
    },
    dataLabels: {
      enabled: false,
    },
    toolbar: {
      enabled: false,
      show: false,
    },
    xaxis: {
      categories: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    },
  };

  const series = [
    {
      name: 'profile views',
      data: [0, 0, 3, 5, 2, 6, 0],
    },
  ];

  return <Chart series={series} options={options} type='area' height={320} />;
}
