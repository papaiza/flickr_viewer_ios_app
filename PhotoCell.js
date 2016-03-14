'use strict';

var React = require('react-native');
var {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View
} = React;

var getImageSource = require('./getImageSource');

/*
    Create touchable elements that display the image in a grid view. 
    When the image is pressed, the app is directed to the PhotoScreen page,
    which displays the image larger and includes the title. 
*/
var PhotoCell = React.createClass({
  render: function() {
    var title = this.props.photo.title;
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
      TouchableElement = TouchableNativeFeedback;
    }
    return (
      <View style={styles.container}>
        <TouchableElement
          onPress={this.props.onSelect}
          onShowUnderlay={this.props.onHighlight}
          onHideUnderlay={this.props.onUnhighlight}>
          <Image
            source={getImageSource(this.props.photo)}
            style={styles.cellImage}/>
        </TouchableElement>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flexDirection:'row',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  cellImage: {
    backgroundColor: '#dddddd',
    height: 200,
    margin: 5,
    width: 150,
    flex: 1,
  },
  cellBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: StyleSheet.hairlineWidth,
    marginLeft: 4,
  },
});

module.exports = PhotoCell;