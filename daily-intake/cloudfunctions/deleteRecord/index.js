var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function(event) {
  var id = event.id;

  try {
    await db.collection('records').doc(id).remove();
    return { code: 0 };
  } catch (err) {
    console.error('删除记录失败', err);
    return { code: -1, message: '删除失败，请重试' };
  }
};
