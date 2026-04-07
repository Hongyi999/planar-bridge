/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
  var d = date || new Date();
  var year = d.getFullYear();
  var month = ('0' + (d.getMonth() + 1)).slice(-2);
  var day = ('0' + d.getDate()).slice(-2);
  return year + '-' + month + '-' + day;
}

/**
 * 格式化日期为中文显示 x月x日 周x
 */
function formatDateCN(dateStr) {
  var d = new Date(dateStr.replace(/-/g, '/'));
  var weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var weekDay = weekDays[d.getDay()];
  return month + '月' + day + '日 周' + weekDay;
}

/**
 * 判断是否是今天
 */
function isToday(dateStr) {
  return dateStr === formatDate(new Date());
}

/**
 * 分类配置
 */
var categories = [
  { key: 'podcast', name: '播客', icon: '🎙️', color: '#722ed1' },
  { key: 'video', name: '视频', icon: '📺', color: '#eb2f96' },
  { key: 'movie', name: '电影', icon: '🎬', color: '#1890ff' },
  { key: 'book', name: '书籍', icon: '📚', color: '#52c41a' },
  { key: 'idea', name: '想法', icon: '💡', color: '#faad14' }
];

/**
 * 根据 key 获取分类信息
 */
function getCategoryByKey(key) {
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].key === key) return categories[i];
  }
  return { key: key, name: key, icon: '📌', color: '#999999' };
}

module.exports = {
  formatDate: formatDate,
  formatDateCN: formatDateCN,
  isToday: isToday,
  categories: categories,
  getCategoryByKey: getCategoryByKey
};
