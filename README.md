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
  "topic": "doorbell/ring",
  "enableDoorbell": true,
  "enableOccupancySensor": true
}
```

- `mqtt`: MQTT Broker address (required)
- `topic`: Subscribe topic (required)
- `enableDoorbell`: Register Doorbell service (default: true)
  - You can use the notification by HomePod
- `enableOccupancySensor`: Register OccupancySensor service (default: true)
  - You can use the automation etc
