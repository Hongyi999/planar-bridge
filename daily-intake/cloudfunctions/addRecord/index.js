var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function(event) {
  var wxContext = cloud.getWXContext();
  var data = event.data || {};

  try {
    var result = await db.collection('records').add({
      data: {
        category: data.category || '',
        title: data.title || '',
        note: data.note || '',
        rating: data.rating || 0,
        date: data.date || '',
        createTime: db.serverDate(),
        _openid: wxContext.OPENID
      }
    });

    return { code: 0, id: result._id };
  } catch (err) {
    console.error('添加记录失败', err);
    return { code: -1, message: '添加失败，请重试' };
  }
};
