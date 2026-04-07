---
name: mini-program
description: 微信小程序全流程开发技能。从需求收集、设计、技术选型到开发部署，分阶段引导用户构建完整的微信小程序。
---

# 微信小程序全流程开发技能

本技能引导用户从零开始构建微信小程序，涵盖注册、设计、开发、测试到上线的完整流程。

**核心原则**：
- 全中文输出（代码变量名用英文）
- 每个大阶段开始前，先通过提问收集用户需求
- 代码示例使用通用 dummy 业务，不绑定具体项目
- ES5 兼容风格：使用 `var`、`function(){}`

---

## 工作流

用户输入 `/mini-program` 后，按以下 5 个阶段推进。每个阶段开始前先提问，根据回答决定后续内容。

### 阶段 1：需求收集

使用 AskUserQuestion 向用户提问以下内容：

1. 你的小程序是做什么的？面向哪些用户？（电商/工具/社交/内容/游戏/其他）
2. 你是否已经有微信小程序账号和 AppID？
3. 你的技术水平如何？（零基础 / 有前端经验 / 熟悉小程序开发）

**处理逻辑**：
- 如果用户是零基础且没有 AppID → 展示 Part A 全部内容
- 如果用户有前端经验但没有 AppID → 展示 Part A 中的 A1、A3、A4
- 如果用户已有 AppID 且熟悉开发 → 跳过 Part A，直接进入阶段 2

### 阶段 2：设计确认

使用 AskUserQuestion 向用户提问以下内容：

1. UI/UX 风格偏好？（简约/活泼/商务/暗色主题/其他，可提供参考图）
2. 主色调和品牌色是什么？（如有 logo 可提供）
3. 需要几个底部 Tab 页面？每个页面的主要功能是什么？
4. 是否需要自定义导航栏？

**处理逻辑**：
- 根据用户偏好生成设计令牌（颜色、字体、间距变量）
- 确定页面结构和 tabBar 配置
- 生成 app.json 框架

### 阶段 3：技术选型

使用 AskUserQuestion 向用户提问以下内容：

1. 数据库选择：微信云开发数据库（推荐，免费额度充足）/ 自建数据库 / 第三方？
2. 是否需要对接外部 API？如果需要，是哪些？
3. 是否需要 AI 功能？（智能搜索/图像识别/语音识别/智能推荐）
4. 是否需要用户登录体系？（微信授权登录 / 手机号登录 / 无需登录）

**处理逻辑**：
- 确定技术架构（云开发 vs 传统后端）
- 根据 AI 需求决定是否集成 cloud.extend.AI
- 根据登录需求配置用户体系
- 开始搭建项目骨架

### 阶段 4：开发实施

按阶段 2 和 3 确认的需求，按以下顺序逐步开发（参照 Part B 的开发规范）：

1. 项目初始化 → 创建目录结构（参照 B1）
2. 全局配置 → app.json / app.js / app.wxss（参照 B2、B3）
3. 自定义 Tab Bar → 如用户需要（参照 B4）
4. 页面开发 → 逐页实现功能（参照 B5、B7、B8）
5. 组件开发 → 提取可复用组件（参照 B6）
6. 云函数开发 → 后端逻辑（参照 B9、B10、B11）
7. AI 集成 → 如用户需要（参照 B12）
8. 外部 API 对接 → 如用户需要（参照 B13）
9. 联调测试 → 前后端打通

### 阶段 5：测试与部署

使用 AskUserQuestion 向用户提问以下内容：

1. 是否需要部署指引？（云函数上传、域名白名单配置等）
2. 是否需要提审流程引导？（提交审核、版本管理等）

**处理逻辑**：
- 提供部署清单（参照 B19）
- 引导云函数部署和环境配置
- 如需要，展示 Part A 的 A6（提审与发布流程）

---

## Part A: 用户指引（零基础用户）

根据阶段 1 中用户的技术水平决定是否展示本部分。技术用户可跳过。

### A1 注册小程序账号

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)，点击右上角「立即注册」
2. 选择「小程序」类型
3. 填写邮箱、密码，完成邮箱验证
4. 选择主体类型：
   - **个人**：功能有限（不支持微信支付、不能使用部分接口），适合学习和个人工具
   - **企业/个体工商户**：功能完整，需提供营业执照
5. 完成注册后，在「开发管理」→「开发设置」中获取 **AppID**

