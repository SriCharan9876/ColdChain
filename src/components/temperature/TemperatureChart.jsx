
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TemperatureChart({ history, tempMin, tempMax }) {
  if (!history || history.length === 0) {
    return <p>No temperature data to display.</p>;
  }

  const labels = history.map(r => new Date(Number(r.timestamp) * 1000).toLocaleTimeString());
  const dataPoints = history.map(r => Number(r.temperature));

  const minLine = new Array(history.length).fill(tempMin);
  const maxLine = new Array(history.length).fill(tempMax);

  const pointColors = dataPoints.map(temp => (temp < tempMin || temp > tempMax) ? 'red' : 'green');

  const data = {
    labels,
    datasets: [
      {
        label: 'Recorded Temp (°C)',
        data: dataPoints,
        borderColor: 'black',
        backgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointBackgroundColor: pointColors,
        pointRadius: 5,
        tension: 0.1
      },
      {
        label: `Max (${tempMax}°C)`,
        data: maxLine,
        borderColor: 'red',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      },
      {
        label: `Min (${tempMin}°C)`,
        data: minLine,
        borderColor: 'blue',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        suggestedMin: tempMin - 5,
        suggestedMax: tempMax + 5
      }
    }
  };

  return <Line data={data} options={options} />;
}
