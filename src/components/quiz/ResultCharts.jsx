import React from 'react';
import { Chart, registerables } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
Chart.register(...registerables);

export default function ResultCharts({ result }) {
  const doughnutData = {
    labels: ['Correct', 'Wrong', 'Skipped'],
    datasets: [{
      data: [result.correct, result.wrong, result.skipped],
      backgroundColor: ['#22c55e', '#ef4444', '#94a3b8'],
      borderWidth: 0,
    }]
  };

  const doughnutOptions = {
    cutout: '70%',
    plugins: {
      legend: { display: false }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="result-charts">
      <div className="result-chart-card">
        <h4>Score Distribution</h4>
        <div className="chart-wrapper" style={{ height: 200 }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
        <div className="chart-legend-dist">
          <div className="legend-dist-item"><span style={{ background: '#22c55e' }}></span> Correct ({result.correct})</div>
          <div className="legend-dist-item"><span style={{ background: '#ef4444' }}></span> Wrong ({result.wrong})</div>
          <div className="legend-dist-item"><span style={{ background: '#94a3b8' }}></span> Skipped ({result.skipped})</div>
        </div>
      </div>
    </div>
  );
}