> 提示：AppID 是小程序的唯一标识，后续创建项目时需要填入。

### A2 安装开发者工具

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 选择对应操作系统版本（Windows / macOS）安装
3. 打开后使用微信扫码登录
4. 界面主要区域：
   - **模拟器**：左侧，实时预览小程序效果
   - **编辑器**：中间，编写代码
   - **调试器**：下方，Console / Network / Storage 等调试面板

### A3 创建项目

1. 打开微信开发者工具，点击「+」创建新项目
2. 填写项目信息：
   - **项目名称**：自定义
   - **目录**：选择一个空文件夹
   - **AppID**：填入 A1 中获取的 AppID
   - **后端服务**：选择「微信云开发」
3. 点击「确定」，等待项目初始化完成

### A4 开通云开发

1. 在开发者工具中，点击左上角「云开发」按钮
2. 点击「开通」，创建云开发环境
3. 记录**环境 ID**（格式如 `cloud1-xxx`），后续代码中需要使用
4. 免费额度说明：
   - 数据库存储：2GB
   - 云存储：5GB
   - 云函数调用：每月 10 万次
   - 足够绝大多数个人/小型项目使用

### A5 预览与调试

1. **模拟器预览**：在开发者工具中直接查看，支持不同机型切换
2. **真机预览**：点击工具栏「预览」，用微信扫码在手机上查看
3. **真机调试**：点击「真机调试」，可在电脑上看到手机端的 Console 日志
4. **体验版**：点击「上传」后，在小程序后台设置体验版，可分享给团队成员测试

### A6 提审与发布

