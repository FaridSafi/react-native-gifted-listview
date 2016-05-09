
import React, { Component } from 'react';
import {
    ListView,
    Platform,
    TouchableHighlight,
    View,
    Text,
    RefreshControl,
    StyleSheet,
} from 'react-native';

import GiftedSpinner from 'react-native-gifted-spinner';

export default class GiftedListView extends Component {

  static propTypes = {
    customStyles: React.PropTypes.object,
    initialListSize: React.PropTypes.number,
    firstLoader: React.PropTypes.bool,
    pagination: React.PropTypes.bool,
    refreshable: React.PropTypes.bool,
    refreshableColors: React.PropTypes.array,
    refreshableProgressBackgroundColor: React.PropTypes.string,
    refreshableSize: React.PropTypes.string,
    refreshableTitle: React.PropTypes.string,
    refreshableTintColor: React.PropTypes.string,
    renderRefreshControl: React.PropTypes.func,
    headerView: React.PropTypes.func,
    sectionHeaderView: React.PropTypes.func,
    scrollEnabled: React.PropTypes.bool,
    withSections: React.PropTypes.bool,
    onFetch: React.PropTypes.func,

    paginationFetchingView: React.PropTypes.func,
    paginationAllLoadedView: React.PropTypes.func,
    paginationWaitingView: React.PropTypes.func,
    emptyView: React.PropTypes.func,
    renderSeparator: React.PropTypes.func,
  };

  static defaultProps = {
    customStyles: {},
    initialListSize: 10,
    firstLoader: true,
    pagination: true,
    refreshable: true,
    refreshableColors: undefined,
    refreshableProgressBackgroundColor: undefined,
    refreshableSize: undefined,
    refreshableTitle: undefined,
    refreshableTintColor: undefined,
    renderRefreshControl: null,
    headerView: null,
    sectionHeaderView: null,
    scrollEnabled: true,
    withSections: false,
    onFetch(page, callback, options) { callback([]); },

    paginationFetchingView: null,
    paginationAllLoadedView: null,
    paginationWaitingView: null,
    emptyView: null,
    renderSeparator: null,
  };

  state = {
    page: 1,
    rows: [],
    dataSource: {},
    isRefreshing: false,
    paginationStatus: 'firstLoad',
  };

