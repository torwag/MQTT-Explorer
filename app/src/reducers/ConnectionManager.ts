import { Action } from 'redux'
import { ConnectionOptions } from '../model/ConnectionOptions'
import { createReducer } from './lib'

export interface ConnectionManagerState {
  connections: {[s:string]: ConnectionOptions},
  selected?: string
  showAdvancedSettings: boolean
}

const initialState: ConnectionManagerState = {
  connections: {},
  selected: undefined,
  showAdvancedSettings: false,
}

export type Action = SetConnections | SelectConnection | UpdateConnection | AddConnection | DeleteConnection | ToggleAdvancedSettings | DeleteSubscription | AddSubscription

export enum ActionTypes {
  CONNECTION_MANAGER_SET_CONNECTIONS = 'CONNECTION_MANAGER_SET_CONNECTIONS',
  CONNECTION_MANAGER_SELECT_CONNECTION = 'CONNECTION_MANAGER_SELECT_CONNECTION',
  CONNECTION_MANAGER_UPDATE_CONNECTION = 'CONNECTION_MANAGER_UPDATE_CONNECTION',
  CONNECTION_MANAGER_ADD_CONNECTION = 'CONNECTION_MANAGER_ADD_CONNECTION',
  CONNECTION_MANAGER_DELETE_CONNECTION = 'CONNECTION_MANAGER_DELETE_CONNECTION',
  CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS = 'CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS',
  CONNECTION_MANAGER_ADD_SUBSCRIPTION = 'CONNECTION_MANAGER_ADD_SUBSCRIPTION',
  CONNECTION_MANAGER_DELETE_SUBSCRIPTION = 'CONNECTION_MANAGER_DELETE_SUBSCRIPTION',
}

export interface SetConnections {
  type: ActionTypes.CONNECTION_MANAGER_SET_CONNECTIONS
  connections: {[s:string]: ConnectionOptions}
}

export interface SelectConnection {
  type: ActionTypes.CONNECTION_MANAGER_SELECT_CONNECTION
  selected: string
}

export interface AddSubscription {
  type: ActionTypes.CONNECTION_MANAGER_ADD_SUBSCRIPTION
  subscription: string
  connectionId: string
}

export interface DeleteSubscription {
  type: ActionTypes.CONNECTION_MANAGER_DELETE_SUBSCRIPTION
  subscription: string
  connectionId: string
}

export interface UpdateConnection {
  type: ActionTypes.CONNECTION_MANAGER_UPDATE_CONNECTION
  connectionId: string
  changeSet: any
}

export interface AddConnection {
  type: ActionTypes.CONNECTION_MANAGER_ADD_CONNECTION
  connection: ConnectionOptions
}

export interface DeleteConnection {
  type: ActionTypes.CONNECTION_MANAGER_DELETE_CONNECTION
  connectionId: string
}

export interface ToggleAdvancedSettings {
  type: ActionTypes.CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS
}

export const connectionManagerReducer = createReducer(initialState, {
  CONNECTION_MANAGER_SET_CONNECTIONS: setConnections,
  CONNECTION_MANAGER_SELECT_CONNECTION: selectConnection,
  CONNECTION_MANAGER_UPDATE_CONNECTION: updateConnection,
  CONNECTION_MANAGER_ADD_CONNECTION: addConnection,
  CONNECTION_MANAGER_DELETE_CONNECTION: deleteConnection,
  CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS: toggleAdvancedSettings,
  CONNECTION_MANAGER_DELETE_SUBSCRIPTION: deleteSubscription,
  CONNECTION_MANAGER_ADD_SUBSCRIPTION: addSubscription,
})

function setConnections(state: ConnectionManagerState, action: SetConnections): ConnectionManagerState {
  return {
    ...state,
    connections: action.connections,
  }
}

function selectConnection(state: ConnectionManagerState, action: SelectConnection): ConnectionManagerState {
  return {
    ...state,
    selected: action.selected,
  }
}

function toggleAdvancedSettings(state: ConnectionManagerState, action: ToggleAdvancedSettings): ConnectionManagerState {
  return {
    ...state,
    showAdvancedSettings: !state.showAdvancedSettings,
  }
}

function addConnection(state: ConnectionManagerState, action: AddConnection): ConnectionManagerState {
  return {
    ...state,
    connections: {
      ...state.connections,
      [action.connection.id]: action.connection,
    },
  }
}

function addSubscription(state: ConnectionManagerState, action: AddSubscription): ConnectionManagerState {
  const connection = state.connections[action.connectionId]
  const alreadyExists = connection.subscriptions.indexOf(action.subscription) !== -1
  if (alreadyExists) {
    return state
  }

  const newSubscriptions = connection.subscriptions.slice()
  newSubscriptions.push(action.subscription)
  return {
    ...state,
    connections: {
      ...state.connections,
      [action.connectionId]: {
        ...connection,
        subscriptions: newSubscriptions,
      },
    },
  }
}

function deleteSubscription(state: ConnectionManagerState, action: AddSubscription): ConnectionManagerState {
  const connection = state.connections[action.connectionId]
  const newSubscriptions = connection.subscriptions.filter(s => s !== action.subscription)

  return {
    ...state,
    connections: {
      ...state.connections,
      [action.connectionId]: {
        ...connection,
        subscriptions: newSubscriptions,
      },
    },
  }
}

function deleteConnection(state: ConnectionManagerState, action: DeleteConnection): ConnectionManagerState {
  const connections = { ...state.connections }
  delete connections[action.connectionId]

  return {
    ...state,
    connections,
  }
}

function updateConnection(state: ConnectionManagerState, action: UpdateConnection): ConnectionManagerState {
  let connection = state.connections[action.connectionId]
  connection = {
    ...connection,
    ...action.changeSet,
  }
  return {
    ...state,
    connections: {
      ...state.connections,
      [action.connectionId]: connection,
    },
  }
}
