'use strict';

var React = require('react-native');
var {
  AppRegistry,
  NavigatorIOS,
  StyleSheet,
} = React;

var SearchFlicker = require('./SearchFlicker');

/*
    Render the SearchFlicker component within a NavigatorIOS component
*/
var PhotosApp = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={styles.container}
        initialRoute={{
          title: 'Photos',
          component: SearchFlicker,
        }}/>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

AppRegistry.registerComponent('FlickerReact', () => PhotosApp);