  componentWillMount() {
    let dataSource = null;
    if (this.props.withSections === true) {
      dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
        sectionHeaderHasChanged: (section1, section2) => section1 !== section2,
      });
    } else {
      dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });
    }

    this.setState({dataSource});
  }

  componentDidMount() {
    this.props.onFetch(this.state.page, this._postRefresh, {firstLoad: true});
  }

  paginationFetchingView = () => {
    if (this.props.paginationFetchingView) {
      return this.props.paginationFetchingView();
    }

    return (
      <View style={[defaultStyles.paginationView, this.props.customStyles.paginationView]}>
        <GiftedSpinner />
      </View>
    );
  }

  paginationAllLoadedView() {
    if (this.props.paginationAllLoadedView) {
      return this.props.paginationAllLoadedView();
    }

    return (
      <View style={[defaultStyles.paginationView, this.props.customStyles.paginationView]}>
        <Text style={[defaultStyles.actionsLabel, this.props.customStyles.actionsLabel]}>
          ~
        </Text>
      </View>
    );
  }

  paginationWaitingView(paginateCallback) {
    if (this.props.paginationWaitingView) {
      return this.props.paginationWaitingView(paginateCallback);
    }

    return (
      <TouchableHighlight
        underlayColor='#c8c7cc'
        onPress={paginateCallback}
        style={[defaultStyles.paginationView, this.props.customStyles.paginationView]}
      >
        <Text style={[defaultStyles.actionsLabel, this.props.customStyles.actionsLabel]}>
          Load more
        </Text>
      </TouchableHighlight>
    );
  }

  headerView = () => {
    if (this.state.paginationStatus === 'firstLoad' || !this.props.headerView){
      return null;
    }
    return this.props.headerView();
  }

  emptyView(refreshCallback) {
    if (this.props.emptyView) {
      return this.props.emptyView(refreshCallback);
    }

    return (
      <View style={[defaultStyles.defaultView, this.props.customStyles.defaultView]}>
        <Text style={[defaultStyles.defaultViewTitle, this.props.customStyles.defaultViewTitle]}>
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
  }

  renderSeparator = () => {
    if (this.props.renderSeparator) {
      return this.props.renderSeparator();
    }

    return (
      <View style={[defaultStyles.separator, this.props.customStyles.separator]} />
    );
  }

  setNativeProps(props) {
    this.refs.listview.setNativeProps(props);
  }

  _refresh() {
    this._onRefresh({external: true});
  }

  _onRefresh = (options = {}) => {
    this.setState({
      isRefreshing: true,
    });
    this.setState({page: 1});
    this.props.onFetch(this.state.page, this._postRefresh, options);

  }

  _postRefresh = (rows = [], options = {}) => {
    this._updateRows(rows, options);
  }

  _onPaginate = () => {
    if(this.state.paginationStatus==='allLoaded'){
      return null
    }else {
      this.setState({
        paginationStatus: 'fetching',
      });
      this.props.onFetch(this.state.page + 1, this._postPaginate, {});
    }
  }

  _postPaginate = (rows = [], options = {}) => {
    this.setState({page: (this.state.page + 1)});
    var mergedRows = null;
    if (this.props.withSections === true) {
      mergedRows = MergeRecursive(this.state.rows, rows);
    } else {
      mergedRows = this.state.rows.concat(rows);
    }
    this._updateRows(mergedRows, options);
  }

  _updateRows(rows = [], options = {}) {
    if (rows !== null) {
      this.setState({rows});
      if (this.props.withSections === true) {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRowsAndSections(rows),
          isRefreshing: false,
          paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
        });
      } else {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(rows),
          isRefreshing: false,
          paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
        });
      }
    } else {
      this.setState({
        isRefreshing: false,
        paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
      });
    }
  }

  _renderPaginationView = () => {
    if ((this.state.paginationStatus === 'fetching' && this.props.pagination === true) || (this.state.paginationStatus === 'firstLoad' && this.props.firstLoader === true)) {
      return this.paginationFetchingView();
    } else if (this.state.paginationStatus === 'waiting' && this.props.pagination === true && (this.props.withSections === true || this.state.rows.length > 0)) {
      return this.paginationWaitingView(this._onPaginate);
    } else if (this.state.paginationStatus === 'allLoaded' && this.props.pagination === true) {
      return this.paginationAllLoadedView();
    } else if (this.state.rows.length === 0) {
      return this.emptyView(this._onRefresh);
    } else {
      return null;
    }
  }

  renderRefreshControl() {
    if (this.props.renderRefreshControl) {
      return this.props.renderRefreshControl({ onRefresh: this._onRefresh });
    }
    return (
      <RefreshControl
        onRefresh={this._onRefresh}
        refreshing={this.state.isRefreshing}
        colors={this.props.refreshableColors}
        progressBackgroundColor={this.props.refreshableProgressBackgroundColor}
        size={this.props.refreshableSize}
        tintColor={this.props.refreshableTintColor}
        title={this.props.refreshableTitle}
      />
    );
  }

  render() {
    return (
      <ListView
        ref="listview"
        dataSource={this.state.dataSource}
        renderRow={this.props.rowView}
        renderSectionHeader={this.props.sectionHeaderView}
        renderHeader={this.headerView}
        renderFooter={this._renderPaginationView}
        renderSeparator={this.renderSeparator}

        automaticallyAdjustContentInsets={false}
        scrollEnabled={this.props.scrollEnabled}
        canCancelContentTouches={true}
        refreshControl={this.props.refreshable === true ? this.renderRefreshControl() : null}

        {...this.props}

        style={this.props.style}
      />
    );
  }

}

const defaultStyles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#CCC'
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
});


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
