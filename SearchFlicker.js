'use strict';

var React = require('react-native');
var {
  Image,
  ListView,
  Platform,
  StyleSheet,
  Text,
  View,
  AlertIOS,
} = React;

var TimerMixin = require('react-timer-mixin');
var dismissKeyboard = require('dismissKeyboard');
var invariant = require('invariant');


var PhotoCell = require('./PhotoCell');
var PhotoScreen = require('./PhotoScreen');

var SearchBar = require('./SearchBar');

var API_KEY = '266838cd5e79077a5532bb666585e0b2'; 

var API_URL = 
'https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&privacy_filter=1&safe_search=1&nojsoncallback=1';

var LOADING = {};

var resultsCache = {
  dataForQuery: {},
  nextPageNumberForQuery: {},
  totalForQuery: {},
};

var SearchFlicker = React.createClass({
  mixins: [TimerMixin],

  timeoutID: (null: any),

  getInitialState: function() {
    return {
      isLoading: false,
      isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      filter: '',
      loaded: false,
      queryNumber: 0,
    };
  },

  componentDidMount: function() {
    this.fetchData('');
  },
  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
    var apiKey = API_KEY;
    if (query) {
      var PAGE_SIZE = 30;
      var PARAMS = '&api_key=' + apiKey +  '&text=';
      return (
        API_URL + PARAMS + encodeURIComponent(query) + '&page=' + pageNumber
      );
    } 
  },
  fetchData: function(query: string) {
    this.timeoutID = null;

    this.setState({filter: query});

    var cachedResultsForQuery = resultsCache.dataForQuery[query];
    if (cachedResultsForQuery) {
      if (!LOADING[query]) {
        this.setState({
          dataSource: this.getDataSource(cachedResultsForQuery),
          isLoading: false
        });
      } else {
        this.setState({isLoading: true});
      }
      return;
    }
    LOADING[query] = true;
    resultsCache.dataForQuery[query] = null;
    this.setState({
      isLoading: true,
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: false,
    });

    fetch(this._urlForQueryAndPage(query, 1), {method: "GET"})
      .then((response) => response.json())
      .then((responseData) => {
        LOADING[query] = false;
        resultsCache.totalForQuery[query] = responseData.photos.total;
        resultsCache.dataForQuery[query] = responseData.photos.photo;
        resultsCache.nextPageNumberForQuery[query] = 2;
        
        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoading: false,
          dataSource: this.state.dataSource.cloneWithRows(responseData.photos.photo),
        });
      })
      .catch((error) => {
        LOADING[query] = false;
        resultsCache.dataForQuery[query] = undefined;

        this.setState({
          dataSource: this.getDataSource([]),
          isLoading: false,
        });
      })
      .done();
  },
  hasMore: function(): boolean {
    var query = this.state.filter;
    if (!resultsCache.dataForQuery[query]) {
      return true;
    }
    return (
      resultsCache.totalForQuery[query] !==
      resultsCache.dataForQuery[query].length
    );
  },

  onEndReached: function() {
    var query = this.state.filter;
    if (!this.hasMore() || this.state.isLoadingTail) {
      // We're already fetching or have all the elements so noop
      return;
    }

    if (LOADING[query]) {
      return;
    }

    LOADING[query] = true;
    this.setState({
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: true,
    });

    var page = resultsCache.nextPageNumberForQuery[query];
    invariant(page != null, 'Next page number for "%s" is missing', query);
    fetch(this._urlForQueryAndPage(query, page))
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);
        LOADING[query] = false;
        this.setState({
          isLoadingTail: false,
        });
      })
      .then((responseData) => {
        var photosForQuery = resultsCache.dataForQuery[query].slice();

        LOADING[query] = false;
        // We reached the end of the list before the expected number of results
        if (!responseData.photos.photo) {
          resultsCache.totalForQuery[query] = photosForQuery.length;
        } else {
          for (var i in responseData.photos) {
            photosForQuery.push(responseData.photos[i]);
          }
          resultsCache.dataForQuery[query] = photosForQuery;
          resultsCache.nextPageNumberForQuery[query] += 1;
        }

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoadingTail: false,
          dataSource: this.getDataSource(resultsCache.dataForQuery[query]),
        });
      })
      .done();
  },
  getDataSource: function(photos: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(photos);
  },
  onSearchChange: function(event: Object){
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.fetchData(filter), 100);
  },
  selectPhoto: function(photo: Object) {
    if (Platform.OS === 'ios') {
      this.props.navigator.push({
        title: photo.title,
        component: PhotoScreen,
        passProps: {photo},
      });
    } else {
      dismissKeyboard();
      this.props.navigator.push({
        title: photo.title,
        name: 'photo',
        photo: photo,
      });
    }
  },
  renderSeparator: function(
    sectionID: number | string,
    rowID: number | string,
    adjacentRowHighlighted: boolean
  ) {
    var style = styles.rowSeparator;
    if (adjacentRowHighlighted) {
        style = [style, styles.rowSeparatorHide];
    }
    return (
      <View key={'SEP_' + sectionID + '_' + rowID}  style={style}/>
    );
  },
  renderRow: function(
    photo: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <PhotoCell
        key={photo.id}
        onSelect={() => this.selectPhoto(photo)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        photo={photo}/>
    );
  },
  render: function() {
    var content = this.state.dataSource.getRowCount() === 0 ?
      <NoPhotos
        filter={this.state.filter}
        isLoading={this.state.isLoading}/> 
        :
      <ListView
        ref="listView"
        renderSeperator={this.renderSeperator}
        contentContainerStyle={styles.list}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        automaticallyAdjustContentsInsets={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps={true}
        showsVerticalScrollIndicator={false}/>;
    return (
      <View style={styles.container}>
        <SearchBar
          onSearchChange={this.onSearchChange}
          isLoading={this.state.isLoading}
          onFocus={() =>
            this.refs.listview && this.refs.listview.getScrollResponder().scrollTo({ x: 0, y: 0 })}/>
        <View style={styles.separator} />
        {content}
      </View>
    );
  },

  renderLoadingView: function() {
    return (
      <View style={styles.container}>
        <Text>
          Loading photos...
        </Text>
      </View>
    );
  },
  
});

var NoPhotos = React.createClass({
  render: function() {
    var text = '';
    if (this.props.filter) {
      text = `No results for "${this.props.filter}"`;
    } else if (!this.props.isLoading) {
      text = 'No photos found';
    }

    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.noPhotosText}>{text}</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  centerText: {
    alignItems: 'center',
  },
  noPhotosText: {
    marginTop: 80,
    color: '#888888',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  scrollSpinner: {
    marginVertical: 20,
  },
  rowSeparator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1,
    marginLeft: 4,
  },
  rowSeparatorHide: {
    opacity: 0.0,
  },
});

module.exports = SearchFlicker;