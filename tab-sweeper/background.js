// 直前に閉じたタブのURLを保存しておく
let lastClosedTabs = [];

// 拡張インストール時にコンテキストメニューを作成
chrome.runtime.onInstalled.addListener(() => {
  // タブ一掃
  chrome.contextMenus.create({
    id: "sweep-tabs",
    title: chrome.i18n.getMessage("menuSweep"),
    contexts: ["all"]
  });

  // 直前の一掃を元に戻す
  chrome.contextMenus.create({
    id: "undo-sweep",
    title: chrome.i18n.getMessage("menuUndo"),
    contexts: ["all"]
  });
});

// メニューがクリックされたときの処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sweep-tabs") {
    // 現在のウィンドウのタブだけ対象にする
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      // ピン留めとアクティブなタブ以外を閉じる対象にする
      const toClose = tabs.filter((t) => !t.pinned && !t.active);

      // UNDO用にURLを保存（タブIDは消えるのでURLだけ保持）
      lastClosedTabs = toClose.map((t) => t.url);

      // 閉じる
      const ids = toClose.map((t) => t.id);
      if (ids.length > 0) {
        chrome.tabs.remove(ids);
      }
    });
  } else if (info.menuItemId === "undo-sweep") {
    // 直前に保存されたタブがなければ何もしない
    if (!lastClosedTabs || lastClosedTabs.length === 0) {
      return;
    }

    // 保存したURLからタブを復元
    const urlsToRestore = [...lastClosedTabs];
    // 一度復元したらクリア（1回だけUNDO）
    lastClosedTabs = [];

    urlsToRestore.forEach((url) => {
      chrome.tabs.create({ url });
    });
  }
});
