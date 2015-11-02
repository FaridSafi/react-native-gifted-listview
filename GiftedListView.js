'use strict'

var React = require('react-native');

var {
  ListView,
  Platform,
  TouchableHighlight,
  View,
  Text
} = React;

// small helper function which merged two objects into one
function MergeRecursive(obj1, obj2) {
  for (var p in obj2) {
    try {
      if ( obj2[p].constructor==Object ) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch(e) {
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}

var GiftedSpinner = require('react-native-gifted-spinner');

var GiftedListView = React.createClass({
  
  getDefaultProps() {
    var customStyles = {
      separator: {
        height: 1,
        backgroundColor: '#CCC'
      },
      refreshableView: {
        height: 50,
        backgroundColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
      },
      actionsLabel: {
        fontSize: 20,
      },
      paginationView: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
      },
      defaultView: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      defaultViewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
      },
    };

    return {
      initialListSize: 10,
      firstLoader: true,
      pagination: true,
      refreshable: true,
      refreshableViewHeight: 50,
      refreshableDistance: 40,
      sectionHeaderView: null,
      withSections: false,
      onFetch(page, callback, options) { callback([]); },
      
      paginationFetchigView() {
        return (
          <View style={customStyles.paginationView}>
            <GiftedSpinner />
          </View>
        );
      },
      paginationAllLoadedView() {
        return (
          <View style={customStyles.paginationView}>
            <Text style={customStyles.actionsLabel}>
              ~
            </Text>
          </View>
        );
      },
      paginationWaitingView(paginateCallback) {
        return (
          <TouchableHighlight 
            underlayColor='#c8c7cc'
            onPress={paginateCallback}
            style={customStyles.paginationView}
          >
            <Text style={customStyles.actionsLabel}>
              +
            </Text>
          </TouchableHighlight>
        );
      },
      refreshableFetchingView() {
        return (
          <View style={customStyles.refreshableView}>
            <GiftedSpinner />
          </View>
        );
      },
      refreshableWillRefreshView() {
        return (
          <View style={customStyles.refreshableView}>
            <Text style={customStyles.actionsLabel}>
              ↻
            </Text>
          </View>
        );
      },
      refreshableWaitingView(refreshCallback) {
        if (Platform.OS !== 'android') {
          return (
            <View style={customStyles.refreshableView}>
              <Text style={customStyles.actionsLabel}>
                ↓
              </Text>
            </View>
          );
        } else {
          return (
            <TouchableHighlight 
              underlayColor='#c8c7cc'
              onPress={refreshCallback}
              style={customStyles.refreshableView}
            >
              <Text style={customStyles.actionsLabel}>
                ↻
              </Text>
            </TouchableHighlight>
          );
        }
      },
      emptyView(refreshCallback) {
        return (
          <View style={customStyles.defaultView}>
            <Text style={customStyles.defaultViewTitle}>
              Sorry, there is no content to display
            </Text>
        
            <TouchableHighlight 
              underlayColor='#c8c7cc'
              onPress={refreshCallback}
            >
              <Text>
                ↻
              </Text>
            </TouchableHighlight>
          </View>
        );
      },
      renderSeparator() {
        return (
          <View style={customStyles.separator} />
        );
      },
    };
  },
  
  _setY(y) { this._y = y; },
  _getY(y) { return this._y; },
  _setPage(page) { this._page = page; },
  _getPage() { return this._page; },
  _setRows(rows) { this._rows = rows; },
  _getRows() { return this._rows; },
  
  
  getInitialState() {

    if (this.props.refreshable === true && Platform.OS !== 'android') {
      this._setY(this.props.refreshableViewHeight);
    } else {
      this._setY(0);
    }

    this._setPage(1);
    this._setRows([]);

    var ds = null;
    if (this.props.withSections === true) {
      ds = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
        sectionHeaderHasChanged: (section1, section2) => section1 !== section2,
      });
      return {
        dataSource: ds.cloneWithRowsAndSections(this._getRows()),
        refreshStatus: 'waiting',
        paginationStatus: 'firstLoad',
      };
    } else {
      ds = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });   
      return {
        dataSource: ds.cloneWithRows(this._getRows()),
        refreshStatus: 'waiting',
        paginationStatus: 'firstLoad',
      };   
    }
  },

  componentDidMount() {
    this._scrollResponder = this.refs.listview.getScrollResponder();
    this.props.onFetch(this._getPage(), this._postRefresh, {firstLoad: true});
  },

  setNativeProps(props) {
    this.refs.listview.setNativeProps(props);
  },

  _refresh() {
    this._onRefresh({external: true});
  },
  
  _onRefresh(options = {}) {
    this._scrollResponder.scrollTo(0);
    this.setState({
      refreshStatus: 'fetching',
    });
    this._setPage(1);
    this.props.onFetch(this._getPage(), this._postRefresh, options);
  },
  
  _postRefresh(rows = [], options = {}) {
    this._updateRows(rows, options);
    if (this.props.refreshable === true) {
      // @issue
      // if a scrolling is already in progress, this scroll will not be executed
      this._scrollResponder.scrollTo(this.props.refreshableViewHeight);        
    }
  },
  
  _onPaginate() {
    this.setState({
      paginationStatus: 'fetching',
    });
    this.props.onFetch(this._getPage() + 1, this._postPaginate, {});
  },
  
  _postPaginate(rows = [], options = {}) {
    this._setPage(this._getPage() + 1);
    var mergedRows = null;
    if (this.props.withSections === true) {
      mergedRows = MergeRecursive(this._getRows(), rows);
    } else {
      mergedRows = this._getRows().concat(rows);
    }
    this._updateRows(mergedRows, options);
  },
  
  _updateRows(rows = [], options = {}) {
    this._setRows(rows);
    if (this.props.withSections === true) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRowsAndSections(rows),
        refreshStatus: 'waiting',
        paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
      });
    } else {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(rows),
        refreshStatus: 'waiting',
        paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
      });    
    }
  },
  
  _onResponderRelease() {
    if (this.props.refreshable === true) {
      if (Platform.OS !== 'android') {
        if (this.state.refreshStatus === 'willRefresh') {
          this._onRefresh();
        }
      }
    }
  },
  
  _onScroll(e) {
    this._setY(e.nativeEvent.contentOffset.y);
    if (this.props.refreshable === true) {
      if (Platform.OS !== 'android') {
        if (this._getY() < this.props.refreshableViewHeight - this.props.refreshableDistance 
        && this.state.refreshStatus === 'waiting'
        && this._scrollResponder.scrollResponderHandleScrollShouldSetResponder() === true
      ) {
          this.setState({
            refreshStatus: 'willRefresh',
          });
        }

      }
    }
  },
  
  _renderRefreshView() {
    switch (this.state.refreshStatus) {
      case 'fetching':
        return this.props.refreshableFetchingView();
        break;
      case 'willRefresh':
        return this.props.refreshableWillRefreshView();
        break;
      default:
        return this.props.refreshableWaitingView(this._onRefresh);
    }
  },
  
  _renderPaginationView() {
    if ((this.state.paginationStatus === 'fetching' && this.props.pagination === true) || (this.state.paginationStatus === 'firstLoad' && this.props.firstLoader === true)) {
      return this.props.paginationFetchigView();
    } else if (this.state.paginationStatus === 'waiting' && this.props.pagination === true && (this.props.withSections === true || this._getRows().length > 0)) {
      return this.props.paginationWaitingView(this._onPaginate);
    } else if (this.state.paginationStatus === 'allLoaded' && this.props.pagination === true) {
      return this.props.paginationAllLoadedView();
    } else if (this._getRows().length === 0) {
      return this.props.emptyView(this._onRefresh);
    } else {
      return null;
    }
  },

  _calculateContentInset() {
    if (this.props.refreshable === true && Platform.OS !== 'android') {
      return {top: -1 * this.props.refreshableViewHeight, bottom: 0, left: 0, right: 0};
    } else {
      return {top: 0, bottom: 0, left: 0, right: 0};
    }
  },
  
  _calculateContentOffset() {
    if (this.props.refreshable === true && Platform.OS !== 'android') {
      return {x: 0, y: this.props.refreshableViewHeight};
    } else {
      return {x: 0, y: 0};
    }
  },
  
  render() {
    return (
      <ListView
        ref="listview"
        dataSource={this.state.dataSource}
        renderRow={this.props.rowView}
        renderSectionHeader={this.props.sectionHeaderView}
        initialListSize={this.props.initialListSize}
        renderSeparator={this.props.renderSeparator}

        renderHeader={this.props.refreshable === true ? this._renderRefreshView : null}
        renderFooter={this._renderPaginationView}
        
        onScroll={this.props.refreshable === true ? this._onScroll : null}
        onResponderRelease={this.props.refreshable === true ? this._onResponderRelease : null}

        scrollEventThrottle={200}
        
        contentInset={this._calculateContentInset()}
        contentOffset={this._calculateContentOffset()}
        
        automaticallyAdjustContentInsets={false}
        scrollEnabled={true}
        canCancelContentTouches={true}
      />
    );
  },
});


module.exports = GiftedListView;
