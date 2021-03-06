
var noble = require('noble');

var ServiceName = 'temperature'
var Service_UUID = 'ec00';
var Characteristic_UUID = 'ec01';
var TemperatureCharacteristic = null;
var TemperatureValue = null;


noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});


noble.on('discover', function(peripheral) {
    console.log("Peripheral Name is " +  peripheral.advertisement.localName)
    if(peripheral.advertisement.localName == ServiceName){
		noble.stopScanning();
        peripheral.connect(function(error) {
            if(error){
                console.log(error);
                return;
            } 
            peripheral.discoverServices([], function(error, services){
                console.log('Services Discovered');
                    for (var i =0, l = services.length; i < l; i++ ){
                        console.log('Entered Services')
                        var service = services[i];
                        if (Service_UUID == service.uuid) {
                            noble.stopScanning();
                            console.log("Specific Service Found");
                            handleService(service);
                        }
                    } 
                });
         });
    }    
});


function handleService(service){
    service.discoverCharacteristics([], function(error, characteristics) {
        characteristics.forEach(function(characteristic){
            console.log('Found Characteristic:', characteristic.uuid);
            for(var i = 0, l = characteristics.length; i < l; i++) {
                if (characteristics[i].uuid === Characteristic_UUID){
                    TemperatureCharacteristic = characteristics[i];
                    setInterval(readTemperature,1000);
                    break;	
                }
            }     
        });
    });
}



function readTemperature() {
    TemperatureCharacteristic.read(function(error, data) {
        if(error){
            clearInterval(readTemperature);
            console.log(error);
        }
    });    
    TemperatureCharacteristic.once('read', function(value, isNotification) {
        TemperatureValue = value.readUInt8(0);
        console.log ("Temperature Value is "  + TemperatureValue)
        
	}); 
}


noble.on('disconnect', function() {
        console.log('Trying to reconnect');
        noble.startScanning();
});
