/*global firebase, document */
/*jslint browser:true */
"use strict";

/**
 * Reads data from Firestore and updates information
 * displayed on the dashboard
 * @param {String} sensor The sensor key.
 */

var temperatureData = [];
var humidityData = [];
var pressureData = [];

function createChart(sensor) {
  nv.addGraph(function() {
    var chart = nv.models.lineChart();

    chart.xAxis.tickFormat(function(d) {
      return d3.time.format("%m/%d %H:%M")(new Date((d - 9 * 3600) * 1000));
    });
    chart.yAxis.tickFormat(d3.format(","));

    chart.xAxis.axisLabel("Time");

    if (sensor === "temperature") {
      chart.yAxis.axisLabel("Temperature");
    } else if (sensor === "humidity") {
      chart.yAxis.axisLabel("Humidity");
    } else if (sensor === "pressure") {
      chart.yAxis.axisLabel("Pressure");
    }

    var tag = "#" + sensor + " svg";
    d3.select(tag)
      .datum(convertFirestoreToNvd3(sensor))
      .transition()
      .duration(500)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function convertFirestoreToNvd3(sensor) {
  var valueArray;
  var color;
  if (sensor === "temperature") {
    valueArray = temperatureData;
    color = "red";
  } else if (sensor === "humidity") {
    valueArray = humidityData;
    color = "blue";
  } else if (sensor === "pressure") {
    valueArray = pressureData;
    color = "green";
  }

  var resultArray = [
    {
      color: color,
      key: sensor,
      values: []
    }
  ];
  valueArray.forEach(val => {
    resultArray[0].values.push({
      x: val.time.seconds,
      y: val.value
    });
  });
  return resultArray;
}

function readData(sensor) {
  var db = firebase.firestore();
  var collectionRef = db.collection(sensor);
  collectionRef.orderBy("time").limit(50);
  readSensorData(sensor).then(() => {
    createChart("temperature");
    createChart("humidity");
    createChart("pressure");
  });

  // It doesn't matter whether this information is rendered after the chart data is created
  collectionRef.get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      document.getElementById(sensor).innerText = doc.data().value;
      var today = new Date();
      var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + " " + time;
      document.getElementById("last-update").innerText = dateTime;
    });
  });
}

function refreshData() {
  temperatureData = [];
  humidityData = [];
  pressureData = [];
  var sensors = ["temperature", "humidity", "pressure"];
  sensors.forEach(function(sensor) {
    readSensorData(sensor);
  });
}

function readSensorData(sensor) {
  var db = firebase.firestore();
  var collectionRef = db.collection(sensor);
  collectionRef.orderBy("time").limit(50);
  return collectionRef.get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      if (sensor === "temperature") {
        temperatureData.push(doc.data());
      } else if (sensor === "humidity") {
        humidityData.push(doc.data());
      } else if (sensor === "pressure") {
        pressureData.push(doc.data());
      }
    });
  });
}

/**
 * Triggered once DOM is loaded.
 */
document.addEventListener("DOMContentLoaded", function() {
  try {
    var sensors = ["temperature", "humidity", "pressure"];
    sensors.forEach(function(sensor) {
      readData(sensor);
    });
  } catch (e) {
    console.error(e);
  }
});
