var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();
var _ = db.command;

exports.main = async function(event, context) {
  var wxContext = cloud.getWXContext();
  var openid = wxContext.OPENID;

  try {
    // 获取单条记录
    if (event.id) {
      var doc = await db.collection('records').doc(event.id).get();
      return { code: 0, data: doc.data };
    }

    // 获取统计数据
    if (event.stats) {
      return await getStats(openid);
    }

    // 查询列表
    var query = db.collection('records').where({ _openid: openid });

    if (event.date) {
      query = query.where({ _openid: openid, date: event.date });
    }

    if (event.category) {
      query = query.where({ _openid: openid, category: event.category });
    }

    var page = event.page || 1;
    var pageSize = event.pageSize || 50;
    var skip = (page - 1) * pageSize;

    var result = await query
      .orderBy('date', 'desc')
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return { code: 0, data: result.data };
  } catch (err) {
    console.error('查询失败', err);
    return { code: -1, data: [], message: '获取数据失败' };
  }
};

async function getStats(openid) {
  try {
    // 总记录数
    var countRes = await db.collection('records').where({ _openid: openid }).count();
    var totalCount = countRes.total;

    // 今日记录数
    var today = formatDate(new Date());
    var todayRes = await db.collection('records').where({ _openid: openid, date: today }).count();
    var todayCount = todayRes.total;

    // 分类统计
    var allRecords = [];
    var batchSize = 100;
    var fetched = 0;
    while (fetched < totalCount) {
      var batch = await db.collection('records')
        .where({ _openid: openid })
        .skip(fetched)
        .limit(batchSize)
        .field({ category: true, date: true })
        .get();
      allRecords = allRecords.concat(batch.data);
      fetched += batch.data.length;
      if (batch.data.length < batchSize) break;
    }

    var categoryCounts = {};
    var dateSet = {};
    for (var i = 0; i < allRecords.length; i++) {
      var cat = allRecords[i].category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      dateSet[allRecords[i].date] = true;
    }

    // 计算连续天数
    var streakDays = 0;
    var d = new Date();
    while (true) {
      var dateStr = formatDate(d);
      if (dateSet[dateStr]) {
        streakDays++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalCount: totalCount,
      todayCount: todayCount,
      streakDays: streakDays,
      categoryCounts: categoryCounts
    };
  } catch (err) {
    console.error('统计查询失败', err);
    return { totalCount: 0, todayCount: 0, streakDays: 0, categoryCounts: {} };
  }
}

function formatDate(date) {
  var year = date.getFullYear();
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var day = ('0' + date.getDate()).slice(-2);
  return year + '-' + month + '-' + day;
}
