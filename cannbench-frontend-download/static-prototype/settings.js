(function () {
  const html = document.documentElement;
  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        // Local file previews may block storage in some browsers.
      }
    },
  };

  const savedTheme = storage.get("cannbench-theme") || "light";
  const savedLanguage = storage.get("cannbench-language") || "zh";

  function updateTheme(theme) {
    html.dataset.theme = theme;
    document.querySelectorAll("[data-theme-label]").forEach((label) => {
      label.textContent = theme === "dark" ? "深色" : "浅色";
    });
  }

  function updateLanguage(language) {
    html.lang = language === "en" ? "en" : "zh-CN";
    document.querySelectorAll("[data-language-label]").forEach((label) => {
      label.textContent = language === "en" ? "EN" : "中文";
    });
  }

  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  updateTheme(savedTheme);
  updateLanguage(savedLanguage);

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const menu = button.closest("details");
    const action = button.dataset.action;

    if (action === "theme") {
      const nextTheme = html.dataset.theme === "dark" ? "light" : "dark";
      updateTheme(nextTheme);
      storage.set("cannbench-theme", nextTheme);
      showToast(nextTheme === "dark" ? "已切换为深色主题" : "已切换为浅色主题");
    }

    if (action === "language") {
      const nextLanguage = html.lang === "en" ? "zh" : "en";
      updateLanguage(nextLanguage);
      storage.set("cannbench-language", nextLanguage);
      showToast(nextLanguage === "en" ? "英文版内容将在中文版确认后同步" : "已切换为中文");
    }

    if (action === "logout") {
      document.querySelectorAll("[data-account-name]").forEach((name) => {
        name.textContent = "访客";
      });
      document.querySelectorAll(".avatar").forEach((avatar) => {
        avatar.textContent = "访";
      });
      showToast("已退出登录");
    }

    if (menu) {
      menu.open = false;
    }
  });
})();
