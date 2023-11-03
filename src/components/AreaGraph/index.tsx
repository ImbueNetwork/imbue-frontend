import dynamic from 'next/dynamic';

import { userAnalyticsType } from '@/pages/dashboard/new';

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export default function AreaGrah({
  userInfo,
}: {
  userInfo: userAnalyticsType[];
}) {
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
      categories: userInfo?.map((item) => item.label.substring(0, 3)),
    },
  };

  const series = [
    {
      name: 'profile views',
      data: userInfo?.map((item) => item.value),
    },
  ];

  return <Chart series={series} options={options} type='area' height={320} />;
}
