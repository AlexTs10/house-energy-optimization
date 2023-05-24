#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#define ONBOARD_LED  2

//---- WiFi settings
//const char* ssid = "COSMOTE-23B5A1";
//const char* password = "|\\|5AC|Aspyw@re";
const char* ssid = "alexay";
const char* password = "12345678";
//---- MQTT Broker settings
const char* mqtt_server = "cf436af5bbf841488c552c8ca2f634f7.s2.eu.hivemq.cloud";  // replace with your broker url
const char* mqtt_username = "iotproject";
const char* mqtt_password = "iotproject";
const int mqtt_port = 8883;
const int LED_2 = 23;
//SVP 36
const int sensorPin1 = 36; 
//SVN 39
const int sensorPin2 = 39; 
//1
float sensorValue1;
float voltageOut1;
float temperatureC1;
float temperatureK1;
//2
float sensorValue2;
float voltageOut2;
float temperatureC2;
float temperatureK2;

WiFiClientSecure espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;



static const char* root_ca PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
)EOF";

void setup() {

  Serial.begin(9600);
  Serial.print("\nConnecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
  Serial.println("\nWiFi connected\nIP address: ");
  Serial.println(WiFi.localIP());

  while (!Serial) delay(1);

  espClient.setCACert(root_ca);
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  pinMode(ONBOARD_LED,OUTPUT);
  pinMode(LED_2, OUTPUT);
}

void loop() {

  if (!client.connected()) reconnect();
  client.loop();
// sensor 1
  sensorValue1 = analogRead(sensorPin1);
  voltageOut1 = (sensorValue1 * 3300) / 4096;
  temperatureK1 = voltageOut1 / 10;
  temperatureC1 = temperatureK1 - 273.15;
  publishMessage("esp32/temperature1", String(temperatureC1), true);

// sensor 2
  sensorValue2 = analogRead(sensorPin2);
  voltageOut2 = (sensorValue2 * 3300) / 4096;
  temperatureK2 = voltageOut2 / 10;
  temperatureC2 = temperatureK2 - 273.15;
  publishMessage("esp32/temperature2", String(temperatureC2), true);

  Serial.println("\n Temp 1: "+ String(temperatureC1));
  Serial.println("Temp 2: "+ String(temperatureC2));
  delay(2000);
  
  
}

//=======================================================================Function=================================================================================

void reconnect() {
  // Loop until we’re reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection…");
    String clientId = "ESP32Client -";  // Create a random client ID
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");

      //client.subscribe("esp32/temperature");  // subscribe the topics here
      client.subscribe("esp32/output1");
      client.subscribe("esp32/output2");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");  // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

//=======================================
// This void is called every time we have a message from the broker

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String incomingMessage;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    incomingMessage += (char)message[i];
  }
  Serial.println();

   // If a message is received on the topic esp32/output, you check if the message is either "on" or "off". 
  // Changes the output state according to the message
  if (String(topic) == "esp32/output1") {
    Serial.print("Changing output to ");
    if(incomingMessage == "on"){
      Serial.println("on");
      digitalWrite(ONBOARD_LED,HIGH);
    }
    else if(incomingMessage == "off"){
      Serial.println("off");
      digitalWrite(ONBOARD_LED,LOW);
    }
  }
  // led 2
    if (String(topic) == "esp32/output2") {
    Serial.print("Changing output to ");
    if(incomingMessage == "on"){
      Serial.println("on");
      digitalWrite(LED_2,HIGH);
    }
    else if(incomingMessage == "off"){
      Serial.println("off");
      digitalWrite(LED_2,LOW);
    }
  }
}

//======================================= publising as string
void publishMessage(const char* topic, String payload, boolean retained) {
  if (client.publish(topic, payload.c_str(), true))
    Serial.println("Message published ["+String(topic)+"]: "+payload);
}