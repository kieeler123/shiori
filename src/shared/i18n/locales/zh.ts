export const zh = {
  common: {
    auth: {
      loginWithGoogle: "使用 Google 登录",
      logout: "退出登录",
      signedInAs: "已登录：",
      loginRequired: "发布/评论需要登录",
      loggedOut: "已退出登录。",
    },
    route: {
      invalidTitle: "链接不正确",
      invalidLogId: "当前 URL 的 id 不是有效的 UUID。",
      invalidHint:
        "收到的值: {{id}}\n示例原因: /logs/new 被 /logs/:id 匹配\n解决: 在路由里把 /logs/new 放在 :id 之前。",
    },
    comments: {
      title: "评论",
      ph: "输入评论…",
      submit: "发布评论",
      empty: "还没有评论。",
      mine: "我的评论",
      created: "评论已发布。",
      deleted: "评论已删除。",
    },
    loading: "加载中…",
    viewDetail: "查看详情",
    sessionChecking: "正在确认会话…",
    close: "关闭",
    processing: "处理中…",
    submit: "提交",
    back: "返回",
    list: "列表",
    edit: "编辑",
    delete: "删除",
    confirmDelete: "确定要删除吗？",
    openDetail: "查看详情",
    noTitle: "（无标题）",
    loadingMore: "正在加载更多…",
    end: "结束",
    refreshing: "正在刷新…",
    anonymous: "匿名",
    localeChange: "切换语言",
    cancel: "取消",
  },
  header: {
    sections: {
      support: "客服中心",
      misc: "其他",
    },
    search: {
      placeholder: "搜索：标题 / 内容 / 标签",
    },
    nav: {
      trash: "普通回收站",
      supportTrash: "客服回收站", // (선택) 구분용 키
      accountSettings: "账户设置", // (선택)
    },
  },
  logs: {
    editor: {
      phTitle: "标题",
      phContent: "内容",
      phTags: "标签（例如：js, react, 日语）",
      saveError: "保存时发生错误。",
    },
    edit: {
      title: "编辑",
      loading: "加载中…",
      notFound: "该帖子不存在。",
      forbidden: "只有作者可以编辑此帖子。",
      save: "保存修改",
    },
    detail: {
      notFound: "该内容不存在。",
      movedToTrash: "已移至回收站。",
    },
    tab: {
      all: "全部",
      mine: "我的帖子",
      mineDisabledHint: "登录后可用",
    },
    oneLiner: {
      title: "思路流",
      empty: "记录积累后，思路流会显示在这里。",
    },
    sort: {
      label: "排序",
      change: "更改排序",
      recent: "最新",
      views: "浏览",
      comments: "评论",
    },
    new: {
      title: "新建帖子",
      submit: "发布",
      created: "已创建！",
      loginRequired: "请登录后再发布。",
      hiddenByPolicy: "已保存，但因公开列表规则被隐藏。（标题/正文/重复规则）",
      undo: "撤销",
      paused: "(已暂停)",
      undoHint: "发布后 5 秒内可以通过“撤销”删除刚刚的帖子。",
      createdInline: "已创建",
      undoQuestion: "要撤销吗？",
      undoBanner: "已创建 — {{seconds}}秒 {{paused}} — 要撤销吗？",
    },
    trash: {
      title: "回收站",
      empty: "没有已删除的帖子。",
      restore: "恢复",
      hardDelete: "永久删除",
      confirmHardDelete: "将永久删除，无法恢复。",
    },
    loading: "正在加载记录…",
    search: {
      result: "“{{q}}” 的搜索结果：{{n}}条",
    },
  },
  support: {
    layout: {
      title: "客服中心",
      subtitle: "咨询 · 举报 · FAQ 管理区域",
    },
    nav: {
      all: "全部咨询",
      faq: "FAQ",
      new: "提交咨询",
      mine: "我的咨询",
      trash: "回收站",
    },
    faq: {
      empty: "目前还没有可用的 FAQ。",
    },
    new: {
      title: "提交咨询",
      loginRequired: "登录后才能提交咨询。",
      phTitle: "标题",
      phBody: "请输入咨询内容",
      submitting: "提交中…",
      ready: "已完成输入",
      needInput: "请输入标题和内容",
      created: "已提交咨询。",
    },
    mine: {
      loginRequired: "登录后才能查看。",
      empty: "你还没有提交过咨询。",
    },
    status: {
      open: "open",
      closed: "closed",
      pending: "pending",
    },
    trash: {
      title: "客服回收站",
      loginRequired: "登录后才能查看。",
      empty: "回收站是空的。",
      deletedAt: "删除时间：",
      restore: "恢复",
      hardDelete: "永久删除",
      confirmHardDelete: "将永久删除，无法恢复。继续吗？",
    },
    edit: {
      title: "编辑工单",

      loginRequired: "登录后才能编辑。",

      invalidIdTitle: "无效链接",
      invalidIdMsg: "support id 不是有效的 UUID，无法编辑。",

      forbiddenTitle: "没有权限",
      forbiddenMsg: "只能编辑自己创建的工单。",

      close: "关闭",
      save: "保存",
      saving: "保存中…",

      loadFailed: "加载工单失败。",
    },
    myTickets: "我的咨询",
    newTicket: "提交咨询",
    empty: "还没有咨询内容。",
    noTitle: "（无标题）",
    countUnit: "条",
    authHint: "提交咨询/查看“我的咨询”需要登录后才能使用。",
  },
} as const;
