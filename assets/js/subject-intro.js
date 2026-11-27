/* 学科简介：五大学科入口共用。点击 hero 下的“学科简介”打开可滚动详情。 */
(function () {
  "use strict";

  var DATA = {
    java: {
      key: "JAVA",
      accent: "#8FB8FF",
      title: "Java 学科简介",
      tagline: "把语法、调试与 JDK 文档连成一条能交付的后端学习路线",
      summary: "Java 不是一张语法清单，而是一条从“读懂代码”到“交付可维护程序”的路线。这里用真实 javac 判题、50 课系统资料和 JDK 26 文档，把语法、调试、API 与工程视角串起来。",
      stats: [
        ["50", "课系统课程"],
        ["219", "道改错题"],
        ["54", "道输出实现"],
        ["4,980", "个 JDK 类型"]
      ],
      pathTitle: "推荐学习路线",
      path: [
        ["01", "先补语言底座", "变量、类型、分支、循环、数组、方法与对象，先能独立写出完整的 Main.java。"],
        ["02", "用改错练阅读", "219 道带 bug 程序：先复现症状，再做最小修复，最后用用例确认没有回归。"],
        ["03", "建工程框架", "50 课覆盖集合、IO、异常、并发、网络、反射与 JVM，把零散语法放进真实模块。"],
        ["04", "查文档 + 输出", "用 JDK 26 全量 Javadoc 查签名，再用 54 道输出题训练从空白到可运行。"]
      ],
      fit: "有任意语言基础、想补 Java 工程能力的学生；准备 AP CSA、校内 Java 课或后端项目的人。零基础也能从 Java 基础入口开始。",
      outcomes: [
        "能独立定位并修复常见 Java bug",
        "能从零写出带输入输出的小程序",
        "会用 Javadoc 查类、方法和异常",
        "理解集合、异常、并发与 JVM 的基本边界"
      ],
      relations: [
        ["Python", "#C8A976", "Python 适合快速验证算法；把同一逻辑翻成 Java 时，重点练类型、接口和异常。"],
        ["C++", "#7EA6FF", "C++ 让你看清内存与性能代价；Java 用 GC 换取工程效率，二者适合对照学习。"],
        ["JavaScript", "#F7DF1E", "JS 做浏览器交互，Java 做服务端接口；两边都能练事件、异步和 API 约定。"],
        ["AI", "#C4B5FD", "AI 常用 Python 训练模型；生产侧可用 Java 接入模型 API，补上服务治理与并发。"]
      ],
      start: { label: "从 Java 基础开始", href: "./java-basics.html" }
    },
    python: {
      key: "PYTHON",
      accent: "#C8A976",
      title: "Python 学科简介",
      tagline: "用最少的语法摩擦，把想法快速跑成可验证的程序",
      summary: "Python 的强项不是“语法少”，而是反馈快：一个想法可以很快变成能运行、能验证的脚本。这条线用 84 个改错模板、60 道输出题和 76 节课程，把“会读、会改、会从零写”分开训练，再接到真实 API。",
      stats: [
        ["76", "节系统课程"],
        ["84", "个改错模板"],
        ["60", "道输出实现"],
        ["18,703", "条 API 索引"]
      ],
      pathTitle: "推荐学习路线",
      fit: "第一次学编程、准备数据/AI 方向，或想用脚本自动化日常工作的学生；有其他语言基础的人可以用它快速验证算法。",
      path: [
        ["01", "先建立输入输出直觉", "读 stdin、处理字符串、写 print，先把一段程序完整跑通。"],
        ["02", "用改错学边界", "84 个模板覆盖空值、类型、切片、循环和异常，先定位再最小修复。"],
        ["03", "系统课补工程", "五篇 18 章 76 节，从函数、数据结构到 HTTP/API、自动化和项目。"],
        ["04", "查官方 API", "18,700+ 条 3.13 索引，遇到模块或函数先查签名和示例。"]
      ],
      outcomes: [
        "能读写文件、处理字符串和常见数据结构",
        "能独立完成一个可运行的小脚本",
        "能读懂常见异常并定位出错位置",
        "能查官方文档接入第三方库"
      ],
      relations: [
        ["Java", "#8FB8FF", "Python 负责快速原型和数据处理；Java 负责强类型服务端，对照学能理解接口与工程约束。"],
        ["C++", "#7EA6FF", "C++ 关注性能和内存；Python 关注迭代速度，适合先用 Python 验证，再决定是否下沉。"],
        ["JavaScript", "#F7DF1E", "Python 做后端脚本/数据，JS 做前端交互；两者都练 JSON、异步和 API。"],
        ["AI", "#C4B5FD", "Python 是 AI 训练与实验的默认语言；本学科的 API 与脚本能力可直接迁移到模型实验。"]
      ],
      start: { label: "从 Python 课程开始", href: "./python-course.html" }
    },
    cpp: {
      key: "C++",
      accent: "#7EA6FF",
      title: "C++ 学科简介",
      tagline: "把性能、对象生命周期和编译期约束拆成可观察的实验",
      summary: "C++ 的难点不是语法数量，而是每个选择都有代价：值类别、对象生命周期、模板约束、内存序，都会在运行时或编译期显形。这里用 96 课、102 道改错、102 道输出题，以及 164 条站内 API，把这些代价拆成可观察的实验。",
      stats: [
        ["96", "课系统课程"],
        ["1,344", "个小节"],
        ["102", "道改错题"],
        ["102", "道输出实现"],
        ["164", "条站内 API"]
      ],
      pathTitle: "推荐学习路线",
      path: [
        ["01", "语言底座", "编译链接、类型、指针、引用、控制流，先让一个 .cpp 从源码走到进程。"],
        ["02", "对象与资源", "RAII、拷贝/移动、析构、异常安全，把“谁释放”写进类型。"],
        ["03", "泛型与 STL", "模板、concepts、容器、算法、ranges，理解编译期约束和迭代器失效。"],
        ["04", "并发、工程与查 API", "线程、锁、原子、内存序、CMake、测试与 ABI；签名和边界直接在站内 API 速查解决，最后用真实判题验证。"]
      ],
      fit: "想补系统/性能底层、准备竞赛或后端岗位的学生；已会一门语言、但说不清对象生命周期和内存代价的人。",
      outcomes: [
        "能解释常见 UB、悬垂指针和迭代器失效",
        "能写出 RAII 风格的资源管理",
        "能用模板和 STL 组织可维护代码",
        "能定位并发问题并给出最小复现",
        "能按头文件、签名和边界快速查标准库 API"
      ],
      relations: [
        ["Java", "#8FB8FF", "Java 用 GC 和引用简化内存；C++ 让你看清对象生命周期和性能代价，适合作为底层对照。"],
        ["Python", "#C8A976", "Python 快速验证算法；C++ 负责性能敏感实现，二者可以共用同一组测试用例。"],
        ["JavaScript", "#F7DF1E", "JS 负责界面，C++ 可通过 WASM 进入浏览器；两边都要理解线程/事件边界。"],
        ["AI", "#C4B5FD", "AI 训练多用 Python；C++ 常用于推理引擎、算子与嵌入式部署。"]
      ],
      start: { label: "从 C++ 课程开始", href: "./cpp-course.html" }
    },
    ai: {
      key: "AI",
      accent: "#C4B5FD",
      title: "AI 学科简介",
      tagline: "把模型、算力与真实应用放在同一张地图上",
      summary: "AI 学科不把“模型”和“算力”分开讲：不理解参数、上下文、基准和硬件，就很难判断一个模型能不能落地；反过来，只背硬件参数也解释不了模型行为。三条线互相补位。",
      stats: [
        ["3", "条学习线"],
        ["6", "种题型"],
        ["180", "道硬件题"],
        ["LLM", "模型全景"]
      ],
      pathTitle: "推荐学习路线",
      path: [
        ["01", "建立机器学习直觉", "监督/无监督、损失、过拟合、评估指标，先能判断一个任务该用什么方法。"],
        ["02", "读懂大模型", "参数规模、上下文、训练数据、基准、定价与协议，建立选型坐标。"],
        ["03", "补算力与硬件", "电路、数字逻辑、信号与通信，理解内存带宽、算力与部署约束。"],
        ["04", "接到真实场景", "用 Agent、MCP、RLHF 等工程概念，把模型能力映射成产品流程。"]
      ],
      fit: "对 AI 感兴趣但不想一上来啃公式；想理解模型差异、做选型、读懂论文和产品文档的人。",
      outcomes: [
        "能解释 ML/DL/LLM 的关键概念",
        "能比较模型参数、上下文、基准和价格",
        "能判断算力与硬件瓶颈",
        "能把模型能力映射到具体应用场景"
      ],
      relations: [
        ["Python", "#C8A976", "Python 是训练和实验入口，AI 学科提供模型与算力的判断框架。"],
        ["Java", "#8FB8FF", "Java 适合把模型 API 接进服务端，处理并发、鉴权和可观测性。"],
        ["C++", "#7EA6FF", "C++ 常用于推理引擎和算子优化，是把模型跑快的底层工具。"],
        ["JavaScript", "#F7DF1E", "JS 适合做 AI 产品的前端交互、流式输出和 Agent 界面。"]
      ],
      start: { label: "从 AI 题库开始", href: "./ai.html" }
    },
    javascript: {
      key: "JAVASCRIPT",
      accent: "#F7DF1E",
      title: "JavaScript 学科简介",
      tagline: "从能预测输出，到能交付一个真正跑得动的 Web 应用",
      summary: "JavaScript 的独特性在于它同时存在于浏览器和 Node：同一门语言既要处理 DOM、事件和渲染，也要处理模块、异步 I/O 和工程化。五条入口分别练阅读、修复、从零实现、预测结果和查 API。",
      stats: [
        ["76", "节课程"],
        ["84", "道改错"],
        ["66", "道输出"],
        ["54", "道练习"],
        ["97", "条 API"]
      ],
      pathTitle: "推荐学习路线",
      path: [
        ["01", "值与控制流", "类型、相等、作用域、函数、闭包，先能预测一段代码的结果。"],
        ["02", "对象与原型", "this、原型链、class、数组方法，理解 JS 的对象模型。"],
        ["03", "浏览器与异步", "DOM、事件、Promise、async/await、fetch，把页面和接口接起来。"],
        ["04", "工程与项目", "ESM、模块化、错误处理、测试与综合项目，形成可交付代码。"]
      ],
      fit: "想做 Web 前端/全栈、准备作品集或需要维护网页的学生；有其他语言基础的人可以重点补 this、闭包和异步。",
      outcomes: [
        "能预测常见 JS 代码的输出",
        "能定位作用域、异步和原型相关 bug",
        "能从零写 DOM 交互和接口请求",
        "能查 API 并组织可维护的模块"
      ],
      relations: [
        ["Java", "#8FB8FF", "Java 做服务端接口，JS 做浏览器端消费；两边都练 API 契约和错误处理。"],
        ["Python", "#C8A976", "Python 做脚本/数据，JS 做展示与交互；JSON 是两者共同的交换格式。"],
        ["C++", "#7EA6FF", "C++ 可通过 WASM 提供高性能模块，JS 负责调度和界面。"],
        ["AI", "#C4B5FD", "AI 应用常以 JS 做流式聊天、Agent 面板和可视化；Python 负责模型侧。"]
      ],
      start: { label: "从 JavaScript 课程开始", href: "./javascript-course.html" }
    }
  };

  function detectKey() {
    var file = (location.pathname.split("/").pop() || "").replace(".html", "");
    if (file === "cpp-hub") return "cpp";
    if (file === "javascript-hub") return "javascript";
    if (file === "ai-hub") return "ai";
    if (file === "python") return "python";
    if (file === "java-hub") return "java";
    return "";
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeLaunch(data) {
    var button = el("button", "si-launch");
    button.type = "button";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-label", data.title + "，打开查看");
    button.style.setProperty("--si-accent", data.accent);
    var mark = el("span", "si-launch-mark", "i");
    mark.setAttribute("aria-hidden", "true");
    var copy = el("span", "si-launch-copy");
    copy.appendChild(el("b", "", "学科简介"));
    copy.appendChild(el("small", "", "3 分钟了解这条学习路线"));
    var arrow = el("span", "si-launch-arrow", "→");
    arrow.setAttribute("aria-hidden", "true");
    button.appendChild(mark);
    button.appendChild(copy);
    button.appendChild(arrow);
    return button;
  }

  function makePath(data) {
    var list = el("ol", "si-path");
    data.path.forEach(function (item) {
      var step = el("li", "si-step");
      var no = el("span", "si-step-no", item[0]);
      var body = el("div");
      body.appendChild(el("h4", "", item[1]));
      body.appendChild(el("p", "", item[2]));
      step.appendChild(no);
      step.appendChild(body);
      list.appendChild(step);
    });
    return list;
  }

  function makeList(items) {
    var ul = el("ul", "si-list");
    items.forEach(function (text) {
      ul.appendChild(el("li", "", text));
    });
    return ul;
  }

  function makeRelations(data) {
    var grid = el("div", "si-rel-grid");
    data.relations.forEach(function (item) {
      var row = el("div", "si-rel-item");
      var tag = el("span", "si-rel-tag", item[0]);
      tag.style.setProperty("--si-tag", item[1]);
      row.appendChild(tag);
      row.appendChild(el("p", "", item[2]));
      grid.appendChild(row);
    });
    return grid;
  }

  function buildDialog(data) {
    var dialog = el("dialog", "si-dialog");
    dialog.style.setProperty("--si-accent", data.accent);
    dialog.setAttribute("aria-labelledby", "siTitle");
    var shell = el("div", "si-shell");
    shell.setAttribute("role", "document");

    var head = el("div", "si-head");
    head.appendChild(el("div", "si-kicker", "SUBJECT INTRO · " + data.key));
    var title = el("h2", "si-title", data.title);
    title.id = "siTitle";
    head.appendChild(title);
    head.appendChild(el("p", "si-tagline", data.tagline));
    var close = el("button", "si-x", "×");
    close.type = "button";
    close.setAttribute("data-si-close", "");
    close.setAttribute("aria-label", "关闭学科简介");
    head.appendChild(close);
    shell.appendChild(head);

    var body = el("div", "si-body");
    body.appendChild(el("p", "si-summary", data.summary));

    var stats = el("div", "si-stats");
    data.stats.forEach(function (pair) {
      var stat = el("div", "si-stat");
      var value = el("b");
      value.textContent = pair[0];
      stat.appendChild(value);
      stat.appendChild(el("span", "", pair[1]));
      stats.appendChild(stat);
    });
    body.appendChild(stats);

    var cols = el("div", "si-cols");
    var main = el("section");
    main.appendChild(el("h3", "si-sec-title", data.pathTitle));
    main.appendChild(makePath(data));
    cols.appendChild(main);

    var aside = el("div", "si-aside");
    var fitCard = el("div", "si-card");
    fitCard.appendChild(el("h3", "si-sec-title", "适合谁"));
    fitCard.appendChild(el("p", "", data.fit));
    aside.appendChild(fitCard);
    var outCard = el("div", "si-card");
    outCard.appendChild(el("h3", "si-sec-title", "学完能做什么"));
    outCard.appendChild(makeList(data.outcomes));
    aside.appendChild(outCard);
    cols.appendChild(aside);
    body.appendChild(cols);

    var rel = el("section", "si-rel");
    rel.appendChild(el("h3", "si-sec-title", "与其余学科的关系"));
    rel.appendChild(makeRelations(data));
    body.appendChild(rel);
    shell.appendChild(body);

    var foot = el("div", "si-foot");
    var go = el("button", "si-go");
    go.type = "button";
    go.setAttribute("data-si-go", "");
    go.appendChild(document.createTextNode(data.start.label));
    go.appendChild(el("span", "", "→"));
    foot.appendChild(go);
    var dismiss = el("button", "si-dismiss", "收起简介");
    dismiss.type = "button";
    dismiss.setAttribute("data-si-close", "");
    foot.appendChild(dismiss);
    shell.appendChild(foot);

    dialog.appendChild(shell);
    return dialog;
  }

  function init() {
    var data = DATA[detectKey()];
    if (!data || document.querySelector(".si-launch")) return;
    var hero = document.querySelector(".hub-hero") || document.querySelector(".hero");
    if (!hero) return;

    var launch = makeLaunch(data);
    var anchor = hero.querySelector(".hero-stats") || hero.querySelector("p") || hero.lastElementChild;
    if (anchor) anchor.insertAdjacentElement("afterend", launch);
    else hero.appendChild(launch);

    var dialog = buildDialog(data);
    document.body.appendChild(dialog);

    var lastTrigger = launch;
    var go = dialog.querySelector("[data-si-go]");
    go.addEventListener("click", function () {
      location.href = data.start.href;
    });

    function open() {
      lastTrigger = launch;
      dialog.showModal();
      document.documentElement.classList.add("si-lock");
      document.body.classList.add("si-lock");
      var closeButton = dialog.querySelector(".si-x");
      if (closeButton) setTimeout(function () { closeButton.focus(); }, 30);
    }
    function close() {
      if (dialog.open) dialog.close();
    }

    launch.addEventListener("click", open);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close();
    });
    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      close();
    });
    dialog.addEventListener("close", function () {
      document.documentElement.classList.remove("si-lock");
      document.body.classList.remove("si-lock");
      if (lastTrigger) lastTrigger.focus();
    });
    Array.prototype.forEach.call(dialog.querySelectorAll("[data-si-close]"), function (button) {
      button.addEventListener("click", close);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
