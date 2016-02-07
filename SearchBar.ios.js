'use strict';

var React = require('react-native');
var {
  ActivityIndicatorIOS,
  TextInput,
  StyleSheet,
  View,
} = React;
var SearchBar = React.createClass({
  render: function() {
    return (
      <View style={styles.searchBar}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChange={this.props.onSearchChange}
          placeholder="Search for photos..."
          onFocus={this.props.onFocus}
          style={styles.searchBarInput}/>
        <ActivityIndicatorIOS
          animating={this.props.isLoading}
          style={styles.spinner}/>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  searchBar: {
    marginTop: 64,
    padding: 3,
    paddingLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBarInput: {
    fontSize: 15,
    flex: 1,
    height: 30,
  },
  spinner: {
    width: 30,
  },
});

module.exports = SearchBar;