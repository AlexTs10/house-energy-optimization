import time
from datetime import datetime,timedelta
import paho.mqtt.client as paho
from paho import mqtt
import json
from statistics import median

last5=[]

# setting callbacks for different events to see if it works, print the message etc.
def on_connect(client, userdata, flags, rc, properties=None):

    print("Sensor1 CONNACK received with code %s." % rc)

# with this callback you can see if your publish was successful
def on_publish(client, userdata, mid, properties=None):
    pass
    #print("mid: " + str(mid))

# print which topic was subscribed to
def on_subscribe(client, userdata, mid, granted_qos, properties=None):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))

# print message, useful for checking if it was successful
def on_message(client, userdata, msg):
    global last5
    last5.append(str(msg.payload.decode("utf-8")))

    if len(last5)>=5:
        #calc current temp as median of the last 5 values in the txt
        current_temp = median([float(d) for d in last5])
        current_temp = round(current_temp, 2)
        print("Current Temp:%s"%current_temp)
        #reset last5
        last5=[]
        
        #add timestamp
        now = datetime.now().strftime('%Y/%m/%d %H:%M:%S')

        dic = {"timestamp":now,
               "temperature":current_temp}
    
        #append in the db
        with open("sensor1.txt","a") as db:
            db.write(json.dumps(dic))
            db.write('\n')

def read_data():

    clientr = paho.Client()
    #set callback function on connection
    clientr.on_connect = on_connect
    # enable TLS for secure connection
    clientr.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)
    # set username and password
    clientr.username_pw_set("thermostat", "thermostat")
    # connect to HiveMQ Cloud on port 8883 (default for MQTT)
    clientr.connect("cf436af5bbf841488c552c8ca2f634f7.s2.eu.hivemq.cloud", 8883)

    # setting callbacks, use separate functions like above for better visibility
    clientr.on_subscribe = on_subscribe
    clientr.on_message = on_message
    clientr.on_publish = on_publish

    clientr.subscribe("esp32/temperature1")

    clientr.loop_forever()

#if __name__ == "__main__":
#    read_data()
