export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/profile/index',
    'pages/observe/index',
    'pages/report/index',
    'pages/advice/index',
    'pages/form/index',
    'pages/record/index',
    'pages/report-detail/index',
    'pages/bind/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4A90D9',
    navigationBarTitleText: '同床共梦',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F8FAFF'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#4A90D9',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/profile/index',
        text: '双人档案'
      },
      {
        pagePath: 'pages/observe/index',
        text: '各自观察'
      },
      {
        pagePath: 'pages/report/index',
        text: '合并报告'
      },
      {
        pagePath: 'pages/advice/index',
        text: '建议中心'
      }
    ]
  }
})
