/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} = React;


var GiftedListView = require('react-native-gifted-listview');
var GiftedSpinner = require('react-native-gifted-spinner');

var Example = React.createClass({
  
  _getRowView(rowData) {
    return (
      <TouchableHighlight style={styles.row} underlayColor='#c8c7cc'>
        <Text>{rowData}</Text>
      </TouchableHighlight>
    );
  },

  
  // to move to index.js
  _getWaitRefreshView() {
    return (
      <View
        style={customStyles.refreshView}
      >
        <Text>
          Touch/Pull to refresh
        </Text>
      </View>
    );
  },

  // to move to index.js
  _getWillRefreshView() {
    return (
      <View
        style={customStyles.refreshView}
      >
        <Text>
          Will refresh
        </Text>
      </View>
    );
  },

  // to move to index.js
  _getRefreshingView() {
    return (
      <View
        style={customStyles.refreshView}
      >
        <GiftedSpinner />
      </View>
    );
  },
  
  _onFetch(page = 1, callback) {
    setTimeout(() => {

      var rows = ['row 1', 'row 2', 'row 3']
      callback(rows);
    }, 1000);
  },
  
  _getPaginationView() {
    return (
      <View>
        <Text>
          Load more
        </Text>
      </View>
    );
  },

  _getEmptyView() {
    // should include refresh button
  },
  
  _getErrorView() {
    
  },
  
  _getNetworkErrorView() {
    
  },
  
  _getSeparatorView() {
    return (
      <View style={customStyles.separator} />
    );
  },
  
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.navBar} />
        <GiftedListView
          ref='glistview'
      
          rowView={this._getRowView}
          
          // number of minimum rows displayable
          initialListSize={12} // mandatory
          
          // all views optional
      
          pagination={true}
          paginationView={this._getPaginationView}
          
          pullToRefresh={true}
          refreshingView={this._getRefreshingView}
          willRefreshView={this._getWillRefreshView}
          waitRefreshView={this._getWaitRefreshView}
          
          refreshViewHeight={50} // mandatory
          
          progressBar={true}
          progressBarStyle={{
            fillColor: '#FF0000',
            backgroundColor: '#AA0000',
          }}
          
          emptyView={this._getEmptyView}

          errorView={this._getErrorView}

          NetworkErrorView={this._getNetworkErrorView}
          
          renderSeparator={this._getSeparatorView}
          
          onFetch={this._onFetch}
          // url stuffs
        />
      </View>
    );
  }
});


var customStyles = {
  separator: {
    height: 1,
    backgroundColor: '#CCC'
  },
  refreshView: {
    height: 50,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',    
  }
};

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

module.exports = Example;
