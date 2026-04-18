/**
 * login — 获取当前用户 openid 并判断是否为管理员
 *
 * 返回：{ success, openid, isAdmin, bootstrapMode }
 *
 * 【首次配置管理员】
 *   1. 部署本云函数（保持 ADMIN_OPENIDS 为空）
 *   2. 在小程序设置页「关于 Planar Bridge」点 5 次 → 弹窗会显示你的 openid
 *   3. 把 openid 复制，同步填入以下两处的 ADMIN_OPENIDS：
 *      a) 本文件（login/index.js）
 *      b) importCards/index.js
 *   4. 重新上传部署这两个云函数
 *   5. 再次进入设置页，5 次点击会自动通过权限校验
 */

var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 管理员 openid 白名单 — 填空即 bootstrap 模式（任何用户均可，仅供首次部署获取 openid 使用）
var ADMIN_OPENIDS = [
  // 'o-xxxxxxxxxxxxxxxxxxxxxxx',
];

exports.main = async function(event, context) {
  var wxContext = cloud.getWXContext();
  var openid = wxContext.OPENID || '';
  var bootstrapMode = ADMIN_OPENIDS.length === 0;
  var isAdmin = bootstrapMode || (ADMIN_OPENIDS.indexOf(openid) >= 0);

  return {
    success: true,
    openid: openid,
    isAdmin: isAdmin,
    bootstrapMode: bootstrapMode,
    appid: wxContext.APPID || '',
    unionid: wxContext.UNIONID || ''
  };
};
