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
      return d3.time.format("%m/%d %H:%M")(new Date((d-(9*3600))*1000));
    });
    chart.yAxis.tickFormat(d3.format(","));

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
  collectionRef
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        // Push to the appropriate array based on the sensor
        if (sensor === "temperature") {
          temperatureData.push(doc.data());
        } else if (sensor === "humidity") {
          humidityData.push(doc.data());
        } else if (sensor === "pressure") {
          pressureData.push(doc.data());
        }
        document.getElementById(sensor).innerText = doc.data().value;
        var today = new Date();
        var date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate();
        var time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();
        var dateTime = date + " " + time;
        document.getElementById("last-update").innerText = dateTime;
      });
    })
    .then(() => {
      createChart("temperature");
      createChart("humidity");
      createChart("pressure");
    })
    .then(() => {
      console.log("Temp data: ", temperatureData);
      console.log("Humidity: ", humidityData);
      console.log("pressure: ", pressureData);
    });
}

/**
 * Triggered once DOM is loaded.
 */
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM content loaded");
  try {
    var sensors = ["temperature", "humidity", "pressure"];
    sensors.forEach(function(sensor) {
      readData(sensor);
    });
  } catch (e) {
    console.error(e);
  }
});
