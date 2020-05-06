import React from "react";
import { bindActionCreators } from 'redux';
import * as temperatureActions from '../actions/temperatureActions';
import { connect } from 'react-redux'
import { readBluetoothCharacteristic, bluetoothInit, bluetoothTemperatureContants} from '../bt_temp'

class BluetoothSetTemperature extends React.Component  {
  constructor(props) {
    super(props);
    this.state = {
      currentTemperature: 0,
      bluetoothConnection: undefined
    }
    this.temperatureInterval = undefined; 
    this.initializeBluetoothInterval = this.initializeBluetoothInterval.bind(this);
    this.initializeBluetoothConnection = this.initializeBluetoothConnection.bind(this);
  }

  componentWillUnmount() {
    if (this.temperatureInterval != undefined) {
      clearInterval(this.temperatureInterval);
    }
  }

  initializeBluetoothConnection() {
    let connection = bluetoothInit();
    connection.then(
      (conn) => {
        this.setState({bluetoothConnection: conn}, this.initializeBluetoothInterval);
      }, 
      (error) => {
        console.log(error);
        this.setState({bluetoothError: error})
      });
  }

  initializeBluetoothInterval() {
    console.log(this.state.bluetoothConnection); 
    
    this.temperatureInterval = setInterval( () => {
      let readTemperature = readBluetoothCharacteristic(this.state.bluetoothConnection, bluetoothTemperatureContants.characteristics.temperature_measurement.str);
      readTemperature.then(
        (temperature) => {
          this.props.actions.setTemperature(temperature);
        }, 
        (error) => {
          console.log(error); 
          this.setState({readTemperatureError: error});
        }
      )
      
    }, 1000);
  }

  render() {
    return (
      <div>
        <button type="button" onClick={this.initializeBluetoothConnection}>Start Bluetooth</button>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ ...temperatureActions }, dispatch),
    }
}

const mapStateToProps = state => ({
    temperatureDisplay: state.temperatureDisplay
});

export default connect(mapStateToProps, mapDispatchToProps)(BluetoothSetTemperature);
