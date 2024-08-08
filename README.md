# @nzws/homebridge-mqtt-doorbell

## Install

```
npm install --global @nzws/homebridge-mqtt-doorbell
```

## Config

```json
{
  "accessory": "MQTTDoorbell",
  "name": "Doorbell",
  "mqtt": {
    "host": "localhost",
    "port": 1883,
    "username": "",
    "password": ""
  },
  "topic": "doorbell/ring"
}
```

- `mqtt`: MQTT Broker address.
- `topic`: Subscribe topic
