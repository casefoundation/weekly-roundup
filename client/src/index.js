// React
import React from 'react';
import ReactDom from 'react-dom';

// Redux
import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import { Provider } from 'react-redux';

// Router
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerReducer as routing } from 'react-router-redux';

// Reducers
import Auth from './reducers/AuthReducer';
import Archive from './reducers/ArchiveReducer';
import Roundup from './reducers/RoundupReducer';
import Settings from './reducers/SettingsReducer';
import Users from './reducers/UsersReducer';

// Containers
import App from './containers/App';

// Bootstrap/dependencies & Styling
const jQuery = require('jquery');
window.$ = jQuery;
const Popper = require('popper.js');
window.Popper = Popper;
require('bootstrap');
require('bootstrap/dist/css/bootstrap.min.css');
require('font-awesome/css/font-awesome.min.css');
require('./lib/css/style.css'); 

// initialize store
const store = Redux.createStore(
  Redux.combineReducers({
    routing,
    Auth,
    Archive,
    Roundup,
    Settings,
    Users,
  }),
  Redux.applyMiddleware(ReduxThunk));

// Create an enhanced history that syncs navigation events with the store
const history = createHistory();

ReactDom.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'));
