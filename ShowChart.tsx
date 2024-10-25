import React, {useState} from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import jsonData from './data.json'; // History data
import predictionData from './prediction1.json'; // Prediction data

interface ConsumptionData {
  timestamp: string;
  unitConsumption: number;
}

export const processData = (jsonData: ConsumptionData[]) => {
  try {
    const labels = jsonData.map(item =>
      item.timestamp.split(' ')[1].substring(0, 5),
    );
    const data = jsonData.map(item => item.unitConsumption);

    return {labels, data};
  } catch (error) {
    console.error('Error processing data:', error);
    return {labels: [], data: []};
  }
};
// Date formating function-->
const formatDateTime = (dateString: string, onlyDate: boolean = false) => {
  const date = new Date(dateString); // convert date string into js Date object

  if (onlyDate) {
    return moment(date).format('MMMM Do YYYY'); // Show only date
  }

  const formattedDate = moment(date).format('MMMM Do YYYY'); //october 17th,2024
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 24-hour time to 12-hour format
  const formattedTime = `${hours}:${
    minutes < 10 ? '0' + minutes : minutes
  } ${ampm}`;

  return `${formattedDate}, ${formattedTime}`; // Return full date and time
};

// daily consumption calculation -->
const calculateDailyConsumption = (jsonData: ConsumptionData[]) => {
  const dailyConsumption: {[key: string]: number} = {};

  jsonData.forEach(item => {
    const date = moment(item.timestamp).format('YYYY-MM-DD');
    if (dailyConsumption[date]) {
      dailyConsumption[date] += item.unitConsumption;
    } else {
      dailyConsumption[date] = item.unitConsumption;
    }
  });

  const sortedDates = Object.keys(dailyConsumption).sort();
  const labels = sortedDates.map((_, index) => `Day${index + 1}`);
  const data = sortedDates.map(date =>
    parseFloat(dailyConsumption[date].toFixed(2)),
  );
  const dateMapping = sortedDates;

  return {labels, data, dateMapping};
};

const ChartComponent = () => {
  const [data, setData] = useState<ConsumptionData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showAdditionalButtons, setShowAdditionalButtons] = useState(false);
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [chartConfig, setChartConfig] = useState<{
    labels: string[];
    data: number[];
    dateMapping?: string[];
  }>({labels: [], data: []});

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    fetchDataForDate(date);
    hideDatePicker();
  };

  const fetchDataForDate = async (date: Date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const dataSource =
      selectedCategory === 'Prediction' ? predictionData : jsonData;

    try {
      const filteredData = dataSource.filter(
        item => moment(item.timestamp).format('YYYY-MM-DD') === formattedDate,
      );

      if (filteredData.length > 0) {
        setData(filteredData);
        const processedData = processData(filteredData);
        setChartConfig(processedData);
        setIsGraphVisible(true);
      } else {
        Alert.alert('No data available for the selected date');
        setIsGraphVisible(false);
      }
    } catch (error) {
      Alert.alert('Error fetching data');
      setIsGraphVisible(false);
    }
  };

  const handleSelection = (option: string) => {
    if (option === 'Daily Consumption') {
      const dataSource =
        selectedCategory === 'Prediction' ? predictionData : jsonData;
      const processedData = calculateDailyConsumption(dataSource);
      setChartConfig(processedData);
      setSelectedCategory('Daily Consumption'); // Set the selected category for clarity
      setIsGraphVisible(true);
    } else {
      setSelectedCategory(option); // Set the selected category
      setIsGraphVisible(false); // Reset graph visibility
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleSelection('History');
            setShowAdditionalButtons(true);
          }}>
          <Text style={styles.buttonText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleSelection('Prediction');
            setShowAdditionalButtons(true);
          }}>
          <Text style={styles.buttonText}>Prediction</Text>
        </TouchableOpacity>
      </View>

      {showAdditionalButtons && (
        <View style={styles.additionalButtonsContainer}>
          <TouchableOpacity
            style={styles.additionalButton}
            onPress={() => handleSelection('Daily Consumption')}>
            <Text style={styles.buttonText}>Daily Consumption</Text>
          </TouchableOpacity>

          {selectedCategory === 'History' && ( // Show only for History
            <TouchableOpacity
              style={styles.additionalButton}
              onPress={showDatePicker}>
              <Text style={styles.buttonText}>Select Date</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {selectedDate && (
        <Text style={styles.selectedDateText}>
          Selected Date: {moment(selectedDate).format('MMMM Do YYYY')}
        </Text>
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      {isGraphVisible && chartConfig.data.length > 0 && (
        <ScrollView horizontal={true}>
          <View style={{width: chartConfig.data.length * 40}}>
            <LineChart
              data={{
                labels: chartConfig.labels,
                datasets: [{data: chartConfig.data}],
              }}
              width={chartConfig.data.length * 40}
              height={300}
              yAxisSuffix=" kWh"
              chartConfig={{
                backgroundColor: '#F8F8F8', // Change to off-white background
                backgroundGradientFrom: '#F8F8F8', // Change gradient start to off-white
                backgroundGradientTo: '#F8F8F8', // Change gradient end to off-white
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Adjusted to black for better contrast
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color in black
                style: {borderRadius: 16},
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#ffa726',
                },
              }}
              bezier
              style={{marginVertical: 8, borderRadius: 16}}
              onDataPointClick={({index, value}) => {
                if (index !== undefined && value !== undefined) {
                  if (
                    selectedCategory === 'Daily Consumption' &&
                    chartConfig.dateMapping
                  ) {
                    const dateKey = chartConfig.dateMapping[index];
                    const totalConsumption = chartConfig.data[index].toFixed(2);
                    const formattedDate = formatDateTime(dateKey, true);
                    Alert.alert(
                      `${formattedDate}:`,
                      `Total Consumption: ${totalConsumption} kWh`,
                    );
                  } else {
                    const timestamp = data[index]?.timestamp;
                    if (timestamp) {
                      const formattedDateTime = formatDateTime(timestamp);
                      Alert.alert(
                        `Energy Consumption: ${value.toFixed(
                          2,
                        )} kWh on ${formattedDateTime}`,
                      );
                    } else {
                      Alert.alert(
                        'Error retrieving timestamp for this data point.',
                      );
                    }
                  }
                } else {
                  Alert.alert('Error retrieving data for this point.');
                }
              }}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    width: 150,
  },
  buttonText: {color: 'white', fontWeight: 'bold', textAlign: 'center'},
  additionalButtonsContainer: {marginTop: 16},
  additionalButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedDateText: {marginTop: 16, fontSize: 16},
});

export default ChartComponent;
