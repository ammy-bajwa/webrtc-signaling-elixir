import { createStore } from 'redux'
import combineReducers from './reducers/index'

export default createStore(combineReducers);