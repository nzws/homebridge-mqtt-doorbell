import { API, HAP, Logging, AccessoryConfig, Service, Characteristic } from 'homebridge';
import mqtt from 'mqtt';

let hap: HAP;

export = (api: API) => {
  hap = api.hap;
  api.registerAccessory('MQTTDoorbell', MQTTDoorbell);
};

class MQTTDoorbell {
  private readonly log: Logging;
  private readonly config: AccessoryConfig;
  private readonly api: API;
  private readonly Service;
  private readonly Characteristic;

  private readonly stateCharacteristic: Characteristic;
  private readonly informationService: Service;
  private readonly service: Service;

  private readonly client: mqtt.MqttClient;

  /**
   * REQUIRED - This is the entry point to your plugin
   */
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    this.service = new hap.Service.Doorbell(config.name);

    this.stateCharacteristic = this.service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent);

    this.informationService = new this.Service.AccessoryInformation()
      .setCharacteristic(this.Characteristic.Manufacturer, 'nzws.me')
      .setCharacteristic(this.Characteristic.Model, 'MQTT Doorbell')
      .setCharacteristic(this.Characteristic.SerialNumber, 'ho-me-br-id-ge');

    const { mqtt: { host = 'localhost', port = 1883, username, password }, topic: subscribeTopic } = this.config;
    this.client = mqtt.connect(`mqtt://${host}:${port}`, {
      username,
      password,
    });

    this.client.subscribe(subscribeTopic);

    this.client.on('message', topic => {
      this.log.debug(topic);
      if (topic === subscribeTopic) {
        this.ring();
      }
    });
  }

  /**
   * REQUIRED - This must return an array of the services you want to expose.
   * This method must be named "getServices".
   */
  getServices() {
    return [this.informationService, this.service];
  }

  ring() {
    this.log.info('Ring!');

    this.stateCharacteristic.setValue(1);
  }
}
