const getAQIIcon = (aqi: number) => {
  if (aqi <= 50) return 'air-purifier';
  if (aqi <= 100) return 'face-mask';
  if (aqi <= 150) return 'cloud-alert';
  if (aqi <= 200) return 'smog';
  if (aqi <= 300) return 'exclamation-thick';
  return 'skull';
};

const getAQIStyle = (aqi: number) => {
  if (aqi <= 50) return { backgroundColor: '#e8f5e9', borderColor: '#66bb6a' };
  if (aqi <= 100) return { backgroundColor: '#fff3e0', borderColor: '#ffa726' };
  if (aqi <= 150) return { backgroundColor: '#fff8e1', borderColor: '#ffd54f' };
  if (aqi <= 200) return { backgroundColor: '#ffebee', borderColor: '#ef5350' };
  if (aqi <= 300) return { backgroundColor: '#f3e5f5', borderColor: '#ab47bc' };
  return { backgroundColor: '#fce4ec', borderColor: '#c2185b' };
};

const getAQIMessage = (aqi: number) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy';
  if (aqi <= 200) return 'Very Unhealthy';
  if (aqi <= 300) return 'Hazardous';
  return 'Severe';
};

export { getAQIIcon, getAQIStyle, getAQIMessage };
