MBlockly = MBlockly || {};
MBlockly.Sensors = {
  sensorList : {
    'ULTRASONIC': 3,
    'LINEFOLLOW': 2,
    'LIGHTSENSOR': 6
  },
};

MBlockly.Sensors.openSensor = function() {
  var that = this;
  for(var i in this.sensorList) {
    setTimeout((function(item) {
      this['checkSensor-' + i] = setInterval(function() {
          MBlockly.Control.getSensorValue(item, that.sensorList[item], function(val){
            $('.' + item).text(val);
          });
      }, 200);
    })(i), 100);
  }
}

MBlockly.Sensors.closeSensor = function() {
  for(var i in this.sensorList) {
    clearInterval(this['checkSensor-' + i]);
  }
}

$(function() {
  // $('.sensors').text('nihao');
  // setTimeout(function() {
    MBlockly.Sensors.openSensor();
  // }, 2000);
});