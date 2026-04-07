var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function(event) {
  var wxContext = cloud.getWXContext();
  var openid = wxContext.OPENID;
  var userInfo = event.userInfo || {};

  try {
    // 查找是否已存在用户记录
    var existing = await db.collection('users').where({ _openid: openid }).get();

    if (existing.data.length > 0) {
      // 更新用户信息
      await db.collection('users').doc(existing.data[0]._id).update({
        data: {
          nickName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
          lastLogin: db.serverDate()
        }
      });
    } else {
      // 创建用户记录
      await db.collection('users').add({
        data: {
          _openid: openid,
          nickName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
          createTime: db.serverDate(),
          lastLogin: db.serverDate()
        }
      });
    }

    return { code: 0, openid: openid };
  } catch (err) {
    console.error('登录处理失败', err);
    return { code: -1, message: '登录失败' };
  }
};
