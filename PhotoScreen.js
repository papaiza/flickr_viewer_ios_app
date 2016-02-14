'use strict';

var React = require('react-native');
var {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} = React;

var getImageSource = require('./getImageSource');

var PhotoScreen = React.createClass({
  render: function() {
    return (
      <ScrollView>
        <View >
          {/* $FlowIssue #7363964 - There's a bug in Flow where you cannot
            * omit a property or set it to undefined if it's inside a shape,
            * even if it isn't required */}
          <Image
            source={getImageSource(this.props.photo)}
            style={styles.detailsImage}/>
          <Text style={styles.PhotoTitle}>{this.props.photo.title}</Text>
        </View>
        <View style={styles.separator} />
      </ScrollView>
    );
  },
});

var styles = StyleSheet.create({
  rightPane: {
    justifyContent: 'space-between',
    flex: 1,
  },
  PhotoTitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 30,
    alignItems: 'center',
    fontWeight: '500',
  },
  mainSection: {
    flexDirection: 'row',
  },
  detailsImage: {
    flex: 1,
    width: 400,
    height: 425,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    backgroundColor: '#eaeaea',
  },
  separator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
});

module.exports = PhotoScreen;