var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function(event) {
  var id = event.id;
  var data = event.data || {};

  try {
    await db.collection('records').doc(id).update({
      data: {
        category: data.category,
        title: data.title,
        note: data.note,
        rating: data.rating,
        updateTime: db.serverDate()
      }
    });

    return { code: 0 };
  } catch (err) {
    console.error('更新记录失败', err);
    return { code: -1, message: '更新失败，请重试' };
  }
};
