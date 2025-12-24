const { createCanvas } = require('canvas');

// Generate a simple bar chart
const generateBarChart = (data, labels, title, width = 600, height = 400) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Title
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 30);
  
  if (!data || data.length === 0) {
    ctx.fillStyle = '#999999';
    ctx.font = '16px Arial';
    ctx.fillText('No data available', width / 2, height / 2);
    return canvas.toBuffer('image/png');
  }
  
  const maxValue = Math.max(...data, 1);
  const barWidth = (width - 100) / data.length;
  const chartHeight = height - 100;
  const barSpacing = 10;
  
  // Draw bars
  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * chartHeight;
    const x = 50 + index * (barWidth + barSpacing);
    const y = height - 50 - barHeight;
    
    // Gradient for bars
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth - barSpacing, barHeight);
    
    // Value label on top of bar
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    const formattedValue = value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value.toString();
    ctx.fillText(formattedValue, x + (barWidth - barSpacing) / 2, y - 5);
    
    // X-axis label
    ctx.fillStyle = '#666666';
    ctx.font = '11px Arial';
    const label = labels[index] || '';
    const truncatedLabel = label.length > 10 ? label.substring(0, 10) + '...' : label;
    ctx.fillText(truncatedLabel, x + (barWidth - barSpacing) / 2, height - 30);
  });
  
  return canvas.toBuffer('image/png');
};

// Generate a line chart
const generateLineChart = (data, labels, title, width = 600, height = 400) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Title
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 30);
  
  if (!data || data.length === 0) {
    ctx.fillStyle = '#999999';
    ctx.font = '16px Arial';
    ctx.fillText('No data available', width / 2, height / 2);
    return canvas.toBuffer('image/png');
  }
  
  const maxValue = Math.max(...data, 1);
  const chartHeight = height - 100;
  const chartWidth = width - 100;
  const pointSpacing = chartWidth / (data.length - 1 || 1);
  
  // Draw grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = 50 + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(width - 50, y);
    ctx.stroke();
  }
  
  // Draw line
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  data.forEach((value, index) => {
    const x = 50 + index * pointSpacing;
    const y = height - 50 - (value / maxValue) * chartHeight;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  
  // Draw points
  data.forEach((value, index) => {
    const x = 50 + index * pointSpacing;
    const y = height - 50 - (value / maxValue) * chartHeight;
    
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Value label
    ctx.fillStyle = '#333333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    const formattedValue = value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value.toString();
    ctx.fillText(formattedValue, x, y - 10);
  });
  
  // X-axis labels
  labels.forEach((label, index) => {
    const x = 50 + index * pointSpacing;
    ctx.fillStyle = '#666666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, height - 30);
  });
  
  return canvas.toBuffer('image/png');
};

// Generate hashtag chart
const generateHashtagChart = (hashtags, title = 'Top Hashtags by Views', width = 600, height = 400) => {
  const topHashtags = hashtags.slice(0, 10);
  const labels = topHashtags.map(h => h.tag);
  const data = topHashtags.map(h => h.totalViews);
  
  return generateBarChart(data, labels, title, width, height);
};

module.exports = {
  generateBarChart,
  generateLineChart,
  generateHashtagChart
};

