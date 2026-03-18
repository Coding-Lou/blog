(function () {
  const MAP_CLASS = "home-travel-map";
  const MAP_FLAG_CLASS = "has-home-travel-map";
  const MAP_SRC = "https://jiayulou.travelmap.net?embed=1";

  function isHomePage() {
    const path = window.location.pathname || "/";
    return path === "/" || path === "/index.html";
  }

  function ensureMap() {
    const pageHeader = document.getElementById("page-header");
    if (!pageHeader || !pageHeader.classList.contains("full_page")) return;

    if (!isHomePage()) {
      pageHeader.classList.remove(MAP_FLAG_CLASS);
      return;
    }

    // Prevent duplicate iframe if page already contains one.
    if (pageHeader.querySelector("." + MAP_CLASS)) {
      pageHeader.classList.add(MAP_FLAG_CLASS);
      return;
    }

    const nav = pageHeader.querySelector("#nav");
    const siteInfo = pageHeader.querySelector("#site-info");
    const anchor = siteInfo || nav;
    if (!anchor) return;

    const iframe = document.createElement("iframe");
    iframe.className = MAP_CLASS;
    iframe.src = MAP_SRC;
    iframe.title = "Travel Map";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";

    anchor.insertAdjacentElement("afterend", iframe);
    pageHeader.classList.add(MAP_FLAG_CLASS);
  }

  document.addEventListener("DOMContentLoaded", ensureMap);
  window.addEventListener("pjax:complete", ensureMap);
})();
