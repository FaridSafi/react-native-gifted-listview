# react-native-gifted-listview

A ListView that embed some recurrents features like pull-to-refresh, infinite scrolling and more for Android and iOS React-Native apps


![](https://raw.githubusercontent.com/FaridSafi/react-native-gifted-listview/master/Captures/ios_refresh_page_demo.gif)
![](https://raw.githubusercontent.com/FaridSafi/react-native-gifted-listview/master/Captures/android_refresh_page_demo.gif)


### Simple example


```js
var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Platform
} = React;

var GiftedListView = require('react-native-gifted-listview');

var Example = React.createClass({
  
  /**
   * Will be called when refreshing
   * Should be replaced by your own logic
   * @param {number} page Requested page to fetch
   * @param {function} callback Should pass the rows
   */
  _onFetch(page = 1, callback) {
    setTimeout(() => {
      var rows = ['row '+((page - 1) * 3 + 1), 'row '+((page - 1) * 3 + 2), 'row '+((page - 1) * 3 + 3)];
      if (page === 3) {
        callback(rows, {
          allLoaded: true, // the end of the list is reached
        });        
      } else {
        callback(rows);
      }
    }, 1000); // simulating network fetching
  },
  
  
  /**
   * When a row is touched
   * @param {object} rowData Row data
   */
  _onPress(rowData) {
    console.log(rowData+' pressed');
  },
  
  /**
   * Render a row
   * @param {object} rowData Row data
   */
  _renderRowView(rowData) {
    return (
      <TouchableHighlight 
        style={styles.row} 
        underlayColor='#c8c7cc'
        onPress={() => this._onPress(rowData)}
      >  
        <Text>{rowData}</Text>
      </TouchableHighlight>
    );
  },
  
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.navBar} />
        <GiftedListView
          rowView={this._renderRowView}
          onFetch={this._onFetch}
          firstLoader={true} // display a loader for the first fetching
          pagination={true} // enable infinite scrolling using touch to load more
          refreshable={true} // enable pull-to-refresh for iOS and touch-to-refresh for Android
        />
      </View>
    );
  }
});

var styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  navBar: {
    height: 64,
    backgroundColor: '#CCC'
  },
  row: {
    padding: 10,
    height: 44,
  },
};
```


### Advanced example

[See Examples/example_advanced.js](Examples/example_advanced.js)


### Installation

```npm install react-native-gifted-listview --save```


### Features
- [x] Pull-to-refresh in iOS
- [x] Touch-to-refresh in Android
- [x] Infinite scrolling using touch to load more
- [x] Loader for first display
- [x] Default view when no content to display
- [ ] Pull-to-refresh in Android (tried to implement it but it seems that onResponderRelease event is not yet catchable in Android ListView - React-Native 0.13.2)



### License

[MIT](LICENSE.md)


Feel free to ask me questions on Twitter [@FaridSafi](https://www.twitter.com/FaridSafi) !