1. 在开发者工具中点击「上传」，填写版本号和备注
2. 登录 [微信公众平台](https://mp.weixin.qq.com/)
3. 进入「管理」→「版本管理」
4. 在「开发版本」中找到刚上传的版本，点击「提交审核」
5. 填写审核信息（功能描述、类目等）
6. 等待审核通过（通常 1-3 个工作日）
7. 审核通过后，点击「发布」即可上线

---

## Part B: 开发规范

所有代码示例使用通用 dummy 代码（如"待办事项"、"商品列表"），不引用任何真实项目代码。

### B1 项目结构

标准微信小程序云开发项目目录：

```
项目根目录/
├── cloudfunctions/          # 云函数目录
│   ├── getData/             # 每个云函数一个文件夹
│   │   ├── index.js
│   │   └── package.json
│   └── submitOrder/
│       ├── index.js
│       └── package.json
├── miniprogram/             # 小程序前端代码（或直接在根目录）
│   ├── pages/               # 页面目录
│   │   ├── index/           # 首页
│   │   │   ├── index.wxml
│   │   │   ├── index.wxss
│   │   │   ├── index.js
│   │   │   └── index.json
│   │   ├── list/            # 列表页
│   │   └── detail/          # 详情页
│   ├── components/          # 自定义组件
│   │   ├── card/
│   │   └── nav-bar/
│   ├── assets/              # 静态资源
│   │   └── icons/
│   ├── utils/               # 工具函数
│   │   └── util.js
│   ├── app.js               # 小程序入口
│   ├── app.json             # 全局配置
│   └── app.wxss             # 全局样式
└── project.config.json      # 项目配置
```

### B2 全局配置

**app.json 模板**：

```json
{
  "pages": [
    "pages/index/index",
    "pages/list/list",
    "pages/detail/detail",
    "pages/profile/profile"
  ],
  "window": {
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTitleText": "我的小程序",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#333333",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "assets/icons/tab-home.png",
        "selectedIconPath": "assets/icons/tab-home-active.png"
      },
      {
        "pagePath": "pages/list/list",
        "text": "列表",
        "iconPath": "assets/icons/tab-list.png",
        "selectedIconPath": "assets/icons/tab-list-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "assets/icons/tab-profile.png",
        "selectedIconPath": "assets/icons/tab-profile-active.png"
      }
    ]
  },
  "cloud": true,
  "sitemapLocation": "sitemap.json"
}
```

**app.js 模板**：

```javascript
App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 以上基础库');
      return;
    }
    wx.cloud.init({
      env: '你的环境ID',  // 替换为实际环境 ID
      traceUser: true
    });
  },
  globalData: {
    userInfo: null
  }
});
```

### B3 设计系统

**app.wxss 中定义设计令牌**：

```css
/* ===== 设计令牌 ===== */
page {
  /* 主色调 — 根据用户偏好调整 */
  --color-primary: #1890ff;
  --color-primary-light: #e6f7ff;
  --color-primary-dark: #096dd9;

  /* 语义色 */
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;

  /* 中性色 */
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-text-hint: #999999;
  --color-border: #e8e8e8;
  --color-bg: #f5f5f5;
  --color-bg-card: #ffffff;

  /* 字体大小 */
  --font-xs: 22rpx;
  --font-sm: 24rpx;
  --font-base: 28rpx;
  --font-lg: 32rpx;
  --font-xl: 36rpx;
  --font-xxl: 44rpx;

  /* 间距 */
  --spacing-xs: 8rpx;
  --spacing-sm: 16rpx;
  --spacing-md: 24rpx;
  --spacing-lg: 32rpx;
  --spacing-xl: 48rpx;

  /* 圆角 */
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-full: 999rpx;

  /* 阴影 */
  --shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);

  /* 底部安全区 */
  --safe-bottom: env(safe-area-inset-bottom);

  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-base);
}
```

### B4 自定义 Tab Bar

如果用户需要自定义 Tab Bar（SVG 图标、动画效果等），使用微信的 custom-tab-bar 方案。

**app.json 中声明**：
```json
{
  "tabBar": {
    "custom": true,
    "list": [...]
  }
}
```

**custom-tab-bar/index.wxml**：
```xml
<view class="tab-bar">
  <view
    wx:for="{{list}}"
    wx:key="index"
    class="tab-item {{selected === index ? 'active' : ''}}"
    bindtap="switchTab"
    data-index="{{index}}"
    data-path="{{item.pagePath}}"
  >
    <image class="tab-icon" src="{{selected === index ? item.selectedIconPath : item.iconPath}}" />
    <text class="tab-label">{{item.text}}</text>
  </view>
  <view class="safe-area-placeholder"></view>
</view>
```

**custom-tab-bar/index.js**：
```javascript
Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '首页', iconPath: '/assets/icons/tab-home.svg', selectedIconPath: '/assets/icons/tab-home-active.svg' },
      { pagePath: '/pages/list/list', text: '列表', iconPath: '/assets/icons/tab-list.svg', selectedIconPath: '/assets/icons/tab-list-active.svg' },
      { pagePath: '/pages/profile/profile', text: '我的', iconPath: '/assets/icons/tab-profile.svg', selectedIconPath: '/assets/icons/tab-profile-active.svg' }
    ]
  },
  methods: {
    switchTab: function(e) {
      var data = e.currentTarget.dataset;
      wx.switchTab({ url: data.path });
    }
  }
});
```

**custom-tab-bar/index.wxss**：
```css
.tab-bar {
  display: flex;
  flex-wrap: wrap;
  background: var(--color-bg-card);
  border-top: 1rpx solid var(--color-border);
  padding: 8rpx 0 0;
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6rpx 0;
  color: var(--color-text-hint);
}
.tab-item.active { color: var(--color-primary); }
.tab-icon { width: 48rpx; height: 48rpx; }
.tab-label { font-size: 20rpx; margin-top: 4rpx; }
.safe-area-placeholder { width: 100%; height: var(--safe-bottom); }
```

### B5 页面开发

**页面 JS 模板**：

```javascript
var app = getApp();

Page({
  data: {
    items: [],
    loading: true,
    page: 1,
    hasMore: true
  },

  onLoad: function(options) {
    // options 包含 URL 参数，如 ?id=123 → options.id === '123'
    var id = options.id || '';
    this.setData({ itemId: id });
    this.loadData();
  },

  onShow: function() {
    // 每次页面显示时触发（包括从其他页面返回）
    // 适合刷新需要实时更新的数据
  },

  onPullDownRefresh: function() {
    // 下拉刷新（需在页面 json 中配置 enablePullDownRefresh: true）
    var that = this;
    that.setData({ page: 1, items: [], hasMore: true });
    that.loadData(function() {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function() {
    // 触底加载更多
    if (this.data.hasMore && !this.data.loading) {
      this.loadData();
    }
  },

  loadData: function(callback) {
    var that = this;
    that.setData({ loading: true });
    wx.cloud.callFunction({
      name: 'getData',
      data: { page: that.data.page, pageSize: 20 }
    }).then(function(res) {
      var newItems = res.result.data || [];
      that.setData({
        // 路径更新：追加到数组末尾
        items: that.data.items.concat(newItems),
        loading: false,
        hasMore: newItems.length >= 20,
        page: that.data.page + 1
      });
      if (callback) callback();
    }).catch(function(err) {
      console.error('加载数据失败', err);
      that.setData({ loading: false });
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      if (callback) callback();
    });
  }
});
```

### B6 组件开发

**组件 JS 模板**：

```javascript
Component({
  // 外部传入的属性
  properties: {
    title: { type: String, value: '' },
    count: { type: Number, value: 0 },
    items: { type: Array, value: [] },
    showDetail: { type: Boolean, value: false }
  },

  // 内部数据
  data: {
    expanded: false
  },

  // 组件生命周期
  lifetimes: {
    attached: function() {
      // 组件挂载到页面时触发
      this._initData();
    },
    detached: function() {
      // 组件从页面移除时触发
      // 清理定时器、事件监听等
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    }
  },

  // 所在页面的生命周期
  pageLifetimes: {
    show: function() {
      // 页面显示时触发（适合启动动画/定时器）
    },
    hide: function() {
      // 页面隐藏时触发（适合暂停动画/定时器）
    }
  },

  // 属性监听器
  observers: {
    'items': function(newItems) {
      // 当 items 属性变化时触发
      this.setData({ totalCount: newItems.length });
    }
  },

  methods: {
    _initData: function() {
      // 内部初始化方法（下划线前缀表示私有）
    },
    onItemTap: function(e) {
      var index = e.currentTarget.dataset.index;
      // 向父组件发送事件
      this.triggerEvent('select', { index: index, item: this.data.items[index] });
    },
    toggleExpand: function() {
      this.setData({ expanded: !this.data.expanded });
    }
  }
});
```

**组件 JSON 声明**（`component-name.json`）：
```json
{
  "component": true,
  "usingComponents": {}
}
```

**在页面中使用组件**（`page.json`）：
```json
{
  "usingComponents": {
    "item-card": "/components/card/card"
  }
}
```

```xml
<item-card title="商品名称" count="{{itemCount}}" items="{{itemList}}" bind:select="onItemSelect" />
```

### B7 WXML 模板

**数据绑定**：
```xml
<!-- 文本绑定 -->
<text>{{userName}}</text>

<!-- 属性绑定 -->
<image src="{{avatarUrl}}" mode="aspectFill" />

<!-- 计算表达式 -->
<text>总价：¥{{price * quantity}}</text>
```

**条件渲染**：
```xml
<!-- wx:if 完全移除/添加节点 -->
<view wx:if="{{status === 'loading'}}">加载中...</view>
<view wx:elif="{{status === 'empty'}}">暂无数据</view>
<view wx:else>
  <text>共 {{total}} 条记录</text>
</view>

<!-- hidden 仅切换显示（节点始终存在，适合频繁切换） -->
<view hidden="{{!showPanel}}">面板内容</view>
```

**列表渲染**：
```xml
<view wx:for="{{todoList}}" wx:key="_id" class="todo-item">
  <text class="todo-title">{{item.title}}</text>
  <text class="todo-status">{{item.done ? '已完成' : '未完成'}}</text>
</view>

<!-- 自定义变量名 -->
<view wx:for="{{categories}}" wx:for-item="cat" wx:for-index="idx" wx:key="idx">
  <text>{{idx + 1}}. {{cat.name}}</text>
</view>
```

**事件绑定**：
```xml
<!-- bind：事件冒泡 -->
<button bindtap="onSubmit">提交</button>

<!-- catch：阻止事件冒泡 -->
<view catchtap="onMaskTap" class="mask">
  <view catchtap="preventClose" class="dialog">弹窗内容</view>
</view>

<!-- 传递数据 -->
<view bindtap="onItemTap" data-id="{{item._id}}" data-name="{{item.name}}">
  {{item.name}}
</view>
```

```javascript
// JS 中获取事件数据
onItemTap: function(e) {
  var id = e.currentTarget.dataset.id;
  var name = e.currentTarget.dataset.name;
  wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
}
```

### B8 WXSS 样式

**rpx 单位**：以 750rpx 为基准宽度，自动适配不同屏幕。
```css
/* 1rpx ≈ 0.5px（在 iPhone 6 上） */
.container {
  padding: 32rpx;
  margin: 0 24rpx;
}
```

**Flex 布局**：
```css
/* 水平居中排列 */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 垂直排列，间距均匀 */
.column {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* 自动换行网格 */
.grid {
  display: flex;
  flex-wrap: wrap;
}
.grid-item {
  width: 33.33%;
  box-sizing: border-box;
  padding: 8rpx;
}
```

**点击反馈**：
```css
.btn:active {
  opacity: 0.7;
  transform: scale(0.98);
}
```

**样式隔离**（组件 JSON 中配置）：
```json
{
  "component": true,
  "styleIsolation": "isolated"
}
```
- `isolated`：组件样式完全隔离（默认）
- `apply-shared`：页面样式可影响组件
- `shared`：样式互相影响

### B9 云函数

**云函数模板**（`cloudfunctions/getData/index.js`）：

```javascript
var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();

exports.main = async function(event, context) {
  var page = event.page || 1;
  var pageSize = event.pageSize || 20;
  var skip = (page - 1) * pageSize;

  try {
    var result = await db.collection('todos')
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return {
      code: 0,
      data: result.data,
      message: '获取成功'
    };
  } catch (err) {
    console.error('查询失败', err);
    return {
      code: -1,
      data: [],
      message: '获取数据失败，请稍后重试'
    };
  }
};
```

**package.json**：
```json
{
  "name": "getData",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

**部署流程**：
1. 在微信开发者工具中右键点击云函数文件夹
2. 选择「上传并部署：云端安装依赖」
3. 等待部署完成（控制台会显示部署结果）

### B10 云数据库

**CRUD 操作**：

```javascript
var db = wx.cloud.database();
var _ = db.command;  // 数据库操作符

// 查询 — 单条
db.collection('todos').doc('todo-id-123').get().then(function(res) {
  console.log('待办详情', res.data);
});

// 查询 — 条件筛选
db.collection('todos').where({
  done: false,
  priority: _.gte(3)  // 优先级 >= 3
}).orderBy('createTime', 'desc').limit(20).get();

// 查询 — 模糊搜索
db.collection('products').where({
  name: db.RegExp({ regexp: '手机', options: 'i' })
}).get();

// 新增
db.collection('todos').add({
  data: {
    title: '学习小程序开发',
    done: false,
    priority: 5,
    createTime: db.serverDate()
  }
});

// 更新
db.collection('todos').doc('todo-id-123').update({
  data: {
    done: true,
    updateTime: db.serverDate()
  }
});

// 删除
db.collection('todos').doc('todo-id-123').remove();
```

**常用 Command 操作符**：
```javascript
var _ = db.command;

// 数值操作
_.gt(10)    // 大于 10
_.gte(10)   // 大于等于 10
_.lt(10)    // 小于 10
_.in([1,2]) // 在数组中

// 逻辑操作
_.and([{done: false}, {priority: _.gte(3)}])
_.or([{status: 'active'}, {status: 'pending'}])

// 数组操作
_.push({ each: ['新标签'], position: 0 })  // 数组头部插入
_.pull('旧标签')                            // 移除元素

// 自增
_.inc(1)    // 字段值 +1
```

### B11 云存储

**文件上传**：
```javascript
// 选择图片并上传
wx.chooseMedia({
  count: 1,
  mediaType: ['image'],
  sourceType: ['album', 'camera'],
  success: function(res) {
    var tempFilePath = res.tempFiles[0].tempFilePath;
    var timestamp = Date.now();
    wx.cloud.uploadFile({
      cloudPath: 'images/' + timestamp + '.jpg',
      filePath: tempFilePath,
      success: function(uploadRes) {
        var fileID = uploadRes.fileID;
        console.log('上传成功，文件 ID:', fileID);
        // 将 fileID 存入数据库即可
      },
      fail: function(err) {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    });
  }
});
```

**获取临时访问链接**：
```javascript
wx.cloud.getTempFileURL({
  fileList: ['cloud://env-xxx.xxxx/images/123.jpg']
}).then(function(res) {
  var url = res.fileList[0].tempFileURL;
  // 用于 image 组件显示
});
```

### B12 AI 集成（按需）

仅在用户需要 AI 功能时使用。基于微信云开发的 AI 能力（腾讯混元模型）。

**文本对话 — Bot API**（云函数中）：
```javascript
var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var ai = cloud.extend.AI;

exports.main = async function(event) {
  var question = event.question || '';
  try {
    var result = '';
    var res = await ai.bot.sendMessage({
      msg: question,
      history: []
    });
    for await (var chunk of res.textStream) {
      result += chunk;
    }
    return { code: 0, answer: result };
  } catch (err) {
    console.error('AI 调用失败', err);
    return { code: -1, answer: '抱歉，暂时无法回答，请稍后重试' };
  }
};
```

**图像识别 — Hunyuan Vision**（云函数中）：
```javascript
var cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var ai = cloud.extend.AI;

exports.main = async function(event) {
  var imageFileID = event.imageFileID;
  try {
    // 获取图片临时 URL
    var urlRes = await cloud.getTempFileURL({ fileList: [imageFileID] });
    var imageUrl = urlRes.fileList[0].tempFileURL;

    // 调用混元视觉模型
    var model = ai.createModel('hunyuan-vision');
    var result = await model.generateText({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: '请描述这张图片的内容' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    });
    return { code: 0, description: result.text };
  } catch (err) {
    console.error('图像识别失败', err);
    return { code: -1, description: '未能识别图片内容，请换一张图片试试' };
  }
};
```

### B13 外部 API

**wx.request 调用外部接口**：
```javascript
wx.request({
  url: 'https://api.example.com/products',
  method: 'GET',
  header: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  data: { category: 'electronics', page: 1 },
  success: function(res) {
    if (res.statusCode === 200) {
      console.log('数据', res.data);
    } else {
      console.error('请求失败，状态码:', res.statusCode);
    }
  },
  fail: function(err) {
    console.error('网络错误', err);
    wx.showToast({ title: '网络连接失败', icon: 'none' });
  }
});
```

**域名白名单配置**：
- 登录 [微信公众平台](https://mp.weixin.qq.com/)
- 进入「开发管理」→「开发设置」→「服务器域名」
- 在 `request 合法域名` 中添加 API 域名（必须 HTTPS）
- 开发阶段可在开发者工具中勾选「不校验合法域名」临时跳过

**API Key 管理建议**：
- 不要在前端代码中硬编码 API Key
- 将 API Key 放在云函数中，前端通过云函数中转请求
- 便于后续更换 Key 时只需更新云函数

### B14 本地存储

**local-first 架构**：优先读取本地缓存，异步从云端同步最新数据。

```javascript
// 读取缓存
var cachedData = wx.getStorageSync('productList') || [];
if (cachedData.length > 0) {
  this.setData({ items: cachedData });
}

// 同时从云端拉取最新数据
var that = this;
wx.cloud.callFunction({
  name: 'getData',
  data: {}
}).then(function(res) {
  var freshData = res.result.data || [];
  that.setData({ items: freshData });
  // 更新本地缓存
  wx.setStorageSync('productList', freshData);
});
```

**存储限制**：
- 单个 key 上限 1MB
- 总存储上限 10MB
- 适合存储：用户偏好、搜索历史、缓存数据
- 不适合存储：大量图片数据、敏感信息

### B15 导航路由

```javascript
// switchTab — 切换到 tabBar 页面（不能带参数）
wx.switchTab({ url: '/pages/index/index' });

// navigateTo — 跳转到非 tabBar 页面（可带参数，保留当前页面）
wx.navigateTo({ url: '/pages/detail/detail?id=123&name=商品A' });

// redirectTo — 替换当前页面（关闭当前页）
wx.redirectTo({ url: '/pages/result/result' });

// navigateBack — 返回上一页
wx.navigateBack({ delta: 1 });

// reLaunch — 关闭所有页面，打开指定页面
wx.reLaunch({ url: '/pages/index/index' });
```

**注意事项**：
- `switchTab` 不能跳转到非 tabBar 页面
- `navigateTo` 不能跳转到 tabBar 页面
- 页面栈最多 10 层，超过后 `navigateTo` 会失败
- URL 参数在目标页面的 `onLoad(options)` 中获取

### B16 动画模式

**CSS Transition**：
```css
/* 渐变过渡 */
.fade-item {
  opacity: 1;
  transition: opacity 0.3s ease;
}
.fade-item.hidden {
  opacity: 0;
}

/* 滑入效果 */
.slide-up {
  transform: translateY(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up.active {
  transform: translateY(-100%);
}
```

**Keyframe 动画**：
```css
/* 旋转加载动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.loading-icon {
  animation: spin 1s linear infinite;
}

/* 脉冲效果 */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.pulse-item {
  animation: pulse 2s ease-in-out infinite;
}
```

**列表交错动画**：
```css
.list-item {
  opacity: 0;
  transform: translateY(20rpx);
  animation: fadeInUp 0.4s ease forwards;
}
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* 通过 style 属性设置不同的延迟 */
```

```xml
<view
  wx:for="{{items}}"
  wx:key="_id"
  class="list-item"
  style="animation-delay: {{index * 0.05}}s"
>
  {{item.title}}
</view>
```

### B17 错误处理

**核心原则：永远不向用户暴露 JS 错误信息。**

```javascript
// 云函数调用 — 始终 try/catch
wx.cloud.callFunction({
  name: 'getData',
  data: { id: itemId }
}).then(function(res) {
  if (res.result.code !== 0) {
    wx.showToast({ title: res.result.message || '操作失败', icon: 'none' });
    return;
  }
  // 正常处理
}).catch(function(err) {
  console.error('云函数调用失败', err);
  wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
});
```

**错误信息过滤**（防止技术细节泄露）：
```javascript
function getSafeMessage(msg) {
  if (!msg || typeof msg !== 'string') return '操作失败，请重试';
  // 过滤掉包含技术信息的错误
  if (/Error|Cannot|undefined|null|TypeError|ReferenceError/i.test(msg)) {
    return '操作失败，请重试';
  }
  return msg;
}
```

**Fallback 模式**：
```javascript
// AI 功能降级示例
function smartSearch(keyword) {
  return callAISearch(keyword).catch(function() {
    // AI 失败时降级为普通搜索
    return normalSearch(keyword);
  });
}
```

### B18 常见陷阱

| # | 陷阱 | 解决方案 |
|---|------|----------|
| 1 | `setData` 传入大量数据导致页面卡顿 | 使用路径更新：`this.setData({ 'list[0].name': '新名称' })` |
| 2 | `onLoad` 中异步操作未完成就渲染页面 | 设置 `loading` 状态，显示骨架屏或加载动画 |
| 3 | `switchTab` 无法传递参数 | 使用 `globalData` 或 `EventChannel` 传递数据 |
| 4 | 云函数超时（默认 3 秒） | 在云函数配置中增加超时时间（最大 60 秒） |
| 5 | 图片加载慢或显示空白 | 使用 `cloud://` 协议直接引用云存储图片，添加 `lazy-load` |
| 6 | `wx.request` 域名校验失败 | 在微信公众平台添加域名白名单（必须 HTTPS） |
| 7 | 组件样式不生效 | 检查 `styleIsolation` 配置，或使用 `externalClasses` |
| 8 | 页面栈溢出（超过 10 层） | 用 `redirectTo` 替代 `navigateTo`，或用 `reLaunch` |
| 9 | `this` 指向错误 | 在闭包外用 `var that = this` 保存引用 |
| 10 | 云数据库 `where` 查询无结果 | 检查集合权限设置（默认仅创建者可读写） |

### B19 部署清单

上线前逐项检查：

**代码质量**：
- [ ] 所有 `console.log` 调试日志已清理或降级
- [ ] 所有 API Key 已移至云函数，前端无硬编码密钥
- [ ] 错误提示均为友好中文，无技术信息泄露
- [ ] 所有异步调用有 try/catch 和错误处理

**云函数**：
- [ ] 所有云函数已上传并部署
- [ ] 云函数超时时间已合理设置
- [ ] 数据库集合权限已正确配置
- [ ] 云存储读写权限已正确配置

**配置与兼容**：
- [ ] `app.json` 中页面路径正确
- [ ] 域名白名单已配置（request / uploadFile / downloadFile）
- [ ] 基础库最低版本已设置
- [ ] tabBar 图标尺寸正确（81px × 81px）

**体验与性能**：
- [ ] 真机测试通过（iOS + Android）
- [ ] 页面加载速度可接受（首屏 < 3 秒）
- [ ] 图片已压缩，避免过大资源
- [ ] 下拉刷新和加载更多正常工作
- [ ] 各机型适配正常（安全区域已处理）

**提审准备**：
- [ ] 小程序名称、简介、头像已设置
- [ ] 服务类目已正确选择
- [ ] 隐私协议已配置（如需要）
- [ ] 体验版已充分测试
