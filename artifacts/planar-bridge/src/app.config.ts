export default defineAppConfig({
  pages: [
    'pages/welcome/index',
    'pages/search/index',
    'pages/lists/index',
    'pages/settings/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0A0A0C',
    navigationBarTitleText: 'PlanarBridge',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0A0A0C',
    enablePullDownRefresh: false,
  },
  tabBar: {
    custom: false,
    color: '#8E8E93',
    selectedColor: '#E8A838',
    backgroundColor: '#141418',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/search/index',
        text: 'Search',
      },
      {
        pagePath: 'pages/lists/index',
        text: 'Lists',
      },
      {
        pagePath: 'pages/settings/index',
        text: 'Settings',
      },
    ],
  },
  animation: true,
});
