(function () {
  const SCRIPT_ID = "google-translate-script";
  const BAR_ID = "google-translate-bar";
  const MOUNT_ID = "google_translate_element";
  const STATUS_ID = "google-translate-status";
  const BUTTON_ID = "nav-translate-button";
  const OPEN_CLASS = "is-open";

  let scriptRequested = false;

  function ensureBar() {
    let bar = document.getElementById(BAR_ID);
    if (bar) return bar;

    bar = document.createElement("div");
    bar.id = BAR_ID;
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML =
      '<div class="google-translate-inner">' +
      '<div id="' + MOUNT_ID + '"></div>' +
      '<span id="' + STATUS_ID + '">正在加载翻译组件...</span>' +
      '<button id="google-translate-close" type="button" aria-label="关闭翻译">关闭</button>' +
      "</div>";

    document.body.appendChild(bar);

    const closeButton = document.getElementById("google-translate-close");
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        setOpen(false);
      });
    }

    updateBarTop();
    return bar;
  }

  function ensureButton() {
    if (document.getElementById(BUTTON_ID)) return;

    const menuLinks = Array.from(document.querySelectorAll("#menus .menus_item > a.site-page"));
    const archiveLink = menuLinks.find(function (link) {
      const href = link.getAttribute("href") || "";
      return href === "/archives/" || href.endsWith("/archives/");
    });

    const menuItem = document.createElement("div");
    menuItem.className = "menus_item";
    menuItem.id = BUTTON_ID;
    menuItem.innerHTML =
      '<a class="site-page" href="javascript:void(0)" role="button" aria-expanded="false">' +
      '<i class="fas fa-language fa-fw"></i><span> 翻译</span>' +
      "</a>";

    const searchButton = document.getElementById("search-button");
    if (archiveLink && archiveLink.parentNode && archiveLink.parentNode.parentNode) {
      archiveLink.parentNode.insertAdjacentElement("afterend", menuItem);
    } else if (searchButton) {
      searchButton.insertAdjacentElement("afterend", menuItem);
    } else {
      return;
    }

    const trigger = menuItem.querySelector("a.site-page");
    if (!trigger) return;

    const onToggle = function () {
      setOpen(!ensureBar().classList.contains(OPEN_CLASS));
    };

    trigger.addEventListener("click", onToggle);
    trigger.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggle();
      }
    });
  }

  function loadGoogleScript() {
    if (scriptRequested || document.getElementById(SCRIPT_ID)) return;
    scriptRequested = true;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onload = function () {
      ensureTranslateWidget();
    };
    script.onerror = function () {
      const status = document.getElementById(STATUS_ID);
      if (status) status.textContent = "翻译脚本加载失败，请检查网络后重试。";
    };
    document.body.appendChild(script);
  }

  function hasTranslateWidget() {
    const mount = document.getElementById(MOUNT_ID);
    if (!mount) return false;
    return !!mount.querySelector("select.goog-te-combo, .goog-te-gadget-simple");
  }

  function setStatus(text) {
    const status = document.getElementById(STATUS_ID);
    if (!status) return;
    status.textContent = text || "";
    status.style.display = text ? "inline-block" : "none";
  }

  function ensureTranslateWidget() {
    if (!window.google || !google.translate) return;
    const mount = document.getElementById(MOUNT_ID);
    if (!mount) return;
    if (hasTranslateWidget()) {
      setStatus("");
      return;
    }

    mount.innerHTML = "";
    setStatus("正在初始化翻译...");
    new google.translate.TranslateElement(
      {
        pageLanguage: "zh-CN",
        includedLanguages: "zh-CN,en",
        autoDisplay: false
      },
      MOUNT_ID
    );

    window.setTimeout(function () {
      if (hasTranslateWidget()) setStatus("");
      else setStatus("翻译组件未加载完成，请稍后重试。");
    }, 800);
  }

  function updateBarTop() {
    const bar = document.getElementById(BAR_ID);
    if (!bar) return;

    const nav = document.getElementById("nav");
    if (!nav) {
      bar.style.top = "0px";
      return;
    }

    const rect = nav.getBoundingClientRect();
    const navBottom = Math.max(0, rect.bottom);
    bar.style.top = Math.round(navBottom) + "px";
  }

  function setOpen(open) {
    const bar = ensureBar();
    bar.classList.toggle(OPEN_CLASS, open);
    bar.setAttribute("aria-hidden", open ? "false" : "true");
    updateBarTop();

    const trigger = document.querySelector("#" + BUTTON_ID + " span");
    if (trigger) {
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }

    if (open) {
      setStatus("正在加载翻译组件...");
      loadGoogleScript();
      ensureTranslateWidget();
    }
  }

  window.googleTranslateElementInit = function () {
    ensureTranslateWidget();
  };

  function initGoogleTranslateNav() {
    ensureBar();
    ensureButton();
    updateBarTop();
  }

  document.addEventListener("DOMContentLoaded", initGoogleTranslateNav);
  window.addEventListener("pjax:complete", initGoogleTranslateNav);
  window.addEventListener("resize", updateBarTop);
  window.addEventListener("scroll", updateBarTop);
})();
