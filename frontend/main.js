// thermostat starts closed
var thermostat_state1=false;
var thermostat_state2=false;
var thermostat_state_home=false;

var checkBoxh = document.getElementById("myCheckh");
var checkBox1 = document.getElementById("myCheck1");
var checkBox2 = document.getElementById("myCheck2");
// HTTP REQUEST FUNCTION
var xhr = null;
var slider1 = document.getElementById("slider1");
var slider2 = document.getElementById("slider2");
var slider0 = document.getElementById("slider0");
var output1 = document.getElementById("select-temp1");
var output2 = document.getElementById("select-temp2");
var output0 = document.getElementById("select-temp0");

output1.innerHTML = slider1.value+ "\u2103";
output2.innerHTML = slider2.value+ "\u2103";
output0.innerHTML = slider0.value+ "\u2103";

getXmlHttpRequestObject = function () {
        if (!xhr) {
            // Create a new XMLHttpRequest object 
            xhr = new XMLHttpRequest();
        }
        return xhr;
    };
// HOME SLIDER -> SET TEMP VALUES ON ALL ROOMS
slider0.oninput = function() {
    output0.innerHTML = this.value+"\u2103";

    if (thermostat_state_home === true) {
        slider1.value = this.value;
        output1.innerHTML = slider1.value+ "\u2103";
        slider2.value = this.value;
        output2.innerHTML = slider2.value+ "\u2103";
    }
};


