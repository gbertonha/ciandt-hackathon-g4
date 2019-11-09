/*global firebase, document */
/*jslint browser:true */
"use strict";

/**
 * Reads data from Firestore and updates information
 * displayed on the dashboard
 * @param {String} sensor The sensor key.
 */

// var temperatureData = [];
// convertFirestoreToNvd3();

function createChart() {
    nv.addGraph(function() {
        //var chart = nv.models.historicalBarChart();
        //var chart = nv.models.lineWithFocusChart();
        var chart = nv.models.lineChart();
    
        chart.xAxis.tickFormat(d3.format(",f"));
        chart.yAxis.tickFormat(d3.format(",.2f"));
    
        d3.select("#chart svg")
            .datum(testData())
            .transition()
            .duration(500)
            .call(chart);
    
        nv.utils.windowResize(chart.update);
    
        return chart;
    });    
}

// function convertFirestoreToNvd3() {
//     var db = firebase.firestore();
//     var temperatureRef = db.collection("temperature");

//     temperatureRef.orderBy("time").limit(50);
//     temperatureRef
//         .get()
//         .then(queryShapshot => {
//             queryShapshot.forEach(doc => {
//                 console.log(doc.id, " => ", doc.data());
//             });
//         })
//         .catch(err => {
//             console.error("Error getting documents: ", err);
//         });
// }

function testData() {
    return [{
        color: "red",
        key: "temperature",
        values: [{
            x: 1,
            y: 100
        }, {
            x: 2,
            y: 130
        }, {
            x: 3,
            y: 90
        }]
    }, {
        color: "blue",
        key: "humidity",
        values: [{
            x: 1,
            y: 70
        }, {
            x: 2,
            y: 60
        }, {
            x: 3,
            y: 80
        }, {
            x: 4,
            y: 90
        }]
    }];
}


function readData(sensor) {
    var db = firebase.firestore();
    db.collection(sensor)
        .onSnapshot(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                createChart(doc.data());
                document.getElementById(sensor).innerText = doc.data().value;
                var today = new Date();
                var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var dateTime = date + ' ' + time;
                document.getElementById("last-update").innerText = dateTime;
            });
        });
}

/**
 * Triggered once DOM is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    try {
        createChart();

        var sensors = ["temperature", "humidity", "pressure"];
        sensors.forEach(function (sensor) {
            readData(sensor);
        });
    } catch (e) {
        console.error(e);
    }
});