// MyPieChart.jsx (예시)
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2'; // Pie 차트 컴포넌트 임포트
import ChartDataLabels from 'chartjs-plugin-datalabels';
// Chart.js 기능 등록 (이 부분이 중요)
// 보통 애플리케이션의 진입점(index.js) 또는 차트를 사용하는 상위 컴포넌트에서 한 번만 등록하는 것이 좋습니다.
// 여기서는 예시를 위해 컴포넌트 내부에 포함했습니다.
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// PieChart 컴포넌트가 data prop을 받도록 수정
const PieChart = ({ data }) => { // Accept data as a prop
  // 1. 차트 데이터 정의 (이제 data prop으로 받아옴)
  // const data = { ... }; // This is now passed as a prop, remove internal definition

  // 2. 차트 옵션 정의 (선택 사항)
  const options = {
    responsive: true, // 부모 컨테이너에 맞춰 크기 조절
    maintainAspectRatio: false, // 비율 유지 여부
    plugins: {
      legend: {
        position: 'right', // 범례 위치
      },
      tooltip: {
        enabled: true, // 툴팁 활성화
      },
      datalabels: {
        formatter: (value, ctx) => {
          let sum = 0;
          let dataArr = ctx.chart.data.datasets;
          dataArr.map(data => {
            sum += data.data.reduce((a, b) => a + b, 0);
          });
          let percentage = (value * 100 / sum).toFixed(0) + "%";
          return percentage;
        },
        color: '#fff', // Text color of the labels
        font: {
          weight: 'bold',
        },
        anchor: 'center', // Position of the label
        align: 'center',
        offset: 4,
        padding: 0,
      },
    },
    // 다른 Chart.js 옵션들...
  };

  return (
    <div style={{ width: '100%', height: '100%' }}> {/* 차트가 렌더링될 컨테이너 크기 지정 */}
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;