////////////////////////////////// TEMP 2 SLIDER
slider2.oninput = function() {
    output2.innerHTML = this.value+ "\u2103";
    
    if (thermostat_state2=== true) {
        // send set-temp POST request
        xhr = getXmlHttpRequestObject();
        //asynchronous requests
        xhr.open("POST", "http://localhost:6969/settemp2", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        // Send the request over the network
        xhr.send(JSON.stringify({"data": this.value}));
        console.log('Temp 2 set:', this.value);
    }
};
// set-Temp 2 interval
setInterval( function(){
    if (thermostat_state2===true) {
        // send set-temp POST request
        xhr = getXmlHttpRequestObject();
        //asynchronous requests
        xhr.open("POST", "http://localhost:6969/settemp2", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        // Send the request over the network
        xhr.send(JSON.stringify({"data": slider2.value}));
        console.log('Temp 2 set:', slider1.value);
    }
}, 5000);

/////////////////////// TEMP 1 SLIDER
slider1.oninput = function() {    
    output1.innerHTML = this.value+ "\u2103";
    
    if (thermostat_state1=== true) {
        // send set-temp POST request
        xhr = getXmlHttpRequestObject();
        //asynchronous requests
        xhr.open("POST", "http://localhost:6969/settemp1", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        // Send the request over the network
        xhr.send(JSON.stringify({"data": this.value}));
        console.log('Temp 1 set:', this.value);
    }
};
    // set-Temp 1 interval
setInterval( function(){
    if (thermostat_state1===true) {
        // send set-temp POST request
        xhr = getXmlHttpRequestObject();
        //asynchronous requests
        xhr.open("POST", "http://localhost:6969/settemp1", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        // Send the request over the network
        xhr.send(JSON.stringify({"data": slider1.value}));
        console.log('Temp 1 set:', slider1.value);
        }
}, 4000);



    //// SCHEDULE ROOM 1-2
var isSchedule1CallbackExecuted;
var isSchedule2CallbackExecuted;
var isScheduleHomeCallbackExecuted;
var sch_H = false;
    function sch_h() {
        thermostat_state_home = !(thermostat_state_home);
        console.log('thermo_Home_after:', thermostat_state_home);
        thermostat_state1 = thermostat_state_home;
        thermostat_state2 = thermostat_state_home;
        checkBoxh.checked = thermostat_state_home;
        checkBox1.checked = thermostat_state_home;
        checkBox2.checked = thermostat_state_home;
        sch_H=false;
    }
    function sch_1() {
        thermostat_state1 = !(thermostat_state1);
        console.log('thermo_1_after:', thermostat_state1);
        checkBox1.checked = thermostat_state1;
    }
    function sch_2() {
        thermostat_state2 = !(thermostat_state2);
        console.log('thermo_2_after:', thermostat_state2);
        checkBox2.checked = thermostat_state2;
    }

    function scheduleHomeCallback() {
        if (xhr.readyState === 4 && xhr.status === 200 && !isScheduleHomeCallbackExecuted) {
            isScheduleHomeCallbackExecuted = true;
            console.log('Schedule Home set:', time2turn0);
            //
            var hour = parseInt(time2turn0.slice(0, 2));
            var min = parseInt(time2turn0.slice(-2)); 
            var today = new Date(); // assign a value to today
            var sch_time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, min);
            var diff = sch_time - today;
            var secs2turn0 = diff / 1000;
            //
            console.log('thermo_Home_before:', thermostat_state_home);
            setTimeout(sch_h, secs2turn0*1000);
        }
    }
    function schedule1Callback() {
        if (xhr.readyState === 4 && xhr.status === 200 && !isSchedule1CallbackExecuted) {
            isSchedule1CallbackExecuted = true;
            console.log('Schedule 1 set:', time2turn1);
            //
            var hour = parseInt(time2turn1.slice(0, 2));
            var min = parseInt(time2turn1.slice(-2)); 
            var today = new Date(); // assign a value to today
            var sch_time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, min);
            var diff = sch_time - today;
            var secs2turn1 = diff / 1000;
            //
            console.log('thermo_1_before:', thermostat_state1);
            setTimeout(sch_1, secs2turn1*1000);
        }
    }
    function schedule2Callback() {
        if (xhr.readyState === 4 && xhr.status === 200 && !isSchedule2CallbackExecuted) {
            isSchedule2CallbackExecuted = true; // set the flag to true
            console.log('Schedule 2 set:', time2turn2);
            //
            var hour = parseInt(time2turn2.slice(0, 2));
            var min = parseInt(time2turn2.slice(-2)); 
            var today = new Date(); // assign a value to today
            var sch_time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, min);
            var diff = sch_time - today;
            var secs2turn2 = diff / 1000;
            //
            console.log('thermo_2_before:', thermostat_state2);
            setTimeout(sch_2, secs2turn2*1000);
        }
    }

    function schedule(id) {

        if (id===0) {
            isScheduleHomeCallbackExecuted = false;
            sch_H = true;
            xhr = getXmlHttpRequestObject();
            xhr.open("POST", "http://localhost:6969/schedule", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            time2turn0 = document.getElementById("startTime0").value;
            console.log('Home: ', time2turn0); 
            xhr.onreadystatechange = scheduleHomeCallback;            
            xhr.send(JSON.stringify({"time": time2turn0, "id":0}));
        }
        if (id===1) {
            if (sch_H===true) {
                alert('Wait until Home schedule is Done!')
            } else if (sch_H===false) {
                isSchedule1CallbackExecuted = false;

                xhr = getXmlHttpRequestObject();
                xhr.open("POST", "http://localhost:6969/schedule", true);
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                time2turn1 = document.getElementById("startTime1").value;
                console.log('room 1', time2turn1); 
                xhr.onreadystatechange = schedule1Callback;            
                xhr.send(JSON.stringify({"time": time2turn1, "id":1}));
            }
        }
        if (id===2) {
            if (sch_H===true) {
                alert('Wait until Home Schedule is Done!')
            } else if (sch_H===false) {
                isSchedule2CallbackExecuted = false;

                xhr = getXmlHttpRequestObject();
                xhr.open("POST", "http://localhost:6969/schedule", true);
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                time2turn2 = document.getElementById("startTime2").value;
                console.log('room 2', time2turn2); 
                xhr.onreadystatechange = schedule2Callback;
                xhr.send(JSON.stringify({"time": time2turn2, "id":2}));
            }
        }
    }


    //////  TURN ON/OFF HOME - ROOM - 1 -2
    function  onoffCallback() {
        if (xhr.readyState===4 && xhr.status===200) {
            console.log('Toggle Home On/Off');
        }
    }
    function onoff1Callback() {
        if (xhr.readyState===4 && xhr.status===200) {
            console.log('Toggle 1 On/Off');
        }
    }
    function onoff2Callback() {
        if (xhr.readyState===4 && xhr.status===200) {
            console.log('Toggle 2 On/Off');
        }
    }
    function turnonoff(id) {
        // check if on/off is pressed 
        var thermo=''; 
        if (id===0) {
            if (checkBoxh.checked===true) {
                thermostat_state_home = true;
                thermostat_state1 = true;
                thermostat_state2 = true;
                checkBox1.checked = true;
                checkBox2.checked = true;
                thermo = 'on';
                
            } else {
                thermostat_state_home = false;
                thermostat_state1 = false;
                thermostat_state2 = false;
                checkBox1.checked = false;
                checkBox2.checked = false;
                thermo = 'off';
            }
            xhr = getXmlHttpRequestObject();
            xhr.open("POST", "http://localhost:6969/turnonoff", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");        
            xhr.onreadystatechange = onoffCallback;
            xhr.send(JSON.stringify({"data": thermo, "id":0}));
        }
        if (id===1) {
            if (checkBox1.checked === true){
                thermo = "on";
                thermostat_state1=true;
            } else {
                thermo = "off";
                thermostat_state1=false;   
            }
            xhr = getXmlHttpRequestObject();
            xhr.open("POST", "http://localhost:6969/turnonoff", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");        
            xhr.onreadystatechange = onoff1Callback;
            xhr.send(JSON.stringify({"data": thermo, "id":1}));
        } 
        if (id===2) {
            if (checkBox2.checked === true){
                thermo = "on";
                thermostat_state2=true;
            } else {
                thermo = "off";
                thermostat_state2=false;   
            }    
            xhr = getXmlHttpRequestObject();
            xhr.open("POST", "http://localhost:6969/turnonoff", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");               
            xhr.onreadystatechange = onoff2Callback;
            xhr.send(JSON.stringify({"data": thermo, "id":2}));
        } 
    }

/// GET LIVE TEMP for 1-2.
function livetempCallback() {
    // Check response is ready or not
    if (xhr.readyState === 4 && xhr.status === 200) {
        
        try {
            tempObj = JSON.parse(xhr.responseText);
            console.log("Temp received!");
            console.log(xhr.responseText);
            //temp1
            temp1Div = document.getElementById('get-temp1');
            temp1Div.innerHTML = Math.round(tempObj.temp1) + "\u2103";
            //temp2   
            temp2Div = document.getElementById('get-temp2');
            temp2Div.innerHTML = Math.round(tempObj.temp2) + "\u2103";
        } catch (error) {
            console.log('Temp NOT Received');
        }
    }
}
setInterval(function() {
    xhr = getXmlHttpRequestObject();
    xhr.onreadystatechange = livetempCallback;
    xhr.open("GET", "http://localhost:6969/temp", true);
    xhr.send(null);
}, 6000);
