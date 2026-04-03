export default defineAppConfig({
  pages: [
    'pages/welcome/index',
    'pages/search/index',
    'pages/series/index',
    'pages/lists/index',
    'pages/settings/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#F2EFE4',
    navigationBarTitleText: 'Planar Bridge',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F2EFE4',
    enablePullDownRefresh: false,
    homeButton: true,
  },
  tabBar: {
    color: '#A09A8C',
    selectedColor: '#9B8644',
    backgroundColor: '#F2EFE4',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/search/index',
        text: '搜索',
        iconPath: 'images/tab-search.png',
        selectedIconPath: 'images/tab-search-sel.png',
      },
      {
        pagePath: 'pages/series/index',
        text: '系列',
        iconPath: 'images/tab-series.png',
        selectedIconPath: 'images/tab-series-sel.png',
      },
      {
        pagePath: 'pages/lists/index',
        text: '收藏',
        iconPath: 'images/tab-lists.png',
        selectedIconPath: 'images/tab-lists-sel.png',
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置',
        iconPath: 'images/tab-settings.png',
        selectedIconPath: 'images/tab-settings-sel.png',
      },
    ],
  },
});
