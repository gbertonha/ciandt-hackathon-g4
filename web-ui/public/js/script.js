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

    chart.xAxis.tickFormat(d3.format(",f"));
    chart.yAxis.tickFormat(d3.format(",.2f"));

    var tag = "#" + sensor + " svg"
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

function testData() {
  return [
    {
      color: "red",
      key: "temperature",
      values: [
        {
          x: 1,
          y: 100
        },
        {
          x: 2,
          y: 130
        },
        {
          x: 3,
          y: 90
        }
      ]
    },
    {
      color: "blue",
      key: "humidity",
      values: [
        {
          x: 1,
          y: 70
        },
        {
          x: 2,
          y: 60
        },
        {
          x: 3,
          y: 80
        },
        {
          x: 4,
          y: 90
        }
      ]
    }
  ];
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
    });
  console.log("Temp data: ", temperatureData);
  console.log("Humidity: ", humidityData);
  console.log("pressure: ", pressureData);
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
