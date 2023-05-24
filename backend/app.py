from flask import Flask, request
import flask 
import json 
from flask_cors import CORS 

import time
from datetime import datetime
import threading 
import sensor1, sensor2 


import paho.mqtt.client as paho
from paho import mqtt
thermo_state1 = False
thermo_state2 = False
thermo_state_home = False 

def countdown(sec, id):
    global thermo_state_home
    global thermo_state1 
    global thermo_state2
    flag = True
    while flag:
        time.sleep(1)
        sec -= 1
        if sec == 0:
            flag=False 
    print("Timer done")
    if id==1:
        if thermo_state1==True:
            thermo_state1=False
            print('thermostat_1_off')
            thermostat(1, 'off')
        elif thermo_state1==False:
            thermo_state1=True
            print('thermostat_1_on')
            thermostat(1, 'on')
    elif id==2:
        if thermo_state2==True:
            thermo_state2=False
            print('thermostat_2_off')
            thermostat(2, 'off')
        elif thermo_state2==False:
            thermo_state2=True
            print('thermostat_2_on')
            thermostat(2, 'on')
    elif id==0:
        if thermo_state_home==True:
            print('thermo_state_hom before:', thermo_state_home)
            thermo_state_home=False
            thermo_state1 = False
            thermo_state2 = False
            print('Home thermo off')
            thermostat(0, 'off')
        elif thermo_state_home==False:
            print('thermo_state_hom before:', thermo_state_home)
            thermo_state_home=True
            thermo_state1 = True
            thermo_state2 = True
            print('Home thermostat on') 
            thermostat(0, 'on')

# connect to esp32  
def on_connect(client, userdata, flags, rc, properties=None):
    print("app CONNACK received with code %s." % rc)

def thermostat(id, command):
    global thermo_state1
    global thermo_state2
    global thermo_state_home

    if id==1: #room 1
        client.publish('esp32/output1', command)
        if command=="on":
            thermo_state1=True
        elif command=="off":
            thermo_state1=False
    
    elif id==2: #room 2
        client.publish('esp32/output2', command)
        if command=="on":
            thermo_state2=True
        elif command=="off":
            thermo_state2=False
    elif id==0: #Home
        client.publish('esp32/output1', command)
        client.publish('esp32/output2', command)
        if command=="on":
            thermo_state_home=True
            thermo_state2 = True
            thermo_state1 = True 
        elif command=="off":
            thermo_state_home=False
            thermo_state2=False
            thermo_state1=False


app = Flask(__name__)
CORS(app)

### TURN ON/OFF ROOM 1-2
@app.route('/turnonoff', methods=["POST"])
def turnonoff():
    #get thermo on/off data from toggle
    toggle = request.get_json()
    print(f"Thermostat: {toggle}")
    thermo = toggle['data']
    id = toggle['id']
    # turn on/off thermostat
    thermostat(id=id, command=thermo)
    print(flask.Response(status=200))
    return flask.Response(status=200)

########### TEMP 1-2 SET
@app.route('/settemp1', methods=["POST"])
def settemp1():
    global set_temp1
    global current_temp1

    req = request.get_json()
    set_temp1 = req['data']

    with open("sensor1.txt","r") as db1:
        data1 = [json.loads(line) for line in db1.read().split("\n")[:-1]]
        current_temp1 = data1[-1]["temperature"]

    if float(set_temp1) > float(current_temp1) +2.:
        thermostat(1, 'on')
    elif float(set_temp1) < float(current_temp1) -2.:
        thermostat(1, 'off')
    else:
        pass

    return flask.Response(status=200)

@app.route('/settemp2', methods=["POST"])
def settemp2():
    global set_temp2
    global current_temp2

    req = request.get_json()
    set_temp2 = req['data']

    with open("sensor2.txt","r") as db2:
        data2 = [json.loads(line) for line in db2.read().split("\n")[:-1]]
        current_temp2 = data2[-1]["temperature"]

    if float(set_temp2) > float(current_temp2) +2.:
        thermostat(2, 'on')
    elif float(set_temp2) < float(current_temp2) -2.:
        thermostat(2, 'off')
    else:
        pass

    return flask.Response(status=200)

@app.route('/schedule', methods=["POST"])
def schedule():
    incoming_data = request.get_json() 
    incoming_time = incoming_data['time']
    id = incoming_data["id"]
    print('Schedule for:', incoming_time)        
    time2turn = incoming_time # 22:10
    hour = int(time2turn[:2])
    min = int(time2turn[-2:])
    today = datetime.now() 
    # time to open/close - now --> in seconds
    sch_time = datetime(today.year, today.month, today.day, hour, min)
    diff = (sch_time - datetime.now())
    secs2turn = diff.seconds

    ## add counter
    timer = threading.Thread(target=countdown, args=(secs2turn,id))
    timer.start()
    return flask.Response(status=200)

### LIVE TEMP FROM ROOM 1 -2 
@app.route('/temp', methods=["GET"])
def temp():

    with open("sensor1.txt","r") as db1:
            data1 = [json.loads(line) for line in db1.read().split("\n")[:-1]]
            current_temp1 = data1[-1]["temperature"]

    with open("sensor2.txt","r") as db2:
            data2 = [json.loads(line) for line in db2.read().split("\n")[:-1]]
            current_temp2 = data2[-1]["temperature"]

    return flask.jsonify({"temp1":current_temp1, "temp2":current_temp2})


if __name__ == "__main__":
    #connect to esp32
    client = paho.Client()
    #set callback function on connection
    client.on_connect = on_connect
    # enable TLS for secure connection
    client.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)
    # set username and password
    client.username_pw_set("pythonapp", "pythonapp")
    # connect to HiveMQ Cloud on port 8883 (default for MQTT)
    client.connect("cf436af5bbf841488c552c8ca2f634f7.s2.eu.hivemq.cloud", port=8883)
    # start connection 
    client.loop_start()

    # start reading data from both sensors 
    t1 = threading.Thread(target=sensor1.read_data)
    t1.start()
    t2 = threading.Thread(target=sensor2.read_data) 
    t2.start() 

    app.run("localhost", 6969, threaded=True)