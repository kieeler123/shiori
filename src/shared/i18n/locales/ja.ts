export const ja = {
  common: {
    auth: {
      loginWithGoogle: "Googleでログイン",
      logout: "ログアウト",
      signedInAs: "ログイン中:",
      loginRequired: "投稿／コメントにはログインが必要です",
      loggedOut: "ログアウトしました。",
    },
    route: {
      invalidTitle: "URLが正しくありません",
      invalidLogId: "URLの id が正しい投稿ID(uuid)ではありません。",
      invalidHint:
        "受け取った値: {{id}}\n原因例: /logs/new が /logs/:id にマッチ\n対策: ルーターで /logs/new を :id より先に定義してください。",
    },
    comments: {
      title: "コメント",
      ph: "コメントを入力…",
      submit: "コメントする",
      empty: "まだコメントがありません。",
      mine: "自分のコメント",
      created: "コメントを投稿しました。",
      deleted: "コメントを削除しました。",
    },
    loading: "読み込み中…",
    viewDetail: "詳細を見る",
    sessionChecking: "セッション確認中…",
    close: "閉じる",
    processing: "処理中…",
    submit: "登録",
    back: "戻る",
    list: "一覧",
    edit: "編集",
    delete: "削除",
    confirmDelete: "削除しますか？",
    openDetail: "詳細を見る",
    noTitle: "（無題）",
    loadingMore: "さらに読み込み中…",
    end: "終わり",
    refreshing: "更新中…",
    anonymous: "匿名",
    menu: "メニュー",
    home: "ホーム",
    search: "検索",
    localeChange: "言語を変更",
    cancel: "キャンセル",
  },
  header: {
    sections: {
      support: "サポート",
      misc: "その他",
    },
    search: {
      placeholder: "検索：タイトル / 内容 / タグ",
    },
    nav: {
      accountSettings: "アカウント設定",
      trash: "ゴミ箱",
    },
  },
  logs: {
    editor: {
      phTitle: "タイトル",
      phContent: "本文",
      phTags: "タグ（例: js, react, 日本語）",
      saveError: "保存中にエラーが発生しました。",
    },
    edit: {
      title: "編集",
      loading: "読み込み中…",
      notFound: "この投稿は存在しません。",
      forbidden: "編集できるのは作成者のみです。",
      save: "変更を保存",
    },
    detail: {
      notFound: "投稿が見つかりませんでした。",
      movedToTrash: "ゴミ箱に移動しました。",
    },
    tab: {
      all: "全体",
      mine: "自分の投稿",
      mineDisabledHint: "ログイン後に利用できます",
    },
    oneLiner: {
      title: "思考の流れ",
      empty: "記録が増えると、思考の流れがここに表示されます。",
    },
    sort: {
      label: "並び替え",
      change: "並び替えを変更",
      recent: "新着",
      views: "閲覧",
      comments: "コメント",
    },
    new: {
      title: "新規投稿",
      submit: "作成",
      created: "作成しました！",
      loginRequired: "ログイン後に作成できます。",
      hiddenByPolicy:
        "保存されましたが、公開リストのルールにより非表示になりました。（タイトル/本文/重複ルール）",
      undo: "元に戻す",
      paused: "(停止中)",
      undoHint: "作成後5秒間は「元に戻す」で直前の投稿を削除できます。",
      createdInline: "作成済み",
      undoQuestion: "元に戻しますか？",
      undoBanner: "作成済み — {{seconds}}秒 {{paused}} — 元に戻しますか？",
    },
    trash: {
      title: "ゴミ箱",
      empty: "削除された投稿はありません。",
      restore: "復元",
      hardDelete: "完全削除",
      confirmHardDelete: "完全に削除されます。復元できません。",
    },
    loading: "記録を読み込み中…",
    search: {
      result: "「{{q}}」の検索結果：{{n}}件",
    },
  },
  support: {
    layout: {
      title: "サポート",
      subtitle: "問い合わせ・報告・FAQ 管理エリア",
    },
    nav: {
      all: "すべての問い合わせ",
      faq: "FAQ",
      new: "問い合わせする",
      mine: "自分の問い合わせ",
      trash: "ゴミ箱",
    },
    faq: {
      empty: "現在、公開中のFAQはありません。",
    },
    new: {
      title: "問い合わせする",
      loginRequired: "ログイン後に問い合わせできます。",
      phTitle: "タイトル",
      phBody: "問い合わせ内容を入力してください",
      submitting: "送信中…",
      ready: "入力完了",
      needInput: "タイトルと本文を入力してください",
      created: "問い合わせを登録しました。",
    },
    mine: {
      loginRequired: "ログイン後に確認できます。",
      empty: "作成した問い合わせはありません。",
    },
    status: {
      open: "open",
      closed: "closed",
      pending: "pending",
    },
    trash: {
      title: "サポートのゴミ箱",
      loginRequired: "ログイン後に確認できます。",
      empty: "ゴミ箱は空です。",
      deletedAt: "削除日:",
      restore: "復元",
      hardDelete: "完全削除",
      confirmHardDelete: "完全に削除されます。復元できません。続行しますか？",
    },
    edit: {
      title: "問い合わせ編集",

      loginRequired: "ログイン後に編集できます。",

      invalidIdTitle: "無効なURL",
      invalidIdMsg: "support id が UUID 形式ではないため編集できません。",

      forbiddenTitle: "権限がありません",
      forbiddenMsg: "自分が作成した問い合わせのみ編集できます。",

      close: "閉じる",
      save: "保存",
      saving: "保存中…",

      loadFailed: "問い合わせの読み込みに失敗しました。",
    },
    myTickets: "自分の問い合わせ",
    newTicket: "問い合わせする",
    empty: "まだ問い合わせはありません。",
    noTitle: "（無題）",
    countUnit: "件",
    authHint:
      "問い合わせ作成／自分の問い合わせ表示はログイン後に利用できます。",
  },
} as const;
