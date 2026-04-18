/**
 * admin.js — 管理员身份校验工具
 *
 * 使用方法：
 *   var admin = require('../../utils/admin.js');
 *   admin.getAuthInfo().then(function(info) {
 *     if (info.isAdmin) { ... }
 *   });
 */

// 页面内存缓存，避免重复 RPC
var _cache = null;
var _inflight = null;

/**
 * 获取当前用户身份信息（带缓存）
 * 返回：{ openid, isAdmin, bootstrapMode }
 */
function getAuthInfo() {
  if (_cache) return Promise.resolve(_cache);
  if (_inflight) return _inflight;

  _inflight = new Promise(function(resolve) {
    wx.cloud.callFunction({
      name: 'login',
      success: function(res) {
        var r = (res && res.result) || {};
        _cache = {
          openid: r.openid || '',
          isAdmin: !!r.isAdmin,
          bootstrapMode: !!r.bootstrapMode
        };
        _inflight = null;
        resolve(_cache);
      },
      fail: function(err) {
        console.error('login 云函数调用失败', err);
        _inflight = null;
        resolve({ openid: '', isAdmin: false, bootstrapMode: false });
      }
    });
  });
  return _inflight;
}

/**
 * 清除缓存（用于登出等场景）
 */
function invalidate() {
  _cache = null;
  _inflight = null;
}

module.exports = {
  getAuthInfo: getAuthInfo,
  invalidate: invalidate
};
