import {
  AddMqttConnection,
  EventDispatcher,
  MqttMessage,
  addMqttConnectionEvent,
  backendEvents,
  checkForUpdates,
  makeConnectionMessageEvent,
  makeConnectionStateEvent,
  makePublishEvent,
  removeConnection,
  updateAvailable,
} from '../../events'

import { DataSource, MqttSource } from './DataSource'
import { UpdateInfo } from 'builder-util-runtime'

export class ConnectionManager {
  private connections: {[s: string]: DataSource<any>} = {}

  public manageConnections() {
    backendEvents.subscribe(addMqttConnectionEvent, this.handleConnectionRequest)
    backendEvents.subscribe(removeConnection, (connectionId: string) => {
      this.removeConnection(connectionId)
    })
  }

  private handleConnectionRequest = (event: AddMqttConnection) => {
    const connectionId = event.id

    // Prevent double connections when reloading
    if (this.connections[connectionId]) {
      this.removeConnection(connectionId)
    }

    const options = event.options
    const connection = new MqttSource()
    this.connections[connectionId] = connection

    const connectionStateEvent = makeConnectionStateEvent(connectionId)
    connection.stateMachine.onUpdate.subscribe((state) => {
      backendEvents.emit(connectionStateEvent, state)
    })

    connection.connect(options)
    this.handleNewMessagesForConnection(connectionId, connection)
    backendEvents.subscribe(makePublishEvent(connectionId), (msg: MqttMessage) => {
      this.connections[connectionId].publish(msg)
    })
  }

  private handleNewMessagesForConnection(connectionId: string, connection: MqttSource) {
    const messageEvent = makeConnectionMessageEvent(connectionId)
    connection.onMessage((topic: string, payload: Buffer, packet: any) => {
      let buffer = payload
      if (buffer.length > 10000) {
        buffer = buffer.slice(0, 10000)
      }

      backendEvents.emit(messageEvent, { topic, payload: buffer.toString(), qos: packet.qos, retain: packet.retain })
    })
  }

  public removeConnection(conenctionId: string) {
    const connection = this.connections[conenctionId]
    if (connection) {
      backendEvents.unsubscribeAll(makePublishEvent(conenctionId))
      connection.disconnect()
      delete this.connections[conenctionId]
      connection.stateMachine.onUpdate.removeAllListeners()
    }
  }

  public closeAllConnections() {
    Object.keys(this.connections)
      .forEach(conenctionId => this.removeConnection(conenctionId))
  }
}

class UpdateNotifier {
  public onCheckUpdateRequest = new EventDispatcher<void, UpdateNotifier>(this)
  constructor() {
    backendEvents.subscribe(checkForUpdates, () => {
      this.onCheckUpdateRequest.dispatch()
    })
  }
  public notify(updateInfo: UpdateInfo) {
    backendEvents.emit(updateAvailable, updateInfo)
  }
}

export const updateNotifier = new UpdateNotifier()
