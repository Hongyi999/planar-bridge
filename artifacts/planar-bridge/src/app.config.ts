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
      },
      {
        pagePath: 'pages/series/index',
        text: '系列',
      },
      {
        pagePath: 'pages/lists/index',
        text: '收藏',
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置',
      },
    ],
  },
  animation: true,
});
