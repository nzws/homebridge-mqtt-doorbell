import {
  API,
  HAP,
  Logging,
  AccessoryConfig,
  Service,
  Characteristic,
} from 'homebridge';
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
  private readonly Service: API['hap']['Service'];
  private readonly Characteristic: API['hap']['Characteristic'];

  private readonly informationService: Service;
  private readonly service: Service | undefined;
  private readonly sensorService: Service | undefined;

  private readonly stateCharacteristic: Characteristic | undefined;
  private readonly sensorStateCharacteristic: Characteristic | undefined;

  private readonly client: mqtt.MqttClient;
  private state = false;

  /**
   * REQUIRED - This is the entry point to your plugin
   */
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    const {
      mqtt: { host = 'localhost', port = 1883, username, password },
      topic: subscribeTopic,
      enableDoorbell = true,
      enableOccupancySensor = true,
    } = this.config;
    if (!enableDoorbell && !enableOccupancySensor) {
      throw new Error('At least one of doorbell or occupancy sensor must be enabled');
    }

    if (enableDoorbell) {
      this.service = new hap.Service.Doorbell(config.name);
      this.stateCharacteristic = this.service.getCharacteristic(
        this.Characteristic.ProgrammableSwitchEvent,
      );
    }

    if (enableOccupancySensor) {
      this.sensorService = new hap.Service.OccupancySensor(
        config.name + ' Sensor',
      );
      this.sensorStateCharacteristic = this.sensorService
        .getCharacteristic(this.Characteristic.OccupancyDetected)
        .onGet(this.handleOccupancyDetectedGet.bind(this));
    }

    this.informationService = new this.Service.AccessoryInformation()
      .setCharacteristic(this.Characteristic.Manufacturer, 'nzws.me')
      .setCharacteristic(this.Characteristic.Model, 'MQTT Doorbell')
      .setCharacteristic(this.Characteristic.SerialNumber, 'ho-me-br-id-ge');

    this.client = mqtt.connect(`mqtt://${host}:${port}`, {
      username,
      password,
    });

    this.client.subscribe(subscribeTopic);

    this.client.on('message', (topic, data) => {
      this.log.debug(topic);
      if (topic !== subscribeTopic) {
        return;
      }

      this.handleMessage(data.toString());
    });
  }

  /**
   * REQUIRED - This must return an array of the services you want to expose.
   * This method must be named "getServices".
   */
  getServices() {
    return [this.informationService, this.service, this.sensorService].filter(
      Boolean,
    ) as Service[];
  }

  private handleMessage(data: string) {
    this.log.debug('Received message:', data.toString());
    const isRinging = ['1', 'true', 'ring'].includes(data);
    this.state = isRinging;

    this.sensorStateCharacteristic?.updateValue(
      this.handleOccupancyDetectedGet(),
    );
    if (isRinging) {
      this.ring();
    }
  }

  private handleOccupancyDetectedGet() {
    const { OCCUPANCY_NOT_DETECTED, OCCUPANCY_DETECTED } =
      this.Characteristic.OccupancyDetected;
    return this.state ? OCCUPANCY_DETECTED : OCCUPANCY_NOT_DETECTED;
  }

  private ring() {
    this.log.info('Ring!');

    const { SINGLE_PRESS } = this.Characteristic.ProgrammableSwitchEvent;
    this.stateCharacteristic?.updateValue(SINGLE_PRESS);
  }
}
