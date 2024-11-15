// utils/processJsonData.ts

export const processJsonData = (data: any[]) => {
    const labels = data.map(item => item.timestamp);  // Extract timestamps
    const dataPoints = data.map(item => item.unitConsumption);  // Extract unit consumption values
    return { labels, dataPoints };  // Return the labels and data points
  };
  