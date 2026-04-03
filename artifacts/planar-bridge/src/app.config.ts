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
  animation: true,
});
