export const en = {
  admin: {
    dashboard: {
      kpi: {
        logsTotal: "Total posts",
        logsPublic: "Public",
        logsPrivate: "Private",
        trash: "Trash",
        supportOpen: "Open tickets",
        supportTotal: "Total tickets:",
        users: "Users",
        publicRatio: "Public ratio",
        tagsTop: "Top tag",
        tagsCount: "Count:",
      },
      kpiDesc: {
        logs: "Post status overview",
        trash: "Soft-delete storage",
        support: "Support/feedback flow",
        users: "Reference only (early stage)",
        publicRatio: "Public / total",
        tagsTop: "Most used tag in public view",
      },
      note: {
        contentStatusHint:
          "A higher public ratio makes search/share experiments easier.",
        last7DaysHint:
          "If you see gaps, even saving a quick draft helps maintain momentum.",
        topTagsHint:
          "When top tags stabilize, mix in new tags to test discovery.",
        trashHint: "You can add a restore flow later if needed.",
        usersHint: "With few users, content metrics come first.",
        publicRatioHint:
          "Higher public ratio generally improves discovery and sharing.",
        tagsEmpty: "No tags yet.",
      },
    },
    sections: {
      kpi: "Key metrics",
      charts: "Charts",
      tags: "Tags",
    },
    sectionsDesc: {
      charts: "Quick trend checks for operations",
    },
    actions: {
      data: "View data",
      date: "Date check",
      openData: "Open data",
    },
    pie: {
      public: "Public",
      private: "Private",
      trash: "Trash",
    },
    data: {
      title: "Admin Data",
      backToDashboard: "Dashboard",
      tabs: {
        public: "Public (view)",
        raw: "Raw (base)",
        hiddenDup: "Hidden duplicates",
        trash: "Trash (base)",
      },
      flags: {
        active: "Active",
        user_trash: "User Trash",
        admin_trash: "Admin Trash",
        hard_deleted: "Hard Deleted",
        deleted: "deleted",
        hidden: "hidden",
        dup: "dup",
        dupOf: "dup_of",
      },
      deleteReason: {
        spam: "Spam",
        abuse: "Abusive content",
        duplicate: "Duplicate post",
        user_request: "User requested deletion",
        admin_cleanup: "Admin cleanup",
        ai_flagged: "AI flagged content",
      },
      kpi: {
        raw: "Raw total",
        public: "Public total",
        hiddenDup: "Hidden duplicates",
        publicRatio: "Public ratio",
        tagsTop: "Top tag",
        tagsCount: "Count:",
      },
      kpiDesc: {
        raw: "Base data including duplicates",
        public: "Actually visible to users",
        hiddenDup: "Hidden rows with duplicate_of",
        publicRatio: "Public / total",
        tagsTop: "Most used tag in public view",
      },
      col: {
        title: "Title",
        date: "Date",
        views: "Views",
        comments: "Comments",
        tags: "Tags",
        flags: "Status",
        status: "Status",
        reason: "Reason",
        note: "Note",
        deletedAt: "Deleted at",
        deletedBy: "Deleted by",
      },
      status: "Status",
      reason: "Reason",
      note: "Note",
      deletedAt: "Deleted at",
      deletedBy: "Deleted by",
      empty: "No data.",
      page: "Page",
    },
    title: "Admin Dashboard",
    subtitle:
      "See content health at a glance and track key metrics for operations.",

    chart: {
      contentStatus: "Content status",
      last7Days: "Posts in last 7 days",
      topTags: "Top Tags",
    },
    chartDesc: {
      contentStatus: "Public ratio {{n}}%",
      last7Days: "Check your writing rhythm",
      topTags: "Counts are admin-only",
    },
  },
  common: {
    auth: {
      loginWithGoogle: "Sign in with Google",
      logout: "Log out",
      signedInAs: "Signed in as:",
      loginRequired: "Sign-in required for posting/comments",
      loggedOut: "Logged out.",
    },
    route: {
      invalidTitle: "Invalid URL",
      invalidLogId: "The id in the URL is not a valid UUID.",
      invalidHint:
        "Received: {{id}}\nExample cause: /logs/new matched /logs/:id\nFix: declare /logs/new before :id in routes.",
    },
    comments: {
      title: "Comments",
      ph: "Write a comment…",
      submit: "Post",
      empty: "No comments yet.",
      mine: "Mine",
      created: "Comment posted.",
      deleted: "Comment deleted.",
    },
    loading: "Loading…",
    viewDetail: "View details",
    sessionChecking: "Checking session…",
    close: "Close",
    processing: "Processing…",
    submit: "Submit",
    back: "Back",
    list: "List",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Delete this item?",
    openDetail: "Open details",
    noTitle: "(No title)",
    loadingMore: "Loading more…",
    end: "End",
    refreshing: "Refreshing…",
    anonymous: "Anonymous",
    menu: "Menu",
    home: "Home",
    search: "Search",
    localeChange: "Change language",
    cancel: "Cancel",
    refresh: "Refresh",
    prev: "Prev",
    next: "Next",
    theme: "Theme",
    language: "Language",
  },
  header: {
    sections: {
      support: "Support",
      misc: "More",
      settings: "Settings",
    },
    search: {
      placeholder: "Search: title / content / tags",
    },
    nav: {
      admin: "Admin",
      accountSettings: "Account settings",
      trash: "Trash",
    },
  },
  logs: {
    editor: {
      phTitle: "Title",
      phContent: "Content",
      phTags: "Tags (e.g. js, react, japanese)",
      saveError: "An error occurred while saving.",
    },
    edit: {
      title: "Edit",
      loading: "Loading…",
      notFound: "This post does not exist.",
      forbidden: "Only the author can edit this post.",
      save: "Save changes",
    },
    detail: {
      notFound: "This post does not exist.",
      movedToTrash: "Moved to Trash.",
    },
    tab: {
      all: "All",
      mine: "My posts",
      mineDisabledHint: "Sign in required",
    },
    oneLiner: {
      title: "Thought flow",
      empty: "As you write more, your thought flow will appear here.",
    },
    sort: {
      label: "Sort",
      change: "Change sort order",
      recent: "Recent",
      views: "Views",
      comments: "Comments",
    },
    new: {
      title: "New post",
      submit: "Create",
      created: "Created!",
      loginRequired: "Please sign in to create a post.",
      hiddenByPolicy:
        "Saved, but hidden from the public list due to visibility rules. (title/body/duplicate rules)",
      undo: "Undo",
      paused: "(Paused)",
      undoHint:
        'For 5 seconds after creating, you can delete the post with "Undo".',
      // 안전빵(파라미터 없는 버전)
      createdInline: "Created",
      undoQuestion: "Undo?",
      // 파라미터 지원하면 이걸 써도 됨
      undoBanner: "Created — {{seconds}}s {{paused}} — Undo?",
    },
    trash: {
      title: "Trash",
      empty: "No deleted posts.",
      restore: "Restore",
      hardDelete: "Delete permanently",
      confirmHardDelete:
        "This will permanently delete the post. This cannot be undone.",
    },
    loading: "Loading posts…",
    search: {
      result: "Search results for “{{q}}”: {{n}}",
    },
  },
  support: {
    layout: {
      title: "Support",
      subtitle: "Tickets · Reports · FAQ",
    },
    nav: {
      all: "All tickets",
      faq: "FAQ",
      new: "Create ticket",
      mine: "My tickets",
      trash: "Trash",
    },
    faq: {
      empty: "No FAQs are available yet.",
    },
    new: {
      title: "Create ticket",
      loginRequired: "Please sign in to create a ticket.",
      phTitle: "Title",
      phBody: "Describe your issue",
      submitting: "Submitting…",
      ready: "Ready to submit",
      needInput: "Enter a title and content",
      created: "Ticket created.",
    },
    mine: {
      loginRequired: "Please sign in to view your tickets.",
      empty: "You haven't created any tickets yet.",
    },
    status: {
      open: "open",
      closed: "closed",
      pending: "pending",
    },
    trash: {
      title: "Support Trash",
      loginRequired: "Please sign in to view the trash.",
      empty: "Trash is empty.",
      deletedAt: "Deleted at:",
      restore: "Restore",
      hardDelete: "Delete permanently",
      confirmHardDelete:
        "This will be deleted permanently and cannot be restored. Continue?",
    },
    edit: {
      title: "Edit ticket",

      loginRequired: "Please sign in to edit.",

      invalidIdTitle: "Invalid URL",
      invalidIdMsg: "The support id is not a valid UUID and cannot be edited.",

      forbiddenTitle: "No permission",
      forbiddenMsg: "You can only edit tickets you created.",

      close: "Close",
      save: "Save",
      saving: "Saving…",

      loadFailed: "Failed to load ticket.",
    },
    myTickets: "My tickets",
    newTicket: "Create ticket",
    empty: "No tickets yet.",
    noTitle: "(No title)",
    countUnit: " items",
    authHint:
      "Creating tickets and viewing 'My tickets' are available after sign-in.",
  },
} as const;
