/* 自动生成：从 java-debug-lab.html 的 STUDY_JBASE 抽取 50 门课，按五篇 18 章编排。正文按需从 _features/java-courses/study-jbase-bodies/ 载入。 */
window.JAVA_COURSE_PARTS = [
  {
    "title": "基础语法与面向对象",
    "note": "变量、字符串、数组、控制流、方法与继承"
  },
  {
    "title": "核心 API 与异常",
    "note": "异常、包装类、泛型、现代 Java 与网络并发"
  },
  {
    "title": "JVM 与底层原理",
    "note": "对象布局、字节码、集合源码、并发与 GC"
  },
  {
    "title": "类型系统与函数式",
    "note": "现代 Java、泛型、集合、Stream、反射与 JVM"
  },
  {
    "title": "工程化与高级并发",
    "note": "类加载、JUC、设计模式、NIO、虚拟线程与 JIT"
  }
];

window.JAVA_COURSE_CHAPTERS = [
  {
    "id": "jch-01",
    "part": 1,
    "number": "01",
    "title": "变量、运算符与表达式",
    "summary": "先把 Java 的值、类型、字面量与运算规则打牢：八种基本类型、类型提升、强制转换、运算符优先级与短路求值。",
    "goals": [
      "整数字面量默认类型",
      "整数字面量进制",
      "字面量后缀",
      "数制与字面量"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c1",
        "title": "变量、基本类型与字面量",
        "level": "basic",
        "minutes": 48,
        "lead": "8 种基本类型、取值范围、字面量后缀与进制写法、类型提升规则。 本课同时并入《Head First Java》第 3、1 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 3 章（认清变量：基本类型与引用）；Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
        "sectionsCount": 34,
        "chars": 152791,
        "points": [
          "整数字面量默认类型",
          "整数字面量进制",
          "字面量后缀",
          "数制与字面量",
          "八进制换算",
          "类型提升",
          "类型提升规则",
          "强制类型转换",
          "显式类型转换",
          "数值取整",
          "Math 取整方法",
          "成员变量默认值",
          "变量初始化规则",
          "确定赋值分析",
          "变量分两种：基本类型（primitive）与对象引用（reference）",
          "声明变量必须给类型和名字，缺一不可",
          "Java 强类型：不会让你把长颈鹿引用塞进兔子变量",
          "Java 不允许把浮点数塞进整数变量，除非你显式转换",
          "基本类型保存的是值本身（简单位模式）",
          "八种基本类型：boolean、char、byte、short、int、long、float、double",
          "记忆口诀：Be Careful! Bears Shouldn’t Ingest Large Furry Dogs",
          "byte 8 位，范围 -128 到 127",
          "short 16 位，范围 -32768 到 32767",
          "int 32 位，范围约正负 21 亿",
          "Java 的目标是一次编写、到处运行（write once, run anywhere）",
          "Java 程序运行的四个步骤：写源文件、编译、产出字节码、JVM 执行",
          "源文件的扩展名是 .java，编译产物是 .class",
          "javac 是编译器程序，负责检查错误并产出字节码",
          "java 命令启动 JVM，后面跟的是类名而不是文件名",
          "字节码（bytecode）与平台无关，可被任何 JVM 解释执行",
          "JVM 是用软件实现的虚拟机，负责把字节码翻译成当前平台能执行的东西",
          "JVM 启动时在指定的类里寻找 public static void main(String[] args)",
          "一个应用至少要有一个类，至少要有一个 main，但不是每个类都要 main",
          "源文件放类、类里放方法、方法里放语句，这是 Java 的三段式结构"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 基本数据类型",
            "u": "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html"
          },
          {
            "t": "Oracle 教程 · 变量",
            "u": "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/variables.html"
          },
          {
            "t": "Head First Java 3E · 第 3 章（认清变量：基本类型与引用）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的基础题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c1.json"
      },
      {
        "id": "jb-c2",
        "title": "运算符与优先级",
        "level": "basic",
        "minutes": 39,
        "lead": "算术、比较、逻辑、位运算与优先级、结合性、短路求值。 本课同时并入《Head First Java》第 3、5、10 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 3 章（认清变量：基本类型与引用）；Head First Java 3E · 第 5 章（写一个程序：从需求到 Sink a Startup）；Head First Java 3E · 第 10 章（数字与静态：static、包装类与格式化）",
        "sectionsCount": 28,
        "chars": 93542,
        "points": [
          "运算符优先级",
          "运算符结合性",
          "运算顺序",
          "复合赋值运算符",
          "复合赋值的隐式强制转换",
          "自增运算符",
          "前置与后置自增",
          "前置自增",
          "后置自增的求值顺序",
          "后置自减",
          "赋值与自增",
          "表达式求值",
          "表达式求值顺序",
          "表达式副作用",
          "副作用与短路",
          "短路求值",
          "逻辑或短路",
          "三元条件运算符",
          "括号改变结合",
          "条件取反",
          "取模运算",
          "整数除法",
          "浮点运算",
          "浮点数表示误差",
          "浮点相等比较",
          "变量分两种：基本类型（primitive）与对象引用（reference）",
          "声明变量必须给类型和名字，缺一不可",
          "Java 强类型：不会让你把长颈鹿引用塞进兔子变量",
          "Java 不允许把浮点数塞进整数变量，除非你显式转换",
          "基本类型保存的是值本身（简单位模式）",
          "八种基本类型：boolean、char、byte、short、int、long、float、double",
          "记忆口诀：Be Careful! Bears Shouldn’t Ingest Large Furry Dogs",
          "byte 8 位，范围 -128 到 127",
          "short 16 位，范围 -32768 到 32767",
          "int 32 位，范围约正负 21 亿",
          "程序要从高层设计开始：先想清楚流程，再想需要哪些对象",
          "流程图里圆角是起止、矩形是动作、菱形是判断",
          "写一个类要写三样东西：prep code（伪代码）、test code（测试代码）、real code（真实代码）",
          "prep code 只描述做什么（what），不描述怎么做（how）",
          "prep code 包含三部分：实例变量声明、方法声明、方法逻辑",
          "测试代码要在实现之前写，这是测试驱动开发（TDD）的核心实践之一",
          "TDD 的要点：先写测试、迭代开发、保持简单、随时重构、测试全过才发布、不做需求外功能",
          "预写测试的价值是逼你想清楚方法到底该做什么",
          "SimpleStartup 用一行七个格子代替二维网格，一个 Startup 代替三个",
          "虚拟的行不需要在代码里存在，只需要保存 Startup 占用的那三个格子",
          "Math 类的构造器是 private，永远不能 new Math()",
          "Math 的方法不依赖任何实例变量，所以全部是 static",
          "static 方法用类名调用：Math.min(42,36)，不需要对象",
          "实例方法的行为取决于调用它的那个对象的实例变量值",
          "static 方法不能引用实例变量：non-static variable cannot be referenced from a static context",
          "static 方法也不能调用非静态方法，哪怕那个方法内部没有用到实例变量",
          "非静态方法可以自由访问 static 变量和 static 方法",
          "static 变量每个类只有一份，所有实例共享",
          "static 变量在类被加载时初始化，只在第一次加载时初始化一次",
          "static 变量在创建任何对象之前、在任何静态方法运行之前完成初始化"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 运算符",
            "u": "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/operators.html"
          },
          {
            "t": "Oracle 教程 · 赋值/算术/一元",
            "u": "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/op1.html"
          },
          {
            "t": "Oracle 教程 · 位运算与移位",
            "u": "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/op3.html"
          },
          {
            "t": "Head First Java 3E · 第 3 章（认清变量：基本类型与引用）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 5 章（写一个程序：从需求到 Sink a Startup）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 10 章（数字与静态：static、包装类与格式化）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的基础题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c2.json"
      }
    ]
  },
  {
    "id": "jch-02",
    "part": 1,
    "number": "02",
    "title": "字符串、数组与数据容器",
    "summary": "String 的不可变性、== 与 equals 的分界、数组边界与拷贝；从字符串和数组开始理解引用类型。",
    "goals": [
      "String 不可变性",
      "不可变对象",
      "字符串拼接与结合性",
      "字符串索引"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c3",
        "title": "字符串与 String 不可变性",
        "level": "basic",
        "minutes": 39,
        "lead": "字符串创建、不可变、常量池、== vs equals、常用方法与拼接。 本课同时并入《Head First Java》第 3、11、10 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 3 章（认清变量：基本类型与引用）；Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）；Head First Java 3E · 第 10 章（数字与静态：static、包装类与格式化）",
        "sectionsCount": 28,
        "chars": 95144,
        "points": [
          "String 不可变性",
          "不可变对象",
          "字符串拼接与结合性",
          "字符串索引",
          "字符串长度",
          "引用比较与内容比较",
          "值相等 vs 引用相等",
          "equals 与 ==",
          "equals 方法",
          "自动装箱与常量池",
          "substring 重载",
          "左闭右开区间",
          "半开区间",
          "char 与 int 互转",
          "char 类型与码值",
          "方法重载与字符编码",
          "标准输出方法",
          "控制台输出",
          "输出流位置",
          "变量分两种：基本类型（primitive）与对象引用（reference）",
          "声明变量必须给类型和名字，缺一不可",
          "Java 强类型：不会让你把长颈鹿引用塞进兔子变量",
          "Java 不允许把浮点数塞进整数变量，除非你显式转换",
          "基本类型保存的是值本身（简单位模式）",
          "八种基本类型：boolean、char、byte、short、int、long、float、double",
          "记忆口诀：Be Careful! Bears Shouldn’t Ingest Large Furry Dogs",
          "byte 8 位，范围 -128 到 127",
          "short 16 位，范围 -32768 到 32767",
          "int 32 位，范围约正负 21 亿",
          "ArrayList 的元素按加入顺序保存，本身不会自动排序",
          "ArrayList IS-A List，可以创建 ArrayList 并用 List 类型接收或返回",
          "Collections.sort(List) 按元素的自然序（natural ordering）升序排列",
          "Java 的自然序基于 Unicode：数字排在大写字母前，大写排在小写前",
          "打印对象会调用它的 toString()，打印集合会调用每个元素的 toString()",
          "Collections.sort 的签名是 <T extends Comparable<? super T>> void sort(List<T>)",
          "Song 不实现 Comparable，所以 List<Song> 传不进 sort，编译期就报错",
          "泛型让集合在编译期检查元素类型，而不是运行期才发现类型错",
          "ArrayList 文档里的 E 是「元素类型」的占位符，实例化时被真实类型替换",
          "泛型方法把 <T> 写在返回类型之前，例如 public <T extends Animal> void foo(List<T>)",
          "Math 类的构造器是 private，永远不能 new Math()",
          "Math 的方法不依赖任何实例变量，所以全部是 static",
          "static 方法用类名调用：Math.min(42,36)，不需要对象",
          "实例方法的行为取决于调用它的那个对象的实例变量值",
          "static 方法不能引用实例变量：non-static variable cannot be referenced from a static context",
          "static 方法也不能调用非静态方法，哪怕那个方法内部没有用到实例变量",
          "非静态方法可以自由访问 static 变量和 static 方法",
          "static 变量每个类只有一份，所有实例共享",
          "static 变量在类被加载时初始化，只在第一次加载时初始化一次",
          "static 变量在创建任何对象之前、在任何静态方法运行之前完成初始化"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 字符串",
            "u": "https://docs.oracle.com/javase/tutorial/java/data/strings.html"
          },
          {
            "t": "Oracle 教程 · 字符",
            "u": "https://docs.oracle.com/javase/tutorial/java/data/characters.html"
          },
          {
            "t": "Head First Java 3E · 第 3 章（认清变量：基本类型与引用）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 10 章（数字与静态：static、包装类与格式化）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的基础题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c3.json"
      },
      {
        "id": "jb-c4",
        "title": "数组与多维数组",
        "level": "basic",
        "minutes": 36,
        "lead": "声明创建、下标边界、length、拷贝、二维与锯齿数组。 本课同时并入《Head First Java》第 3、1 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 3 章（认清变量：基本类型与引用）；Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
        "sectionsCount": 26,
        "chars": 99719,
        "points": [
          "数组下标边界",
          "零基下标",
          "数组拷贝",
          "引用类型赋值",
          "浅拷贝与深拷贝",
          "二维数组是数组的数组",
          "第一维长度",
          "锯齿数组",
          "增强 for 的循环变量",
          "按下标访问",
          "数组遍历",
          "变量分两种：基本类型（primitive）与对象引用（reference）",
          "声明变量必须给类型和名字，缺一不可",
          "Java 强类型：不会让你把长颈鹿引用塞进兔子变量",
          "Java 不允许把浮点数塞进整数变量，除非你显式转换",
          "基本类型保存的是值本身（简单位模式）",
          "八种基本类型：boolean、char、byte、short、int、long、float、double",
          "记忆口诀：Be Careful! Bears Shouldn’t Ingest Large Furry Dogs",
          "byte 8 位，范围 -128 到 127",
          "short 16 位，范围 -32768 到 32767",
          "int 32 位，范围约正负 21 亿",
          "Java 的目标是一次编写、到处运行（write once, run anywhere）",
          "Java 程序运行的四个步骤：写源文件、编译、产出字节码、JVM 执行",
          "源文件的扩展名是 .java，编译产物是 .class",
          "javac 是编译器程序，负责检查错误并产出字节码",
          "java 命令启动 JVM，后面跟的是类名而不是文件名",
          "字节码（bytecode）与平台无关，可被任何 JVM 解释执行",
          "JVM 是用软件实现的虚拟机，负责把字节码翻译成当前平台能执行的东西",
          "JVM 启动时在指定的类里寻找 public static void main(String[] args)",
          "一个应用至少要有一个类，至少要有一个 main，但不是每个类都要 main",
          "源文件放类、类里放方法、方法里放语句，这是 Java 的三段式结构"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 数组",
            "u": "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html"
          },
          {
            "t": "Head First Java 3E · 第 3 章（认清变量：基本类型与引用）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的基础题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c4.json"
      }
    ]
  },
  {
    "id": "jch-03",
    "part": 1,
    "number": "03",
    "title": "控制流、方法与类",
    "summary": "if/switch/循环的边界，方法签名、重载、值传递，以及类、对象、构造器与初始化顺序。",
    "goals": [
      "if/else 控制流",
      "选择结构",
      "控制流",
      "控制流语法"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c5",
        "title": "控制流与循环边界",
        "level": "basic",
        "minutes": 57,
        "lead": "if/else、switch、三种循环、break/continue、off-by-one。 本课同时并入《Head First Java》第 1、5 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）；Head First Java 3E · 第 5 章（写一个程序：从需求到 Sink a Startup）",
        "sectionsCount": 41,
        "chars": 174248,
        "points": [
          "if/else 控制流",
          "选择结构",
          "控制流",
          "控制流语法",
          "switch 支持的类型",
          "switch 穿透",
          "switch(String) 实现",
          "while 执行顺序",
          "do-while 执行顺序",
          "循环结构",
          "循环跳转",
          "break 作用",
          "break 语义",
          "continue 语义",
          "for 结构",
          "外层循环次数",
          "嵌套循环计数",
          "循环不变量",
          "循环复杂度推导",
          "off-by-one 差一错误",
          "边界修正",
          "分支外语句",
          "大括号修正",
          "语句块与缩进",
          "语句块作用域",
          "不可达语句检查",
          "可达性分析",
          "Java 的目标是一次编写、到处运行（write once, run anywhere）",
          "Java 程序运行的四个步骤：写源文件、编译、产出字节码、JVM 执行",
          "源文件的扩展名是 .java，编译产物是 .class",
          "javac 是编译器程序，负责检查错误并产出字节码",
          "java 命令启动 JVM，后面跟的是类名而不是文件名",
          "字节码（bytecode）与平台无关，可被任何 JVM 解释执行",
          "JVM 是用软件实现的虚拟机，负责把字节码翻译成当前平台能执行的东西",
          "JVM 启动时在指定的类里寻找 public static void main(String[] args)",
          "一个应用至少要有一个类，至少要有一个 main，但不是每个类都要 main",
          "源文件放类、类里放方法、方法里放语句，这是 Java 的三段式结构",
          "程序要从高层设计开始：先想清楚流程，再想需要哪些对象",
          "流程图里圆角是起止、矩形是动作、菱形是判断",
          "写一个类要写三样东西：prep code（伪代码）、test code（测试代码）、real code（真实代码）",
          "prep code 只描述做什么（what），不描述怎么做（how）",
          "prep code 包含三部分：实例变量声明、方法声明、方法逻辑",
          "测试代码要在实现之前写，这是测试驱动开发（TDD）的核心实践之一",
          "TDD 的要点：先写测试、迭代开发、保持简单、随时重构、测试全过才发布、不做需求外功能",
          "预写测试的价值是逼你想清楚方法到底该做什么",
          "SimpleStartup 用一行七个格子代替二维网格，一个 Startup 代替三个",
          "虚拟的行不需要在代码里存在，只需要保存 Startup 占用的那三个格子"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 控制流语句",
            "u": "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html"
          },
          {
            "t": "Oracle 教程 · switch 语句",
            "u": "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/switch.html"
          },
          {
            "t": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 5 章（写一个程序：从需求到 Sink a Startup）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的基础题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c5.json"
      },
      {
        "id": "jb-c6",
        "title": "方法与参数传递",
        "level": "basic",
        "minutes": 48,
        "lead": "方法签名、重载与重写、值传递、返回值、作用域。 本课同时并入《Head First Java》第 4 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 4 章（方法使用实例变量：对象怎么行动）",
        "sectionsCount": 34,
        "chars": 146397,
        "points": [
          "方法签名",
          "方法重载",
          "重载解析优先级",
          "实参类型决定重载",
          "最近匹配原则",
          "方法重写",
          "值传递",
          "值拷贝",
          "参数传递机制",
          "引用与值",
          "作用域与返回值",
          "基本类型返回值",
          "返回值暂存",
          "返回值暂存机制",
          "表达式 vs 语句",
          "静态绑定 vs 动态绑定",
          "动态绑定与字段隐藏",
          "属性与方法的区别",
          "类描述对象知道什么（实例变量）和能做什么（方法）",
          "同一个类的所有实例拥有相同的方法代码，但行为可以因实例变量的值而不同",
          "调用者传的是实参（argument），方法接收的是形参（parameter）",
          "形参本质上就是一个局部变量，它有类型、有名字、只能在方法体里用",
          "方法有参数时，调用必须传值，且值的类型必须与形参匹配",
          "每个方法都必须声明返回类型，void 表示不返回任何值",
          "声明了非 void 返回类型，就必须返回兼容类型的值",
          "有多个参数时，实参按位置顺序落到形参上，类型与顺序都要对",
          "Java 只有值传递（pass-by-value），值传递就是复制传递",
          "传对象引用时，复制的是遥控器（引用），不是对象本身"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 类与对象",
            "u": "https://docs.oracle.com/javase/tutorial/java/javaOO/index.html"
          },
          {
            "t": "Oracle 教程 · 方法与返回值",
            "u": "https://docs.oracle.com/javase/tutorial/java/javaOO/returnvalue.html"
          },
          {
            "t": "Head First Java 3E · 第 4 章（方法使用实例变量：对象怎么行动）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的基础题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c6.json"
      },
      {
        "id": "jb-c7",
        "title": "类、对象与初始化顺序",
        "level": "intermediate",
        "minutes": 67,
        "lead": "构造器、this/super、初始化块与字段初始化的执行次序。 本课同时并入《Head First Java》第 2、9 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 2 章（走进对象村：类与对象）；Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
        "sectionsCount": 48,
        "chars": 242272,
        "points": [
          "对象创建流程",
          "构造器调用规则",
          "构造器首语句约束",
          "构造器复用",
          "初始化块执行顺序",
          "类初始化时机",
          "静态绑定 vs 动态绑定",
          "运行时类型信息",
          "成员访问语法",
          "引用类型赋值",
          "成员变量默认值",
          "把代码全写在 main 里属于过程式写法，不是面向对象",
          "面向对象让你能扩展程序而不必改动已经测试通过的旧代码",
          "规格永远会变，这是本章故事的核心前提",
          "过程式做法用一个大方法加 shapeNum 查表来区分不同图形",
          "面向对象做法为每种图形写一个类，各自实现自己的行为",
          "继承（inheritance）把共同特征抽到父类，子类自动获得",
          "父类叫 superclass，子类叫 subclass，子类继承父类的方法",
          "覆写（override）是子类重新定义继承来的方法以改变行为",
          "有了多态式的调用，程序只需对对象说「rotate」，不必关心它怎么转",
          "类（class）是对象的蓝图，告诉 JVM 如何造出这种对象",
          "JVM 关心两块内存：栈（Stack）与堆（Heap）",
          "栈存放方法调用与局部变量，堆存放所有对象",
          "实例变量声明在类里、方法外；局部变量声明在方法里或作为方法参数",
          "所有局部变量都活在栈上，位于它所属方法的栈帧（stack frame）里",
          "栈帧保存方法的状态：执行到哪一行、所有局部变量的值",
          "方法被调用时压栈（push），执行到右大括号时弹栈（pop）",
          "栈顶的方法永远是当前正在执行的方法",
          "局部变量的生命（life）指栈帧还在栈上；作用域（scope）指它所属的方法正在执行",
          "方法调用另一个方法时，局部变量还活着但不在作用域内，不能用",
          "对象引用变量如果声明为局部变量，引用本身在栈上"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 构造器",
            "u": "https://docs.oracle.com/javase/tutorial/java/javaOO/constructors.html"
          },
          {
            "t": "Oracle 教程 · 初始化字段",
            "u": "https://docs.oracle.com/javase/tutorial/java/javaOO/initial.html"
          },
          {
            "t": "Head First Java 3E · 第 2 章（走进对象村：类与对象）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c7.json"
      }
    ]
  },
  {
    "id": "jch-04",
    "part": 1,
    "number": "04",
    "title": "继承、多态与访问控制",
    "summary": "继承体系、重写与字段隐藏、abstract/interface、访问修饰符；理解编译期看类型、运行期看对象。",
    "goals": [
      "方法重写",
      "动态绑定与字段隐藏",
      "静态绑定 vs 动态绑定",
      "属性与方法的区别"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c8",
        "title": "继承、多态与访问控制",
        "level": "intermediate",
        "minutes": 64,
        "lead": "继承体系、重写规则、字段隐藏、抽象类与接口、修饰符。 本课同时并入《Head First Java》第 7、8 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 7 章（继承与多态：声明父类型，运行子类方法）；Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
        "sectionsCount": 46,
        "chars": 201318,
        "points": [
          "方法重写",
          "动态绑定与字段隐藏",
          "静态绑定 vs 动态绑定",
          "属性与方法的区别",
          "成员访问语法",
          "final 关键字",
          "static 关键字",
          "访问修饰符",
          "抽象类与接口",
          "枚举",
          "内部类与闭包",
          "继承用 extends 表示：class Dog extends Animal，Dog 称为子类，Animal 称为父类",
          "子类自动获得父类所有可继承成员，成员指实例变量与方法",
          "public 成员会被继承，private 成员不会被继承",
          "访问级别从最严到最松：private、default、protected、public",
          "把多个类的共同代码上提到父类，可以消除重复代码，改一处全部生效",
          "覆盖指子类重新定义继承来的方法，以改变或扩展其行为",
          "调用方法时 JVM 从最具体的类开始向上查找，第一个匹配实现生效，即最低者获胜",
          "编译期只看引用类型（左边），运行期只看堆上的真实对象类型（右边）",
          "多态允许引用类型与对象类型不同，前提是对象类型 IS-A 引用类型",
          "多态数组、多态参数、多态返回类型是多态落地的三个地方",
          "abstract 类不能被实例化，编译器会拦住任何 new 该类型的代码",
          "抽象类仍然可以作为引用类型使用，这是它存在的主要理由之一",
          "具体类指足够具体、可以被实例化的类",
          "抽象方法没有方法体，声明以分号结尾，不能带大括号",
          "类里只要有一个抽象方法，这个类就必须标成 abstract",
          "抽象类可以同时包含抽象方法和带实现的具体方法",
          "继承树上第一个具体子类必须实现所有抽象方法",
          "抽象子类可以把实现抽象方法的责任继续往下推",
          "实现抽象方法就是写一个签名兼容的非抽象方法，效果等同于覆盖",
          "Java 中每个类都直接或间接继承 java.lang.Object"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 继承",
            "u": "https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html"
          },
          {
            "t": "Oracle 教程 · 接口与继承",
            "u": "https://docs.oracle.com/javase/tutorial/java/IandI/index.html"
          },
          {
            "t": "Head First Java 3E · 第 7 章（继承与多态：声明父类型，运行子类方法）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c8.json"
      }
    ]
  },
  {
    "id": "jch-05",
    "part": 2,
    "number": "05",
    "title": "异常处理与资源管理",
    "summary": "异常体系、try-catch-finally 执行顺序、受检与非受检异常、try-with-resources 与异常链。",
    "goals": [
      "异常处理结构",
      "异常处理流程",
      "异常匹配顺序",
      "运行时异常"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c9",
        "title": "异常处理",
        "level": "intermediate",
        "minutes": 39,
        "lead": "异常体系、try-catch-finally 执行顺序、受检与非受检、try-with-resources。 本课同时并入《Head First Java》第 13 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 13 章（异常处理：当事情一定会出错）",
        "sectionsCount": 28,
        "chars": 115350,
        "points": [
          "异常处理结构",
          "异常处理流程",
          "异常匹配顺序",
          "运行时异常",
          "finally 执行时机",
          "return 语义",
          "返回值暂存",
          "返回值暂存机制",
          "有界类型参数",
          "受检异常与非受检异常",
          "异常（exception）是运行时「方法失败」的正式通知机制，不是给代码 bug 用的补丁",
          "bug 应该在开发期修掉；异常处理针对的是你无法保证成功的外部条件（文件、服务器、设备）",
          "一个方法要在声明里用 throws 告诉调用者它可能抛出哪些受检异常",
          "调用一个声明了受检异常的方法时，编译器强制你必须「处理或声明」（handle or declare）",
          "try 块放有风险的调用；catch 块放失败后的补救代码",
          "catch 的参数就是一个对象引用，写法和方法参数一样：catch(MidiUnavailableException e)",
          "catch 的类型必须能装下真正被抛出的那个异常对象，否则编译不通过",
          "异常是对象，都继承自 Throwable；Exception 是它的子类",
          "Throwable 提供 getMessage() 与 printStackTrace() 两个关键方法",
          "抛异常用 throw new XxxException()，不是 throws；throws 只出现在方法签名上"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 异常",
            "u": "https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html"
          },
          {
            "t": "Java 语言规范 SE 17",
            "u": "https://docs.oracle.com/javase/specs/jls/se17/html/index.html"
          },
          {
            "t": "Head First Java 3E · 第 13 章（异常处理：当事情一定会出错）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c9.json"
      }
    ]
  },
  {
    "id": "jch-06",
    "part": 2,
    "number": "06",
    "title": "包装类、泛型与常用 API",
    "summary": "Integer 缓存与自动装拆箱、类型擦除、集合框架，以及 Scanner、Arrays、Math、StringBuilder、printf、BigDecimal。",
    "goals": [
      "Integer 缓存池",
      "自动装箱与常量池",
      "引用比较与内容比较",
      "值相等 vs 引用相等"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c10",
        "title": "包装类、装箱与泛型",
        "level": "intermediate",
        "minutes": 49,
        "lead": "Integer 缓存、自动装拆箱、泛型擦除与集合框架。 本课同时并入《Head First Java》第 10、11 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 10 章（数字与静态：static、包装类与格式化）；Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
        "sectionsCount": 35,
        "chars": 145697,
        "points": [
          "Integer 缓存池",
          "自动装箱与常量池",
          "引用比较与内容比较",
          "值相等 vs 引用相等",
          "泛型实现机制",
          "类型擦除",
          "类型检查顺序",
          "有界类型参数",
          "Iterator.remove",
          "fail-fast 机制",
          "迭代器一致性校验",
          "Math 类的构造器是 private，永远不能 new Math()",
          "Math 的方法不依赖任何实例变量，所以全部是 static",
          "static 方法用类名调用：Math.min(42,36)，不需要对象",
          "实例方法的行为取决于调用它的那个对象的实例变量值",
          "static 方法不能引用实例变量：non-static variable cannot be referenced from a static context",
          "static 方法也不能调用非静态方法，哪怕那个方法内部没有用到实例变量",
          "非静态方法可以自由访问 static 变量和 static 方法",
          "static 变量每个类只有一份，所有实例共享",
          "static 变量在类被加载时初始化，只在第一次加载时初始化一次",
          "static 变量在创建任何对象之前、在任何静态方法运行之前完成初始化",
          "ArrayList 的元素按加入顺序保存，本身不会自动排序",
          "ArrayList IS-A List，可以创建 ArrayList 并用 List 类型接收或返回",
          "Collections.sort(List) 按元素的自然序（natural ordering）升序排列",
          "Java 的自然序基于 Unicode：数字排在大写字母前，大写排在小写前",
          "打印对象会调用它的 toString()，打印集合会调用每个元素的 toString()",
          "Collections.sort 的签名是 <T extends Comparable<? super T>> void sort(List<T>)",
          "Song 不实现 Comparable，所以 List<Song> 传不进 sort，编译期就报错",
          "泛型让集合在编译期检查元素类型，而不是运行期才发现类型错",
          "ArrayList 文档里的 E 是「元素类型」的占位符，实例化时被真实类型替换",
          "泛型方法把 <T> 写在返回类型之前，例如 public <T extends Animal> void foo(List<T>)"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 自动装箱",
            "u": "https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html"
          },
          {
            "t": "Oracle 教程 · 泛型",
            "u": "https://docs.oracle.com/javase/tutorial/java/generics/index.html"
          },
          {
            "t": "Head First Java 3E · 第 10 章（数字与静态：static、包装类与格式化）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c10.json"
      },
      {
        "id": "jb-c11",
        "title": "常用 API、GUI 与 Swing 工程实践",
        "level": "intermediate",
        "minutes": 123,
        "lead": "Scanner、Arrays、Math、StringBuilder、printf、BigDecimal 与代码审查方法。 本课同时并入《Head First Java》第 6、14、15、5 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 6 章（认识 Java API：ArrayList 与类库）；Head First Java 3E · 第 14 章（走进 GUI：窗口、按钮、事件与自绘面板）；Head First Java 3E · 第 15 章（用好 Swing：布局管理器与常用组件） 等 4 章",
        "sectionsCount": 88,
        "chars": 443486,
        "points": [
          "控制台输出",
          "标准输出方法",
          "输出流位置",
          "Math 取整方法",
          "表达式 vs 语句",
          "综合代码审查",
          "调试方法论",
          "表达式求值",
          "语句块与缩进",
          "括号改变结合",
          "条件取反",
          "Java 自带几百个预先编译好的类，统称 Java 类库（Java API）",
          "上一章的 bug 根因：每次猜中都加一，不管这个格子之前是否已被打中",
          "真正的状态是「哪些格子已被打掉」，不是「打中了几次」",
          "修 bug 的三个候选方案：加 boolean 数组、命中格子改成 -1、删掉命中格子",
          "前两个方案都要遍历全部格子，逻辑还笨重；删格子最干净但数组不能变长",
          "ArrayList 是 Java 类库中的一个类，能动态增删元素",
          "ArrayList 是对象，用普通方法调用（点运算符），没有特殊语法",
          "new ArrayList 不需要指定大小，add 时自动扩容，remove 时自动收缩",
          "add(E e) 追加到末尾，add(int index, E e) 插入到指定位置",
          "remove(int index) 按下标删，remove(Object o) 删第一个匹配的对象",
          "JFrame 对象代表屏幕上的一个窗口，是容器；但组件不能直接加给它，要加到 content pane（内容面板）上",
          "content pane 可以理解成窗口的「玻璃」，JFrame 是窗框",
          "添加组件的四步：建 frame、建组件、add 到 content pane、setSize 加 setVisible",
          "setVisible(true) 忘写就什么都看不见，是最常见的「空窗口」原因",
          "setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE) 让关窗时程序真正退出",
          "Swing 组件都在 javax.swing 包；常见的有 JButton、JLabel、JCheckBox、JTextField、JTextArea、JList、JScrollPane、JTable",
          "Swing 组件几乎都继承 javax.swing.JComponent",
          "GUI 事件处理叫 event handling（事件处理），是 Swing 的核心机制",
          "事件源（event source）把用户动作翻译成事件对象，按钮是最典型的事件源",
          "每种事件类型都有配套的监听器接口（listener interface），如 ActionListener、MouseListener",
          "技术术语上「组件」叫 component（不做技术区分时也称 widget），它们几乎都继承 javax.swing.JComponent",
          "Swing 里几乎所有组件都能装别的组件，但惯例是把交互组件放进背景组件（容器）",
          "JPanel 通常当背景容器用，但它自己也能交互，也能注册鼠标键盘事件",
          "布局管理器（layout manager）是控制组件大小与位置的 Java 对象",
          "布局管理器几乎总是关联在背景组件（容器）上，控制「被添加进去」的那一层组件",
          "控制层级只有一层：Panel A 的布局管理器管不到 Panel B 里的按钮",
          "所谓「持有」就是「被 add 进来」，myPanel.add(button)",
          "布局管理器会先问每个组件「你希望多大」，即 preferred size",
          "不同布局管理器对 preferred size 的尊重程度不同：全部、部分、或完全不理会",
          "BorderLayout 把容器分成五个区域：east、west、north、south、center，每个区域只能放一个组件",
          "程序要从高层设计开始：先想清楚流程，再想需要哪些对象",
          "流程图里圆角是起止、矩形是动作、菱形是判断",
          "写一个类要写三样东西：prep code（伪代码）、test code（测试代码）、real code（真实代码）",
          "prep code 只描述做什么（what），不描述怎么做（how）",
          "prep code 包含三部分：实例变量声明、方法声明、方法逻辑",
          "测试代码要在实现之前写，这是测试驱动开发（TDD）的核心实践之一",
          "TDD 的要点：先写测试、迭代开发、保持简单、随时重构、测试全过才发布、不做需求外功能",
          "预写测试的价值是逼你想清楚方法到底该做什么",
          "SimpleStartup 用一行七个格子代替二维网格，一个 Startup 代替三个",
          "虚拟的行不需要在代码里存在，只需要保存 Startup 占用的那三个格子"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 数字与格式化",
            "u": "https://docs.oracle.com/javase/tutorial/java/data/numberformat.html"
          },
          {
            "t": "Oracle 教程 · Arrays 类",
            "u": "https://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html"
          },
          {
            "t": "Head First Java 3E · 第 6 章（认识 Java API：ArrayList 与类库）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 14 章（走进 GUI：窗口、按钮、事件与自绘面板）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 15 章（用好 Swing：布局管理器与常用组件）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 5 章（写一个程序：从需求到 Sink a Startup）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c11.json"
      }
    ]
  },
  {
    "id": "jch-07",
    "part": 2,
    "number": "07",
    "title": "现代 Java 与网络并发入门",
    "summary": "var、record、文本块、switch 表达式、模式匹配、sealed、Optional、Stream，以及 SocketChannel 与线程基础。",
    "goals": [
      "var 局部变量类型推断",
      "record 记录类",
      "文本块",
      "switch 表达式"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c12",
        "title": "现代 Java（SE 17 / 21）",
        "level": "hard",
        "minutes": 48,
        "lead": "var、record、文本块、switch 表达式、模式匹配、sealed、Optional。 本课同时并入《Head First Java》第 12 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
        "sectionsCount": 34,
        "chars": 140147,
        "points": [
          "var 局部变量类型推断",
          "record 记录类",
          "文本块",
          "switch 表达式",
          "instanceof 模式匹配",
          "sealed 密封类",
          "Optional",
          "try-with-resources",
          "lambda 与函数式接口",
          "Stream 流",
          "forEach 接收 lambda，把「行为」而不是「数据对象」传进方法",
          "手写 for 循环容易犯的错：起点、终点、步长、拿错变量",
          "Java 8 引入 Streams API，让集合查询可以像配方一样组合",
          "stream() 把集合变成 Stream，是流水线的起点",
          "filter 只保留满足条件的元素，参数是 Predicate",
          "map 把元素从一种类型转成另一种类型，参数是 Function",
          "distinct 去掉重复元素，不需要参数",
          "sorted 按自然序排序，也可传 Comparator 自定义",
          "limit(n) 最多保留 n 个元素，skip(n) 跳过前 n 个",
          "takeWhile 在条件为真时继续处理，dropWhile 在条件为真时跳过"
        ],
        "links": [
          {
            "t": "Oracle · Java SE 17 新特性",
            "u": "https://docs.oracle.com/en/java/javase/17/language/index.html"
          },
          {
            "t": "Java 语言规范 SE 17",
            "u": "https://docs.oracle.com/javase/specs/jls/se17/html/index.html"
          },
          {
            "t": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c12.json"
      },
      {
        "id": "jb-c13",
        "title": "网络连接、并发与 JVM 入门",
        "level": "hard",
        "minutes": 38,
        "lead": "内存区域、GC 基础、类加载、线程与同步。 本课同时并入《Head First Java》第 17 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 17 章（建立连接：网络编程与多线程）",
        "sectionsCount": 27,
        "chars": 97711,
        "points": [
          "JVM 内存区域",
          "垃圾回收 GC",
          "类加载过程",
          "线程与 Runnable",
          "synchronized 与锁",
          "volatile 可见性",
          "线程池",
          "内存可见性",
          "happens-before",
          "客户端与服务器通过 Channel 通信，Channel 代表两个应用之间的连接",
          "客户端必须知道服务器在哪（IP 地址或主机名）和哪个端口（TCP 端口号）",
          "TCP 端口是 16 位无符号数，标识服务器上某个具体程序",
          "自己写的服务器用 1024 到 65535 之间的端口，书中聊天例子用 5000",
          "同一端口不能被两个程序同时绑定，否则抛 BindException",
          "建立连接：new InetSocketAddress(IP, port) 再 SocketChannel.open(address)",
          "SocketChannel 不用构造器创建，用静态 open() 方法",
          "读数据：Channels.newReader(channel, StandardCharsets.UTF_8) 得到 Reader，再链 BufferedReader",
          "写数据：Channels.newWriter(channel, UTF_8) 得到 Writer，再链 PrintWriter，用 print/println",
          "Reader 和 Writer 是字节流与字符流之间的桥；读写要用同一个字符集"
        ],
        "links": [
          {
            "t": "Oracle · JVM 调优指南",
            "u": "https://docs.oracle.com/en/java/javase/17/gctuning/"
          },
          {
            "t": "Oracle 教程 · 并发",
            "u": "https://docs.oracle.com/javase/tutorial/essential/concurrency/index.html"
          },
          {
            "t": "Head First Java 3E · 第 17 章（建立连接：网络编程与多线程）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c13.json"
      }
    ]
  },
  {
    "id": "jch-08",
    "part": 2,
    "number": "08",
    "title": "考点速查与全书复盘",
    "summary": "把最容易记混的 Java 规则、别名与高频考点集中成一张速查表，考前扫一遍。",
    "goals": [
      "综合代码审查",
      "调试方法论",
      "表达式 vs 语句",
      "条件取反"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c14",
        "title": "考点速查与全书复盘",
        "level": "intermediate",
        "minutes": 74,
        "lead": "把最容易记混的 Java 规则与别名集中成一张速查表，考前扫一遍。 本课同时并入《Head First Java》第 1、2、3、4、5、6、7、8、9、10、11、12、13、14、15、16、17、18 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）；Head First Java 3E · 第 2 章（走进对象村：类与对象）；Head First Java 3E · 第 3 章（认清变量：基本类型与引用） 等 18 章",
        "sectionsCount": 53,
        "chars": 170495,
        "points": [
          "综合代码审查",
          "调试方法论",
          "表达式 vs 语句",
          "条件取反",
          "括号改变结合",
          "最近匹配原则",
          "类型检查顺序",
          "静态绑定 vs 动态绑定",
          "返回值暂存机制",
          "确定赋值分析",
          "引用与值",
          "值拷贝",
          "循环不变量",
          "外层循环次数",
          "Java 的目标是一次编写、到处运行（write once, run anywhere）",
          "Java 程序运行的四个步骤：写源文件、编译、产出字节码、JVM 执行",
          "源文件的扩展名是 .java，编译产物是 .class",
          "javac 是编译器程序，负责检查错误并产出字节码",
          "java 命令启动 JVM，后面跟的是类名而不是文件名",
          "字节码（bytecode）与平台无关，可被任何 JVM 解释执行",
          "JVM 是用软件实现的虚拟机，负责把字节码翻译成当前平台能执行的东西",
          "JVM 启动时在指定的类里寻找 public static void main(String[] args)",
          "一个应用至少要有一个类，至少要有一个 main，但不是每个类都要 main",
          "源文件放类、类里放方法、方法里放语句，这是 Java 的三段式结构",
          "把代码全写在 main 里属于过程式写法，不是面向对象",
          "面向对象让你能扩展程序而不必改动已经测试通过的旧代码",
          "规格永远会变，这是本章故事的核心前提",
          "过程式做法用一个大方法加 shapeNum 查表来区分不同图形",
          "面向对象做法为每种图形写一个类，各自实现自己的行为",
          "继承（inheritance）把共同特征抽到父类，子类自动获得",
          "父类叫 superclass，子类叫 subclass，子类继承父类的方法",
          "覆写（override）是子类重新定义继承来的方法以改变行为",
          "有了多态式的调用，程序只需对对象说「rotate」，不必关心它怎么转",
          "类（class）是对象的蓝图，告诉 JVM 如何造出这种对象",
          "变量分两种：基本类型（primitive）与对象引用（reference）",
          "声明变量必须给类型和名字，缺一不可",
          "Java 强类型：不会让你把长颈鹿引用塞进兔子变量",
          "Java 不允许把浮点数塞进整数变量，除非你显式转换",
          "基本类型保存的是值本身（简单位模式）",
          "八种基本类型：boolean、char、byte、short、int、long、float、double",
          "记忆口诀：Be Careful! Bears Shouldn’t Ingest Large Furry Dogs",
          "byte 8 位，范围 -128 到 127",
          "short 16 位，范围 -32768 到 32767",
          "int 32 位，范围约正负 21 亿",
          "类描述对象知道什么（实例变量）和能做什么（方法）",
          "同一个类的所有实例拥有相同的方法代码，但行为可以因实例变量的值而不同",
          "调用者传的是实参（argument），方法接收的是形参（parameter）",
          "形参本质上就是一个局部变量，它有类型、有名字、只能在方法体里用",
          "方法有参数时，调用必须传值，且值的类型必须与形参匹配",
          "每个方法都必须声明返回类型，void 表示不返回任何值",
          "声明了非 void 返回类型，就必须返回兼容类型的值",
          "有多个参数时，实参按位置顺序落到形参上，类型与顺序都要对",
          "Java 只有值传递（pass-by-value），值传递就是复制传递",
          "传对象引用时，复制的是遥控器（引用），不是对象本身",
          "程序要从高层设计开始：先想清楚流程，再想需要哪些对象",
          "流程图里圆角是起止、矩形是动作、菱形是判断",
          "写一个类要写三样东西：prep code（伪代码）、test code（测试代码）、real code（真实代码）",
          "prep code 只描述做什么（what），不描述怎么做（how）",
          "prep code 包含三部分：实例变量声明、方法声明、方法逻辑",
          "测试代码要在实现之前写，这是测试驱动开发（TDD）的核心实践之一",
          "TDD 的要点：先写测试、迭代开发、保持简单、随时重构、测试全过才发布、不做需求外功能",
          "预写测试的价值是逼你想清楚方法到底该做什么",
          "SimpleStartup 用一行七个格子代替二维网格，一个 Startup 代替三个",
          "虚拟的行不需要在代码里存在，只需要保存 Startup 占用的那三个格子",
          "Java 自带几百个预先编译好的类，统称 Java 类库（Java API）",
          "上一章的 bug 根因：每次猜中都加一，不管这个格子之前是否已被打中",
          "真正的状态是「哪些格子已被打掉」，不是「打中了几次」",
          "修 bug 的三个候选方案：加 boolean 数组、命中格子改成 -1、删掉命中格子",
          "前两个方案都要遍历全部格子，逻辑还笨重；删格子最干净但数组不能变长",
          "ArrayList 是 Java 类库中的一个类，能动态增删元素",
          "ArrayList 是对象，用普通方法调用（点运算符），没有特殊语法",
          "new ArrayList 不需要指定大小，add 时自动扩容，remove 时自动收缩",
          "add(E e) 追加到末尾，add(int index, E e) 插入到指定位置",
          "remove(int index) 按下标删，remove(Object o) 删第一个匹配的对象",
          "继承用 extends 表示：class Dog extends Animal，Dog 称为子类，Animal 称为父类",
          "子类自动获得父类所有可继承成员，成员指实例变量与方法",
          "public 成员会被继承，private 成员不会被继承",
          "访问级别从最严到最松：private、default、protected、public",
          "把多个类的共同代码上提到父类，可以消除重复代码，改一处全部生效",
          "覆盖指子类重新定义继承来的方法，以改变或扩展其行为",
          "调用方法时 JVM 从最具体的类开始向上查找，第一个匹配实现生效，即最低者获胜",
          "编译期只看引用类型（左边），运行期只看堆上的真实对象类型（右边）",
          "多态允许引用类型与对象类型不同，前提是对象类型 IS-A 引用类型",
          "多态数组、多态参数、多态返回类型是多态落地的三个地方",
          "abstract 类不能被实例化，编译器会拦住任何 new 该类型的代码",
          "抽象类仍然可以作为引用类型使用，这是它存在的主要理由之一",
          "具体类指足够具体、可以被实例化的类",
          "抽象方法没有方法体，声明以分号结尾，不能带大括号",
          "类里只要有一个抽象方法，这个类就必须标成 abstract",
          "抽象类可以同时包含抽象方法和带实现的具体方法",
          "继承树上第一个具体子类必须实现所有抽象方法",
          "抽象子类可以把实现抽象方法的责任继续往下推",
          "实现抽象方法就是写一个签名兼容的非抽象方法，效果等同于覆盖",
          "Java 中每个类都直接或间接继承 java.lang.Object",
          "JVM 关心两块内存：栈（Stack）与堆（Heap）",
          "栈存放方法调用与局部变量，堆存放所有对象",
          "实例变量声明在类里、方法外；局部变量声明在方法里或作为方法参数",
          "所有局部变量都活在栈上，位于它所属方法的栈帧（stack frame）里",
          "栈帧保存方法的状态：执行到哪一行、所有局部变量的值",
          "方法被调用时压栈（push），执行到右大括号时弹栈（pop）",
          "栈顶的方法永远是当前正在执行的方法",
          "局部变量的生命（life）指栈帧还在栈上；作用域（scope）指它所属的方法正在执行",
          "方法调用另一个方法时，局部变量还活着但不在作用域内，不能用",
          "对象引用变量如果声明为局部变量，引用本身在栈上",
          "Math 类的构造器是 private，永远不能 new Math()",
          "Math 的方法不依赖任何实例变量，所以全部是 static",
          "static 方法用类名调用：Math.min(42,36)，不需要对象",
          "实例方法的行为取决于调用它的那个对象的实例变量值",
          "static 方法不能引用实例变量：non-static variable cannot be referenced from a static context",
          "static 方法也不能调用非静态方法，哪怕那个方法内部没有用到实例变量",
          "非静态方法可以自由访问 static 变量和 static 方法",
          "static 变量每个类只有一份，所有实例共享",
          "static 变量在类被加载时初始化，只在第一次加载时初始化一次",
          "static 变量在创建任何对象之前、在任何静态方法运行之前完成初始化",
          "ArrayList 的元素按加入顺序保存，本身不会自动排序",
          "ArrayList IS-A List，可以创建 ArrayList 并用 List 类型接收或返回",
          "Collections.sort(List) 按元素的自然序（natural ordering）升序排列",
          "Java 的自然序基于 Unicode：数字排在大写字母前，大写排在小写前",
          "打印对象会调用它的 toString()，打印集合会调用每个元素的 toString()",
          "Collections.sort 的签名是 <T extends Comparable<? super T>> void sort(List<T>)",
          "Song 不实现 Comparable，所以 List<Song> 传不进 sort，编译期就报错",
          "泛型让集合在编译期检查元素类型，而不是运行期才发现类型错",
          "ArrayList 文档里的 E 是「元素类型」的占位符，实例化时被真实类型替换",
          "泛型方法把 <T> 写在返回类型之前，例如 public <T extends Animal> void foo(List<T>)",
          "forEach 接收 lambda，把「行为」而不是「数据对象」传进方法",
          "手写 for 循环容易犯的错：起点、终点、步长、拿错变量",
          "Java 8 引入 Streams API，让集合查询可以像配方一样组合",
          "stream() 把集合变成 Stream，是流水线的起点",
          "filter 只保留满足条件的元素，参数是 Predicate",
          "map 把元素从一种类型转成另一种类型，参数是 Function",
          "distinct 去掉重复元素，不需要参数",
          "sorted 按自然序排序，也可传 Comparator 自定义",
          "limit(n) 最多保留 n 个元素，skip(n) 跳过前 n 个",
          "takeWhile 在条件为真时继续处理，dropWhile 在条件为真时跳过",
          "异常（exception）是运行时「方法失败」的正式通知机制，不是给代码 bug 用的补丁",
          "bug 应该在开发期修掉；异常处理针对的是你无法保证成功的外部条件（文件、服务器、设备）",
          "一个方法要在声明里用 throws 告诉调用者它可能抛出哪些受检异常",
          "调用一个声明了受检异常的方法时，编译器强制你必须「处理或声明」（handle or declare）",
          "try 块放有风险的调用；catch 块放失败后的补救代码",
          "catch 的参数就是一个对象引用，写法和方法参数一样：catch(MidiUnavailableException e)",
          "catch 的类型必须能装下真正被抛出的那个异常对象，否则编译不通过",
          "异常是对象，都继承自 Throwable；Exception 是它的子类",
          "Throwable 提供 getMessage() 与 printStackTrace() 两个关键方法",
          "抛异常用 throw new XxxException()，不是 throws；throws 只出现在方法签名上",
          "JFrame 对象代表屏幕上的一个窗口，是容器；但组件不能直接加给它，要加到 content pane（内容面板）上",
          "content pane 可以理解成窗口的「玻璃」，JFrame 是窗框",
          "添加组件的四步：建 frame、建组件、add 到 content pane、setSize 加 setVisible",
          "setVisible(true) 忘写就什么都看不见，是最常见的「空窗口」原因",
          "setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE) 让关窗时程序真正退出",
          "Swing 组件都在 javax.swing 包；常见的有 JButton、JLabel、JCheckBox、JTextField、JTextArea、JList、JScrollPane、JTable",
          "Swing 组件几乎都继承 javax.swing.JComponent",
          "GUI 事件处理叫 event handling（事件处理），是 Swing 的核心机制",
          "事件源（event source）把用户动作翻译成事件对象，按钮是最典型的事件源",
          "每种事件类型都有配套的监听器接口（listener interface），如 ActionListener、MouseListener",
          "技术术语上「组件」叫 component（不做技术区分时也称 widget），它们几乎都继承 javax.swing.JComponent",
          "Swing 里几乎所有组件都能装别的组件，但惯例是把交互组件放进背景组件（容器）",
          "JPanel 通常当背景容器用，但它自己也能交互，也能注册鼠标键盘事件",
          "布局管理器（layout manager）是控制组件大小与位置的 Java 对象",
          "布局管理器几乎总是关联在背景组件（容器）上，控制「被添加进去」的那一层组件",
          "控制层级只有一层：Panel A 的布局管理器管不到 Panel B 里的按钮",
          "所谓「持有」就是「被 add 进来」，myPanel.add(button)",
          "布局管理器会先问每个组件「你希望多大」，即 preferred size",
          "不同布局管理器对 preferred size 的尊重程度不同：全部、部分、或完全不理会",
          "BorderLayout 把容器分成五个区域：east、west、north、south、center，每个区域只能放一个组件",
          "序列化（serialization）把对象压平成字节流，用来保存对象状态；反序列化（deserialization）把字节流还原成堆上的对象",
          "对象的「状态」就是实例变量的值；行为存在类里，不参与保存",
          "只在 Java 程序之间传数据 → 用序列化；要给别的语言读 → 写带分隔符的纯文本",
          "连接流（connection stream）代表到文件、网络、控制台的连接，如 FileOutputStream、FileWriter",
          "链流（chain stream）不能自己连目标，必须挂在别的流上，如 ObjectOutputStream、BufferedWriter",
          "写序列化对象的四步：new FileOutputStream → new ObjectOutputStream 链上去 → writeObject → close",
          "关闭最上层流会自动关闭它下面的整条链；文件不存在时 FileOutputStream 会自动创建",
          "一次 writeObject 会保存整个对象图（object graph），包括实例变量引用的对象，逐层递归下去",
          "对象图里同一个对象只保存一份，反序列化时共享引用会被正确还原",
          "对象图里任何一个对象不可序列化，运行时就抛 NotSerializableException——序列化是全有或全无",
          "客户端与服务器通过 Channel 通信，Channel 代表两个应用之间的连接",
          "客户端必须知道服务器在哪（IP 地址或主机名）和哪个端口（TCP 端口号）",
          "TCP 端口是 16 位无符号数，标识服务器上某个具体程序",
          "自己写的服务器用 1024 到 65535 之间的端口，书中聊天例子用 5000",
          "同一端口不能被两个程序同时绑定，否则抛 BindException",
          "建立连接：new InetSocketAddress(IP, port) 再 SocketChannel.open(address)",
          "SocketChannel 不用构造器创建，用静态 open() 方法",
          "读数据：Channels.newReader(channel, StandardCharsets.UTF_8) 得到 Reader，再链 BufferedReader",
          "写数据：Channels.newWriter(channel, UTF_8) 得到 Writer，再链 PrintWriter，用 print/println",
          "Reader 和 Writer 是字节流与字符流之间的桥；读写要用同一个字符集",
          "并发问题的唯一根源：两个或更多线程访问同一个对象的同一份数据",
          "竞态条件（race condition）指多个线程同时修改同一份数据，结果依赖调度时序",
          "Ryan 和 Monica 的故事：各自先查余额再花钱，中间被插队就会透支",
          "检查余额 + 扣钱必须作为一个原子操作（atomic），不能被拆开",
          "这里的「原子」指不可分割，不是物理上的原子；想牛顿，别想爱因斯坦",
          "synchronized 加在方法声明上，或用在代码块上并指定一个对象",
          "synchronized 锁的是对象，不是方法，也不是代码块本身",
          "每个对象只有一把锁、一把钥匙；大部分时间锁是开着的，没人关心",
          "线程进入 synchronized 代码前必须先拿到该对象的钥匙",
          "线程一旦拿到钥匙，会一直持有到执行完整个 synchronized 方法或块"
        ],
        "links": [
          {
            "t": "Java 语言规范 SE 17",
            "u": "https://docs.oracle.com/javase/specs/jls/se17/html/index.html"
          },
          {
            "t": "Oracle 教程 · Java 语言基础",
            "u": "https://docs.oracle.com/javase/tutorial/java/index.html"
          },
          {
            "t": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 2 章（走进对象村：类与对象）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 3 章（认清变量：基本类型与引用）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 4 章（方法使用实例变量：对象怎么行动）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 5 章（写一个程序：从需求到 Sink a Startup）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 6 章（认识 Java API：ArrayList 与类库）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 7 章（继承与多态：声明父类型，运行子类方法）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 10 章（数字与静态：static、包装类与格式化）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 13 章（异常处理：当事情一定会出错）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 14 章（走进 GUI：窗口、按钮、事件与自绘面板）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 15 章（用好 Swing：布局管理器与常用组件）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 16 章（保存对象：序列化与文件 I/O）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 17 章（建立连接：网络编程与多线程）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c14.json"
      }
    ]
  },
  {
    "id": "jch-09",
    "part": 3,
    "number": "09",
    "title": "对象布局与方法调用",
    "summary": "对象头与压缩指针、字段重排与对齐，五种 invoke 指令、虚方法表、桥接方法与 invokedynamic。",
    "goals": [
      "对象头三段结构",
      "Mark Word 位域复用",
      "锁状态标志位",
      "压缩指针与寻址上限"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-x1",
        "title": "对象内存布局与 JOL 实测",
        "level": "intermediate",
        "minutes": 36,
        "lead": "对象头 Mark Word 与类型指针、压缩指针的寻址上限、字段重排规则、对齐填充、数组头差异，用 JOL 把对象大小算准。 本课同时并入《Head First Java》第 9 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
        "sectionsCount": 26,
        "chars": 91419,
        "points": [
          "对象头三段结构",
          "Mark Word 位域复用",
          "锁状态标志位",
          "压缩指针与寻址上限",
          "指针压缩悬崖",
          "字段重排规则",
          "对齐填充",
          "数组对象头",
          "JOL 实测",
          "对象大小估算",
          "包装类固定开销",
          "继承字段排列顺序",
          "JVM 关心两块内存：栈（Stack）与堆（Heap）",
          "栈存放方法调用与局部变量，堆存放所有对象",
          "实例变量声明在类里、方法外；局部变量声明在方法里或作为方法参数",
          "所有局部变量都活在栈上，位于它所属方法的栈帧（stack frame）里",
          "栈帧保存方法的状态：执行到哪一行、所有局部变量的值",
          "方法被调用时压栈（push），执行到右大括号时弹栈（pop）",
          "栈顶的方法永远是当前正在执行的方法",
          "局部变量的生命（life）指栈帧还在栈上；作用域（scope）指它所属的方法正在执行",
          "方法调用另一个方法时，局部变量还活着但不在作用域内，不能用",
          "对象引用变量如果声明为局部变量，引用本身在栈上"
        ],
        "links": [
          {
            "t": "OpenJDK · JOL 对象布局工具",
            "u": "https://openjdk.org/projects/code-tools/jol/"
          },
          {
            "t": "HotSpot 组 · 对象头与压缩指针说明",
            "u": "https://wiki.openjdk.org/display/HotSpot/CompressedOops"
          },
          {
            "t": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x1.json"
      },
      {
        "id": "jb-x2",
        "title": "方法调用与字节码指令",
        "level": "intermediate",
        "minutes": 38,
        "lead": "五种 invoke 指令的分工、虚方法表与接口方法表查找、桥接方法的来源、lambda 背后的 invokedynamic 与调用点。 本课同时并入《Head First Java》第 7、8 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 7 章（继承与多态：声明父类型，运行子类方法）；Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
        "sectionsCount": 27,
        "chars": 91235,
        "points": [
          "五种 invoke 指令",
          "invokevirtual 与虚方法表",
          "invokeinterface 查找开销",
          "invokespecial 场景",
          "invokestatic 与常量折叠",
          "invokedynamic 与调用点",
          "BootstrapMethods",
          "lambda 实现机制",
          "桥接方法",
          "协变返回类型",
          "javap 反汇编",
          "静态分派与动态分派",
          "继承用 extends 表示：class Dog extends Animal，Dog 称为子类，Animal 称为父类",
          "子类自动获得父类所有可继承成员，成员指实例变量与方法",
          "public 成员会被继承，private 成员不会被继承",
          "访问级别从最严到最松：private、default、protected、public",
          "把多个类的共同代码上提到父类，可以消除重复代码，改一处全部生效",
          "覆盖指子类重新定义继承来的方法，以改变或扩展其行为",
          "调用方法时 JVM 从最具体的类开始向上查找，第一个匹配实现生效，即最低者获胜",
          "编译期只看引用类型（左边），运行期只看堆上的真实对象类型（右边）",
          "多态允许引用类型与对象类型不同，前提是对象类型 IS-A 引用类型",
          "多态数组、多态参数、多态返回类型是多态落地的三个地方",
          "abstract 类不能被实例化，编译器会拦住任何 new 该类型的代码",
          "抽象类仍然可以作为引用类型使用，这是它存在的主要理由之一",
          "具体类指足够具体、可以被实例化的类",
          "抽象方法没有方法体，声明以分号结尾，不能带大括号",
          "类里只要有一个抽象方法，这个类就必须标成 abstract",
          "抽象类可以同时包含抽象方法和带实现的具体方法",
          "继承树上第一个具体子类必须实现所有抽象方法",
          "抽象子类可以把实现抽象方法的责任继续往下推",
          "实现抽象方法就是写一个签名兼容的非抽象方法，效果等同于覆盖",
          "Java 中每个类都直接或间接继承 java.lang.Object"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 反射与 Method 句柄",
            "u": "https://docs.oracle.com/javase/tutorial/reflect/index.html"
          },
          {
            "t": "JVM 规范 · 指令集",
            "u": "https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-6.html"
          },
          {
            "t": "Head First Java 3E · 第 7 章（继承与多态：声明父类型，运行子类方法）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x2.json"
      }
    ]
  },
  {
    "id": "jch-10",
    "part": 3,
    "number": "10",
    "title": "泛型擦除与集合源码",
    "summary": "类型擦除、PECS、桥方法，ArrayList 扩容、HashMap 哈希扰动与树化阈值、fail-fast 与并发容器。",
    "goals": [
      "类型擦除规则",
      "上界替换",
      "桥接方法",
      "PECS 原则"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-x3",
        "title": "泛型擦除之后的一切",
        "level": "hard",
        "minutes": 36,
        "lead": "擦除规则与上界替换、桥方法字节码、PECS 原则的数学理由、目标类型推断、泛型数组禁令与堆污染、递归泛型。 本课同时并入《Head First Java》第 11 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
        "sectionsCount": 26,
        "chars": 90635,
        "points": [
          "类型擦除规则",
          "上界替换",
          "桥接方法",
          "PECS 原则",
          "协变与逆变",
          "目标类型推断",
          "钻石运算符",
          "泛型数组禁令",
          "堆污染",
          "SafeVarargs",
          "递归泛型",
          "通配符捕获",
          "ArrayList 的元素按加入顺序保存，本身不会自动排序",
          "ArrayList IS-A List，可以创建 ArrayList 并用 List 类型接收或返回",
          "Collections.sort(List) 按元素的自然序（natural ordering）升序排列",
          "Java 的自然序基于 Unicode：数字排在大写字母前，大写排在小写前",
          "打印对象会调用它的 toString()，打印集合会调用每个元素的 toString()",
          "Collections.sort 的签名是 <T extends Comparable<? super T>> void sort(List<T>)",
          "Song 不实现 Comparable，所以 List<Song> 传不进 sort，编译期就报错",
          "泛型让集合在编译期检查元素类型，而不是运行期才发现类型错",
          "ArrayList 文档里的 E 是「元素类型」的占位符，实例化时被真实类型替换",
          "泛型方法把 <T> 写在返回类型之前，例如 public <T extends Animal> void foo(List<T>)"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 泛型",
            "u": "https://docs.oracle.com/javase/tutorial/java/generics/index.html"
          },
          {
            "t": "Oracle 教程 · 通配符",
            "u": "https://docs.oracle.com/javase/tutorial/java/generics/wildcards.html"
          },
          {
            "t": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x3.json"
      },
      {
        "id": "jb-x4",
        "title": "集合框架源码精读",
        "level": "hard",
        "minutes": 36,
        "lead": "ArrayList 的 1.5 倍扩容、HashMap 的哈希扰动与 8/6/64 三个阈值、resize 的高低链拆分、fail-fast 的 modCount、ConcurrentHashMap 的 CAS 加桶锁。 本课同时并入《Head First Java》第 11 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
        "sectionsCount": 26,
        "chars": 91916,
        "points": [
          "ArrayList 扩容公式",
          "懒初始化",
          "HashMap 哈希扰动",
          "容量为 2 的幂",
          "树化阈值 8",
          "退化阈值 6",
          "最小树化容量 64",
          "负载因子 0.75",
          "resize 高低链拆分",
          "fail-fast 与 modCount",
          "ConcurrentHashMap 演进",
          "CounterCell 计数",
          "ArrayList 的元素按加入顺序保存，本身不会自动排序",
          "ArrayList IS-A List，可以创建 ArrayList 并用 List 类型接收或返回",
          "Collections.sort(List) 按元素的自然序（natural ordering）升序排列",
          "Java 的自然序基于 Unicode：数字排在大写字母前，大写排在小写前",
          "打印对象会调用它的 toString()，打印集合会调用每个元素的 toString()",
          "Collections.sort 的签名是 <T extends Comparable<? super T>> void sort(List<T>)",
          "Song 不实现 Comparable，所以 List<Song> 传不进 sort，编译期就报错",
          "泛型让集合在编译期检查元素类型，而不是运行期才发现类型错",
          "ArrayList 文档里的 E 是「元素类型」的占位符，实例化时被真实类型替换",
          "泛型方法把 <T> 写在返回类型之前，例如 public <T extends Animal> void foo(List<T>)"
        ],
        "links": [
          {
            "t": "Java SE 17 API · HashMap",
            "u": "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/HashMap.html"
          },
          {
            "t": "Java SE 17 API · ArrayList",
            "u": "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ArrayList.html"
          },
          {
            "t": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x4.json"
      }
    ]
  },
  {
    "id": "jch-11",
    "part": 3,
    "number": "11",
    "title": "并发进阶与类加载",
    "summary": "JMM 与 happens-before、锁升级、CAS/AQS、ThreadLocal、CompletableFuture，以及双亲委派与栈帧。",
    "goals": [
      "JMM 抽象模型",
      "happens-before 八条",
      "锁升级路径",
      "偏向锁的撤销与废弃"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-x5",
        "title": "并发进阶：从 JMM 到 AQS",
        "level": "hard",
        "minutes": 41,
        "lead": "happens-before 八条规则、synchronized 锁升级路径与偏向锁的废弃、CAS 的 ABA 问题、AQS 的 state 与等待队列、ThreadLocal 泄漏、CompletableFuture 编排。 本课同时并入《Head First Java》第 18 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
        "sectionsCount": 29,
        "chars": 108382,
        "points": [
          "JMM 抽象模型",
          "happens-before 八条",
          "锁升级路径",
          "偏向锁的撤销与废弃",
          "CAS 与 ABA",
          "原子类体系",
          "AQS 原理",
          "Condition 等待队列",
          "ThreadLocal 弱引用",
          "内存泄漏成因",
          "CompletableFuture",
          "线程池参数",
          "并发问题的唯一根源：两个或更多线程访问同一个对象的同一份数据",
          "竞态条件（race condition）指多个线程同时修改同一份数据，结果依赖调度时序",
          "Ryan 和 Monica 的故事：各自先查余额再花钱，中间被插队就会透支",
          "检查余额 + 扣钱必须作为一个原子操作（atomic），不能被拆开",
          "这里的「原子」指不可分割，不是物理上的原子；想牛顿，别想爱因斯坦",
          "synchronized 加在方法声明上，或用在代码块上并指定一个对象",
          "synchronized 锁的是对象，不是方法，也不是代码块本身",
          "每个对象只有一把锁、一把钥匙；大部分时间锁是开着的，没人关心",
          "线程进入 synchronized 代码前必须先拿到该对象的钥匙",
          "线程一旦拿到钥匙，会一直持有到执行完整个 synchronized 方法或块"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 并发",
            "u": "https://docs.oracle.com/javase/tutorial/essential/concurrency/index.html"
          },
          {
            "t": "Java SE 17 API · CompletableFuture",
            "u": "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CompletableFuture.html"
          },
          {
            "t": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x5.json"
      },
      {
        "id": "jb-x6",
        "title": "类加载机制与 JVM 内存细节",
        "level": "hard",
        "minutes": 34,
        "lead": "双亲委派的实现与三种打破场景、自定义 ClassLoader、栈帧的四个部分与槽位复用、逃逸分析与标量替换、TLAB、直接内存。 本课同时并入《Head First Java》第 1 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
        "sectionsCount": 24,
        "chars": 88629,
        "points": [
          "类加载三阶段",
          "双亲委派实现",
          "SPI 打破委派",
          "Tomcat 类加载器",
          "自定义 ClassLoader",
          "栈帧结构",
          "槽位复用",
          "逃逸分析",
          "标量替换",
          "锁消除",
          "TLAB",
          "直接内存回收",
          "Java 的目标是一次编写、到处运行（write once, run anywhere）",
          "Java 程序运行的四个步骤：写源文件、编译、产出字节码、JVM 执行",
          "源文件的扩展名是 .java，编译产物是 .class",
          "javac 是编译器程序，负责检查错误并产出字节码",
          "java 命令启动 JVM，后面跟的是类名而不是文件名",
          "字节码（bytecode）与平台无关，可被任何 JVM 解释执行",
          "JVM 是用软件实现的虚拟机，负责把字节码翻译成当前平台能执行的东西",
          "JVM 启动时在指定的类里寻找 public static void main(String[] args)",
          "一个应用至少要有一个类，至少要有一个 main，但不是每个类都要 main",
          "源文件放类、类里放方法、方法里放语句，这是 Java 的三段式结构"
        ],
        "links": [
          {
            "t": "Oracle · JVM 内存管理",
            "u": "https://docs.oracle.com/en/java/javase/17/gctuning/"
          },
          {
            "t": "Java 虚拟机规范 · 类加载",
            "u": "https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-5.html"
          },
          {
            "t": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x6.json"
      }
    ]
  },
  {
    "id": "jch-12",
    "part": 3,
    "number": "12",
    "title": "垃圾回收与异常设计",
    "summary": "可达性分析、G1/ZGC、OOM 排查，以及异常包装、suppressed、try-with-resources 的字节码结构。",
    "goals": [
      "可达性分析",
      "GC Roots 枚举",
      "安全点与安全区域",
      "卡表与写屏障"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-x7",
        "title": "垃圾回收器深入与 OOM 排查",
        "level": "hard",
        "minutes": 36,
        "lead": "可达性分析与安全点、卡表与写屏障、G1 的 Region 与 Mixed GC、三色标记的漏标与 SATB、ZGC 染色指针、GC 日志字段与 OOM 定位。 本课同时并入《Head First Java》第 2、9 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 2 章（走进对象村：类与对象）；Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
        "sectionsCount": 26,
        "chars": 91219,
        "points": [
          "可达性分析",
          "GC Roots 枚举",
          "安全点与安全区域",
          "卡表与写屏障",
          "G1 Region",
          "Mixed GC",
          "三色标记",
          "漏标两条件",
          "SATB 与增量更新",
          "ZGC 染色指针",
          "GC 日志字段",
          "OOM 场景分类",
          "把代码全写在 main 里属于过程式写法，不是面向对象",
          "面向对象让你能扩展程序而不必改动已经测试通过的旧代码",
          "规格永远会变，这是本章故事的核心前提",
          "过程式做法用一个大方法加 shapeNum 查表来区分不同图形",
          "面向对象做法为每种图形写一个类，各自实现自己的行为",
          "继承（inheritance）把共同特征抽到父类，子类自动获得",
          "父类叫 superclass，子类叫 subclass，子类继承父类的方法",
          "覆写（override）是子类重新定义继承来的方法以改变行为",
          "有了多态式的调用，程序只需对对象说「rotate」，不必关心它怎么转",
          "类（class）是对象的蓝图，告诉 JVM 如何造出这种对象",
          "JVM 关心两块内存：栈（Stack）与堆（Heap）",
          "栈存放方法调用与局部变量，堆存放所有对象",
          "实例变量声明在类里、方法外；局部变量声明在方法里或作为方法参数",
          "所有局部变量都活在栈上，位于它所属方法的栈帧（stack frame）里",
          "栈帧保存方法的状态：执行到哪一行、所有局部变量的值",
          "方法被调用时压栈（push），执行到右大括号时弹栈（pop）",
          "栈顶的方法永远是当前正在执行的方法",
          "局部变量的生命（life）指栈帧还在栈上；作用域（scope）指它所属的方法正在执行",
          "方法调用另一个方法时，局部变量还活着但不在作用域内，不能用",
          "对象引用变量如果声明为局部变量，引用本身在栈上"
        ],
        "links": [
          {
            "t": "Oracle · G1 垃圾回收器调优",
            "u": "https://docs.oracle.com/en/java/javase/17/gctuning/garbage-first-g1-garbage-collector1.html"
          },
          {
            "t": "OpenJDK · ZGC 项目页",
            "u": "https://openjdk.org/projects/zgc/"
          },
          {
            "t": "Head First Java 3E · 第 2 章（走进对象村：类与对象）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x7.json"
      },
      {
        "id": "jb-x8",
        "title": "异常设计与资源管理细节",
        "level": "intermediate",
        "minutes": 42,
        "lead": "受检异常的设计取舍、cause 链与 suppressed、try-with-resources 编译后的嵌套结构、finally 与 return 的字节码真相。 本课同时并入《Head First Java》第 13 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 13 章（异常处理：当事情一定会出错）",
        "sectionsCount": 30,
        "chars": 130827,
        "points": [
          "受检异常取舍",
          "异常包装",
          "cause 链",
          "getRootCause",
          "suppressed 异常",
          "addSuppressed",
          "try-with-resources 字节码",
          "异常表",
          "finally 与 return",
          "返回值暂存",
          "fillInStackTrace 开销",
          "异常性能",
          "异常（exception）是运行时「方法失败」的正式通知机制，不是给代码 bug 用的补丁",
          "bug 应该在开发期修掉；异常处理针对的是你无法保证成功的外部条件（文件、服务器、设备）",
          "一个方法要在声明里用 throws 告诉调用者它可能抛出哪些受检异常",
          "调用一个声明了受检异常的方法时，编译器强制你必须「处理或声明」（handle or declare）",
          "try 块放有风险的调用；catch 块放失败后的补救代码",
          "catch 的参数就是一个对象引用，写法和方法参数一样：catch(MidiUnavailableException e)",
          "catch 的类型必须能装下真正被抛出的那个异常对象，否则编译不通过",
          "异常是对象，都继承自 Throwable；Exception 是它的子类",
          "Throwable 提供 getMessage() 与 printStackTrace() 两个关键方法",
          "抛异常用 throw new XxxException()，不是 throws；throws 只出现在方法签名上"
        ],
        "links": [
          {
            "t": "Oracle 教程 · 异常",
            "u": "https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html"
          },
          {
            "t": "Java SE 17 API · Throwable",
            "u": "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Throwable.html"
          },
          {
            "t": "Head First Java 3E · 第 13 章（异常处理：当事情一定会出错）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x8.json"
      }
    ]
  },
  {
    "id": "jch-13",
    "part": 4,
    "number": "13",
    "title": "现代 Java 实战与生产陷阱",
    "summary": "record/sealed/switch 的语义边界、Stream 惰性与短路、Optional 用法，以及 DCL、Integer 缓存、BigDecimal equals 等陷阱。",
    "goals": [
      "record 语义",
      "紧凑构造器",
      "record 与反射",
      "sealed 与 permits"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-x9",
        "title": "现代 Java 特性实战细节",
        "level": "intermediate",
        "minutes": 36,
        "lead": "record 的语义边界、sealed 的穷尽性、switch 表达式与 yield、文本块的缩进剥离规则、Stream 的惰性与短路、Optional 的正确姿势。 本课同时并入《Head First Java》第 12 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
        "sectionsCount": 26,
        "chars": 93662,
        "points": [
          "record 语义",
          "紧凑构造器",
          "record 与反射",
          "sealed 与 permits",
          "穷尽性检查",
          "switch 表达式",
          "yield 语义",
          "模式匹配",
          "文本块缩进",
          "转义与续行",
          "Stream 惰性",
          "Stream 短路",
          "forEach 接收 lambda，把「行为」而不是「数据对象」传进方法",
          "手写 for 循环容易犯的错：起点、终点、步长、拿错变量",
          "Java 8 引入 Streams API，让集合查询可以像配方一样组合",
          "stream() 把集合变成 Stream，是流水线的起点",
          "filter 只保留满足条件的元素，参数是 Predicate",
          "map 把元素从一种类型转成另一种类型，参数是 Function",
          "distinct 去掉重复元素，不需要参数",
          "sorted 按自然序排序，也可传 Comparator 自定义",
          "limit(n) 最多保留 n 个元素，skip(n) 跳过前 n 个",
          "takeWhile 在条件为真时继续处理，dropWhile 在条件为真时跳过"
        ],
        "links": [
          {
            "t": "Oracle · Java SE 17 语言新特性",
            "u": "https://docs.oracle.com/en/java/javase/17/language/index.html"
          },
          {
            "t": "Java SE 17 API · Optional",
            "u": "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Optional.html"
          },
          {
            "t": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x9.json"
      },
      {
        "id": "jb-x10",
        "title": "高频生产陷阱与面试辨析",
        "level": "intermediate",
        "minutes": 36,
        "lead": "双重检查锁为何必须 volatile、Integer 缓存边界与可调参数、字符串常量池与 intern、BigDecimal 的 equals 陷阱、SimpleDateFormat 的不安全、Arrays.asList 的固定长度。 本课同时并入《Head First Java》第 10、4、18 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 10 章（数字与静态：static、包装类与格式化）；Head First Java 3E · 第 4 章（方法使用实例变量：对象怎么行动）；Head First Java 3E · 第 18 章（并发问题与不可变数据）",
        "sectionsCount": 26,
        "chars": 91764,
        "points": [
          "双重检查锁",
          "指令重排",
          "半初始化对象",
          "Integer 缓存边界",
          "AutoBoxCacheMax",
          "字符串常量池",
          "intern 语义",
          "BigDecimal equals",
          "compareTo 语义",
          "SimpleDateFormat 线程安全",
          "DateTimeFormatter",
          "Arrays.asList 限制",
          "subList 视图",
          "拆箱空指针",
          "Math 类的构造器是 private，永远不能 new Math()",
          "Math 的方法不依赖任何实例变量，所以全部是 static",
          "static 方法用类名调用：Math.min(42,36)，不需要对象",
          "实例方法的行为取决于调用它的那个对象的实例变量值",
          "static 方法不能引用实例变量：non-static variable cannot be referenced from a static context",
          "static 方法也不能调用非静态方法，哪怕那个方法内部没有用到实例变量",
          "非静态方法可以自由访问 static 变量和 static 方法",
          "static 变量每个类只有一份，所有实例共享",
          "static 变量在类被加载时初始化，只在第一次加载时初始化一次",
          "static 变量在创建任何对象之前、在任何静态方法运行之前完成初始化",
          "类描述对象知道什么（实例变量）和能做什么（方法）",
          "同一个类的所有实例拥有相同的方法代码，但行为可以因实例变量的值而不同",
          "调用者传的是实参（argument），方法接收的是形参（parameter）",
          "形参本质上就是一个局部变量，它有类型、有名字、只能在方法体里用",
          "方法有参数时，调用必须传值，且值的类型必须与形参匹配",
          "每个方法都必须声明返回类型，void 表示不返回任何值",
          "声明了非 void 返回类型，就必须返回兼容类型的值",
          "有多个参数时，实参按位置顺序落到形参上，类型与顺序都要对",
          "Java 只有值传递（pass-by-value），值传递就是复制传递",
          "传对象引用时，复制的是遥控器（引用），不是对象本身",
          "并发问题的唯一根源：两个或更多线程访问同一个对象的同一份数据",
          "竞态条件（race condition）指多个线程同时修改同一份数据，结果依赖调度时序",
          "Ryan 和 Monica 的故事：各自先查余额再花钱，中间被插队就会透支",
          "检查余额 + 扣钱必须作为一个原子操作（atomic），不能被拆开",
          "这里的「原子」指不可分割，不是物理上的原子；想牛顿，别想爱因斯坦",
          "synchronized 加在方法声明上，或用在代码块上并指定一个对象",
          "synchronized 锁的是对象，不是方法，也不是代码块本身",
          "每个对象只有一把锁、一把钥匙；大部分时间锁是开着的，没人关心",
          "线程进入 synchronized 代码前必须先拿到该对象的钥匙",
          "线程一旦拿到钥匙，会一直持有到执行完整个 synchronized 方法或块"
        ],
        "links": [
          {
            "t": "Java 语言规范 SE 17",
            "u": "https://docs.oracle.com/javase/specs/jls/se17/html/index.html"
          },
          {
            "t": "Java SE 17 API · BigDecimal",
            "u": "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/math/BigDecimal.html"
          },
          {
            "t": "Head First Java 3E · 第 10 章（数字与静态：static、包装类与格式化）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 4 章（方法使用实例变量：对象怎么行动）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-x10.json"
      }
    ]
  },
  {
    "id": "jch-14",
    "part": 4,
    "number": "14",
    "title": "泛型、集合与异常工程",
    "summary": "泛型与类型擦除、HashMap/ConcurrentHashMap/TreeMap 源码视角、异常/断言/日志规范。",
    "goals": [
      "泛型",
      "类型擦除",
      "类型参数",
      "通配符"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c25",
        "title": "泛型与类型擦除",
        "level": "hard",
        "minutes": 35,
        "lead": "泛型的作用、类型擦除原理、通配符与 PECS 原则。 本课同时并入《Head First Java》第 11 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
        "sectionsCount": 25,
        "chars": 92908,
        "points": [
          "泛型",
          "类型擦除",
          "类型参数",
          "通配符",
          "上界 extends",
          "下界 super",
          "PECS",
          "桥接方法",
          "堆污染",
          "ArrayList 的元素按加入顺序保存，本身不会自动排序",
          "ArrayList IS-A List，可以创建 ArrayList 并用 List 类型接收或返回",
          "Collections.sort(List) 按元素的自然序（natural ordering）升序排列",
          "Java 的自然序基于 Unicode：数字排在大写字母前，大写排在小写前",
          "打印对象会调用它的 toString()，打印集合会调用每个元素的 toString()",
          "Collections.sort 的签名是 <T extends Comparable<? super T>> void sort(List<T>)",
          "Song 不实现 Comparable，所以 List<Song> 传不进 sort，编译期就报错",
          "泛型让集合在编译期检查元素类型，而不是运行期才发现类型错",
          "ArrayList 文档里的 E 是「元素类型」的占位符，实例化时被真实类型替换",
          "泛型方法把 <T> 写在返回类型之前，例如 public <T extends Animal> void foo(List<T>)"
        ],
        "links": [
          {
            "t": "Java 教程 · 泛型",
            "u": "https://docs.oracle.com/javase/tutorial/java/generics/index.html"
          },
          {
            "t": "Java 语言规范 · 类型擦除",
            "u": "https://docs.oracle.com/javase/specs/jls/se17/html/jls-4.html#jls-4.6"
          },
          {
            "t": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c25.json"
      },
      {
        "id": "jb-c26",
        "title": "集合框架源码视角",
        "level": "hard",
        "minutes": 36,
        "lead": "HashMap 哈希冲突与扩容、ConcurrentHashMap、红黑树 TreeMap 与 fail-fast。 本课同时并入《Head First Java》第 11 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
        "sectionsCount": 26,
        "chars": 88863,
        "points": [
          "HashMap",
          "哈希冲突",
          "拉链法",
          "负载因子",
          "红黑树树化",
          "ConcurrentHashMap",
          "TreeMap",
          "LinkedHashMap",
          "fail-fast",
          "modCount",
          "ArrayList 的元素按加入顺序保存，本身不会自动排序",
          "ArrayList IS-A List，可以创建 ArrayList 并用 List 类型接收或返回",
          "Collections.sort(List) 按元素的自然序（natural ordering）升序排列",
          "Java 的自然序基于 Unicode：数字排在大写字母前，大写排在小写前",
          "打印对象会调用它的 toString()，打印集合会调用每个元素的 toString()",
          "Collections.sort 的签名是 <T extends Comparable<? super T>> void sort(List<T>)",
          "Song 不实现 Comparable，所以 List<Song> 传不进 sort，编译期就报错",
          "泛型让集合在编译期检查元素类型，而不是运行期才发现类型错",
          "ArrayList 文档里的 E 是「元素类型」的占位符，实例化时被真实类型替换",
          "泛型方法把 <T> 写在返回类型之前，例如 public <T extends Animal> void foo(List<T>)"
        ],
        "links": [
          {
            "t": "JDK 源码 · HashMap",
            "u": "https://github.com/openjdk/jdk/blob/master/src/java.base/share/classes/java/util/HashMap.java"
          },
          {
            "t": "Java 教程 · 集合",
            "u": "https://docs.oracle.com/javase/tutorial/collections/index.html"
          },
          {
            "t": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c26.json"
      },
      {
        "id": "jb-c27",
        "title": "异常、断言与日志",
        "level": "intermediate",
        "minutes": 36,
        "lead": "受检与非受检异常、try-with-resources、自定义异常与日志规范。 本课同时并入《Head First Java》第 13 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 13 章（异常处理：当事情一定会出错）",
        "sectionsCount": 26,
        "chars": 93274,
        "points": [
          "受检异常",
          "非受检异常",
          "Error",
          "try-catch-finally",
          "try-with-resources",
          "throw throws",
          "自定义异常",
          "异常链",
          "断言 assert",
          "日志级别",
          "异常（exception）是运行时「方法失败」的正式通知机制，不是给代码 bug 用的补丁",
          "bug 应该在开发期修掉；异常处理针对的是你无法保证成功的外部条件（文件、服务器、设备）",
          "一个方法要在声明里用 throws 告诉调用者它可能抛出哪些受检异常",
          "调用一个声明了受检异常的方法时，编译器强制你必须「处理或声明」（handle or declare）",
          "try 块放有风险的调用；catch 块放失败后的补救代码",
          "catch 的参数就是一个对象引用，写法和方法参数一样：catch(MidiUnavailableException e)",
          "catch 的类型必须能装下真正被抛出的那个异常对象，否则编译不通过",
          "异常是对象，都继承自 Throwable；Exception 是它的子类",
          "Throwable 提供 getMessage() 与 printStackTrace() 两个关键方法",
          "抛异常用 throw new XxxException()，不是 throws；throws 只出现在方法签名上"
        ],
        "links": [
          {
            "t": "Java 教程 · 异常",
            "u": "https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html"
          },
          {
            "t": "SLF4J 手册",
            "u": "https://www.slf4j.org/manual.html"
          },
          {
            "t": "Head First Java 3E · 第 13 章（异常处理：当事情一定会出错）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c27.json"
      }
    ]
  },
  {
    "id": "jch-15",
    "part": 4,
    "number": "15",
    "title": "Stream、反射与 JVM 基础",
    "summary": "Stream 与函数式编程、注解/反射/动态代理，以及 JVM 内存区域、GC 算法与类加载机制。",
    "goals": [
      "Lambda",
      "函数式接口",
      "方法引用",
      "Stream"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c28",
        "title": "Stream API 与函数式编程",
        "level": "hard",
        "minutes": 38,
        "lead": "Lambda、函数式接口、Stream 中间/终止操作与并行流陷阱。 本课同时并入《Head First Java》第 11、12 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）；Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
        "sectionsCount": 27,
        "chars": 91056,
        "points": [
          "Lambda",
          "函数式接口",
          "方法引用",
          "Stream",
          "中间操作",
          "终止操作",
          "惰性求值",
          "Collectors",
          "并行流",
          "Optional",
          "ArrayList 的元素按加入顺序保存，本身不会自动排序",
          "ArrayList IS-A List，可以创建 ArrayList 并用 List 类型接收或返回",
          "Collections.sort(List) 按元素的自然序（natural ordering）升序排列",
          "Java 的自然序基于 Unicode：数字排在大写字母前，大写排在小写前",
          "打印对象会调用它的 toString()，打印集合会调用每个元素的 toString()",
          "Collections.sort 的签名是 <T extends Comparable<? super T>> void sort(List<T>)",
          "Song 不实现 Comparable，所以 List<Song> 传不进 sort，编译期就报错",
          "泛型让集合在编译期检查元素类型，而不是运行期才发现类型错",
          "ArrayList 文档里的 E 是「元素类型」的占位符，实例化时被真实类型替换",
          "泛型方法把 <T> 写在返回类型之前，例如 public <T extends Animal> void foo(List<T>)",
          "forEach 接收 lambda，把「行为」而不是「数据对象」传进方法",
          "手写 for 循环容易犯的错：起点、终点、步长、拿错变量",
          "Java 8 引入 Streams API，让集合查询可以像配方一样组合",
          "stream() 把集合变成 Stream，是流水线的起点",
          "filter 只保留满足条件的元素，参数是 Predicate",
          "map 把元素从一种类型转成另一种类型，参数是 Function",
          "distinct 去掉重复元素，不需要参数",
          "sorted 按自然序排序，也可传 Comparator 自定义",
          "limit(n) 最多保留 n 个元素，skip(n) 跳过前 n 个",
          "takeWhile 在条件为真时继续处理，dropWhile 在条件为真时跳过"
        ],
        "links": [
          {
            "t": "Java 教程 · Stream",
            "u": "https://docs.oracle.com/javase/tutorial/collections/streams/index.html"
          },
          {
            "t": "Java 文档 · Optional",
            "u": "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Optional.html"
          },
          {
            "t": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c28.json"
      },
      {
        "id": "jb-c29",
        "title": "注解、反射与动态代理",
        "level": "hard",
        "minutes": 36,
        "lead": "注解生命周期、反射 API、Class 对象与动态代理的实现原理。 本课同时并入《Head First Java》第 8 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
        "sectionsCount": 26,
        "chars": 90623,
        "points": [
          "注解",
          "Retention",
          "Target",
          "反射",
          "Class 对象",
          "Field Method Constructor",
          "动态代理",
          "InvocationHandler",
          "注解处理器",
          "abstract 类不能被实例化，编译器会拦住任何 new 该类型的代码",
          "抽象类仍然可以作为引用类型使用，这是它存在的主要理由之一",
          "具体类指足够具体、可以被实例化的类",
          "抽象方法没有方法体，声明以分号结尾，不能带大括号",
          "类里只要有一个抽象方法，这个类就必须标成 abstract",
          "抽象类可以同时包含抽象方法和带实现的具体方法",
          "继承树上第一个具体子类必须实现所有抽象方法",
          "抽象子类可以把实现抽象方法的责任继续往下推",
          "实现抽象方法就是写一个签名兼容的非抽象方法，效果等同于覆盖",
          "Java 中每个类都直接或间接继承 java.lang.Object"
        ],
        "links": [
          {
            "t": "Java 教程 · 反射",
            "u": "https://docs.oracle.com/javase/tutorial/reflect/index.html"
          },
          {
            "t": "Java 文档 · Proxy",
            "u": "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/reflect/Proxy.html"
          },
          {
            "t": "Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c29.json"
      },
      {
        "id": "jb-c30",
        "title": "JVM 内存与垃圾回收",
        "level": "hard",
        "minutes": 31,
        "lead": "运行时数据区、对象创建、GC  roots、分代收集与常见垃圾回收器。 本课同时并入《Head First Java》第 9 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
        "sectionsCount": 22,
        "chars": 99202,
        "points": [
          "程序计数器",
          "Java 虚拟机栈",
          "堆",
          "方法区",
          "元空间",
          "本地方法栈",
          "GC Roots",
          "可达性分析",
          "标记清除",
          "复制算法",
          "分代收集",
          "Serial GC",
          "G1",
          "ZGC",
          "Stop The World",
          "JVM 关心两块内存：栈（Stack）与堆（Heap）",
          "栈存放方法调用与局部变量，堆存放所有对象",
          "实例变量声明在类里、方法外；局部变量声明在方法里或作为方法参数",
          "所有局部变量都活在栈上，位于它所属方法的栈帧（stack frame）里",
          "栈帧保存方法的状态：执行到哪一行、所有局部变量的值",
          "方法被调用时压栈（push），执行到右大括号时弹栈（pop）",
          "栈顶的方法永远是当前正在执行的方法",
          "局部变量的生命（life）指栈帧还在栈上；作用域（scope）指它所属的方法正在执行",
          "方法调用另一个方法时，局部变量还活着但不在作用域内，不能用",
          "对象引用变量如果声明为局部变量，引用本身在栈上"
        ],
        "links": [
          {
            "t": "Oracle · GC 调优指南",
            "u": "https://docs.oracle.com/en/java/javase/17/gctuning/index.html"
          },
          {
            "t": "OpenJDK · G1",
            "u": "https://openjdk.org/jeps/159"
          },
          {
            "t": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c30.json"
      },
      {
        "id": "jb-c31",
        "title": "JVM 内存区域与 Java 内存模型",
        "level": "hard",
        "minutes": 29,
        "lead": "很多人把运行时数据区与内存模型混为一谈。本课讲清 JVM 的各块内存、对象的创建与布局、内存溢出，以及 happens-before、主内存与工作线程等并发内存语义。 本课同时并入《Head First Java》第 9、18 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）；Head First Java 3E · 第 18 章（并发问题与不可变数据）",
        "sectionsCount": 21,
        "chars": 94288,
        "points": [
          "运行时数据区",
          "程序计数器与虚拟机栈",
          "本地方法栈与堆",
          "方法区与元空间",
          "对象创建与内存布局",
          "对象访问定位",
          "OutOfMemoryError",
          "Java 内存模型 JMM",
          "主内存与工作内存",
          "happens-before 规则",
          "JVM 关心两块内存：栈（Stack）与堆（Heap）",
          "栈存放方法调用与局部变量，堆存放所有对象",
          "实例变量声明在类里、方法外；局部变量声明在方法里或作为方法参数",
          "所有局部变量都活在栈上，位于它所属方法的栈帧（stack frame）里",
          "栈帧保存方法的状态：执行到哪一行、所有局部变量的值",
          "方法被调用时压栈（push），执行到右大括号时弹栈（pop）",
          "栈顶的方法永远是当前正在执行的方法",
          "局部变量的生命（life）指栈帧还在栈上；作用域（scope）指它所属的方法正在执行",
          "方法调用另一个方法时，局部变量还活着但不在作用域内，不能用",
          "对象引用变量如果声明为局部变量，引用本身在栈上",
          "并发问题的唯一根源：两个或更多线程访问同一个对象的同一份数据",
          "竞态条件（race condition）指多个线程同时修改同一份数据，结果依赖调度时序",
          "Ryan 和 Monica 的故事：各自先查余额再花钱，中间被插队就会透支",
          "检查余额 + 扣钱必须作为一个原子操作（atomic），不能被拆开",
          "这里的「原子」指不可分割，不是物理上的原子；想牛顿，别想爱因斯坦",
          "synchronized 加在方法声明上，或用在代码块上并指定一个对象",
          "synchronized 锁的是对象，不是方法，也不是代码块本身",
          "每个对象只有一把锁、一把钥匙；大部分时间锁是开着的，没人关心",
          "线程进入 synchronized 代码前必须先拿到该对象的钥匙",
          "线程一旦拿到钥匙，会一直持有到执行完整个 synchronized 方法或块"
        ],
        "links": [
          {
            "t": "Wikipedia · Java virtual machine",
            "u": "https://en.wikipedia.org/wiki/Java_virtual_machine"
          },
          {
            "t": "Wikipedia · Java Memory Model",
            "u": "https://en.wikipedia.org/wiki/Java_memory_model"
          },
          {
            "t": "Wikipedia · Garbage collection (computer science)",
            "u": "https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)"
          },
          {
            "t": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c31.json"
      },
      {
        "id": "jb-c32",
        "title": "垃圾回收：算法、收集器与调优",
        "level": "hard",
        "minutes": 31,
        "lead": "GC 自动回收堆内存。本课讲清如何判定对象存活、标记清除/复制/整理三大基础算法、分代收集理论、CMS 与 G1 等收集器，以及 GC 调优思路。 本课同时并入《Head First Java》第 9、2 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）；Head First Java 3E · 第 2 章（走进对象村：类与对象）",
        "sectionsCount": 22,
        "chars": 97142,
        "points": [
          "引用计数与可达性分析",
          "GC Roots",
          "引用类型强弱软弱虚",
          "标记清除算法",
          "复制算法与标记整理",
          "分代收集与新生代老年代",
          "CMS、G1、ZGC",
          "STW 与三色标记",
          "GC 日志与调优",
          "JVM 关心两块内存：栈（Stack）与堆（Heap）",
          "栈存放方法调用与局部变量，堆存放所有对象",
          "实例变量声明在类里、方法外；局部变量声明在方法里或作为方法参数",
          "所有局部变量都活在栈上，位于它所属方法的栈帧（stack frame）里",
          "栈帧保存方法的状态：执行到哪一行、所有局部变量的值",
          "方法被调用时压栈（push），执行到右大括号时弹栈（pop）",
          "栈顶的方法永远是当前正在执行的方法",
          "局部变量的生命（life）指栈帧还在栈上；作用域（scope）指它所属的方法正在执行",
          "方法调用另一个方法时，局部变量还活着但不在作用域内，不能用",
          "对象引用变量如果声明为局部变量，引用本身在栈上",
          "把代码全写在 main 里属于过程式写法，不是面向对象",
          "面向对象让你能扩展程序而不必改动已经测试通过的旧代码",
          "规格永远会变，这是本章故事的核心前提",
          "过程式做法用一个大方法加 shapeNum 查表来区分不同图形",
          "面向对象做法为每种图形写一个类，各自实现自己的行为",
          "继承（inheritance）把共同特征抽到父类，子类自动获得",
          "父类叫 superclass，子类叫 subclass，子类继承父类的方法",
          "覆写（override）是子类重新定义继承来的方法以改变行为",
          "有了多态式的调用，程序只需对对象说「rotate」，不必关心它怎么转",
          "类（class）是对象的蓝图，告诉 JVM 如何造出这种对象"
        ],
        "links": [
          {
            "t": "Wikipedia · Garbage collection (computer science)",
            "u": "https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)"
          },
          {
            "t": "Wikipedia · Java (programming language)",
            "u": "https://en.wikipedia.org/wiki/Java_(programming_language)"
          },
          {
            "t": "Wikipedia · Mark–sweep algorithm",
            "u": "https://en.wikipedia.org/wiki/Mark%E2%80%93sweep_algorithm"
          },
          {
            "t": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 2 章（走进对象村：类与对象）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c32.json"
      }
    ]
  },
  {
    "id": "jch-16",
    "part": 5,
    "number": "16",
    "title": "类加载、JUC 与类型系统",
    "summary": "类加载器、JUC 锁与 CAS、反射与注解、泛型擦除的类型安全；把底层机制串起来。",
    "goals": [
      "类加载生命周期",
      "加载、验证、准备、解析、初始化",
      "类初始化时机与 clinit",
      "类加载器层次"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c33",
        "title": "类加载机制与双亲委派",
        "level": "intermediate",
        "minutes": 28,
        "lead": "class 文件如何变成可运行的类。本课讲清类加载的七个阶段、类加载器体系、双亲委派模型、破坏委派的场景，以及自定义类加载器与 SPI。 本课同时并入《Head First Java》第 1、16 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）；Head First Java 3E · 第 16 章（保存对象：序列化与文件 I/O）",
        "sectionsCount": 20,
        "chars": 88564,
        "points": [
          "类加载生命周期",
          "加载、验证、准备、解析、初始化",
          "类初始化时机与 clinit",
          "类加载器层次",
          "双亲委派模型",
          "委派的好处与破坏委派",
          "线程上下文类加载器",
          "自定义类加载器与热部署",
          "Java 的目标是一次编写、到处运行（write once, run anywhere）",
          "Java 程序运行的四个步骤：写源文件、编译、产出字节码、JVM 执行",
          "源文件的扩展名是 .java，编译产物是 .class",
          "javac 是编译器程序，负责检查错误并产出字节码",
          "java 命令启动 JVM，后面跟的是类名而不是文件名",
          "字节码（bytecode）与平台无关，可被任何 JVM 解释执行",
          "JVM 是用软件实现的虚拟机，负责把字节码翻译成当前平台能执行的东西",
          "JVM 启动时在指定的类里寻找 public static void main(String[] args)",
          "一个应用至少要有一个类，至少要有一个 main，但不是每个类都要 main",
          "源文件放类、类里放方法、方法里放语句，这是 Java 的三段式结构",
          "序列化（serialization）把对象压平成字节流，用来保存对象状态；反序列化（deserialization）把字节流还原成堆上的对象",
          "对象的「状态」就是实例变量的值；行为存在类里，不参与保存",
          "只在 Java 程序之间传数据 → 用序列化；要给别的语言读 → 写带分隔符的纯文本",
          "连接流（connection stream）代表到文件、网络、控制台的连接，如 FileOutputStream、FileWriter",
          "链流（chain stream）不能自己连目标，必须挂在别的流上，如 ObjectOutputStream、BufferedWriter",
          "写序列化对象的四步：new FileOutputStream → new ObjectOutputStream 链上去 → writeObject → close",
          "关闭最上层流会自动关闭它下面的整条链；文件不存在时 FileOutputStream 会自动创建",
          "一次 writeObject 会保存整个对象图（object graph），包括实例变量引用的对象，逐层递归下去",
          "对象图里同一个对象只保存一份，反序列化时共享引用会被正确还原",
          "对象图里任何一个对象不可序列化，运行时就抛 NotSerializableException——序列化是全有或全无"
        ],
        "links": [
          {
            "t": "Wikipedia · Java Classloader",
            "u": "https://en.wikipedia.org/wiki/Java_Classloader"
          },
          {
            "t": "Wikipedia · Java bytecode",
            "u": "https://en.wikipedia.org/wiki/Java_bytecode"
          },
          {
            "t": "Wikipedia · Java virtual machine",
            "u": "https://en.wikipedia.org/wiki/Java_virtual_machine"
          },
          {
            "t": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 16 章（保存对象：序列化与文件 I/O）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c33.json"
      },
      {
        "id": "jb-c34",
        "title": "JUC 并发包：锁、CAS 与并发容器",
        "level": "hard",
        "minutes": 27,
        "lead": "java.util.concurrent 提供了强大的并发工具。本课讲清 synchronized 的锁升级、ReentrantLock、AQS、CAS 与原子类、ThreadLocal、线程池与并发容器。 本课同时并入《Head First Java》第 18 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
        "sectionsCount": 19,
        "chars": 87188,
        "points": [
          "synchronized 与锁升级",
          "偏向锁、轻量级锁、重量级锁",
          "ReentrantLock 与 AQS",
          "CAS 与 ABA 问题",
          "原子类与 LongAdder",
          "ThreadLocal 原理与内存泄漏",
          "线程池核心参数",
          "ConcurrentHashMap 与并发容器",
          "并发问题的唯一根源：两个或更多线程访问同一个对象的同一份数据",
          "竞态条件（race condition）指多个线程同时修改同一份数据，结果依赖调度时序",
          "Ryan 和 Monica 的故事：各自先查余额再花钱，中间被插队就会透支",
          "检查余额 + 扣钱必须作为一个原子操作（atomic），不能被拆开",
          "这里的「原子」指不可分割，不是物理上的原子；想牛顿，别想爱因斯坦",
          "synchronized 加在方法声明上，或用在代码块上并指定一个对象",
          "synchronized 锁的是对象，不是方法，也不是代码块本身",
          "每个对象只有一把锁、一把钥匙；大部分时间锁是开着的，没人关心",
          "线程进入 synchronized 代码前必须先拿到该对象的钥匙",
          "线程一旦拿到钥匙，会一直持有到执行完整个 synchronized 方法或块"
        ],
        "links": [
          {
            "t": "Wikipedia · Java concurrency",
            "u": "https://en.wikipedia.org/wiki/Java_concurrency"
          },
          {
            "t": "Wikipedia · Compare-and-swap",
            "u": "https://en.wikipedia.org/wiki/Compare-and-swap"
          },
          {
            "t": "Wikipedia · Reentrant lock",
            "u": "https://en.wikipedia.org/wiki/Reentrant_mutex"
          },
          {
            "t": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c34.json"
      },
      {
        "id": "jb-c35",
        "title": "反射与注解：运行时的元编程",
        "level": "intermediate",
        "minutes": 31,
        "lead": "反射让程序在运行时检查和修改自身，注解提供元数据。本课讲清 Class 对象、反射 API、注解的原理与保留策略，以及它们如何支撑框架。 本课同时并入《Head First Java》第 8 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
        "sectionsCount": 22,
        "chars": 96121,
        "points": [
          "Class 对象与类型信息",
          "获取 Class 的三种方式",
          "反射操作构造器、字段、方法",
          "setAccessible 与访问控制",
          "注解的定义与元注解",
          "Retention 保留策略",
          "Target 作用目标",
          "运行时注解解析",
          "反射的性能与局限",
          "abstract 类不能被实例化，编译器会拦住任何 new 该类型的代码",
          "抽象类仍然可以作为引用类型使用，这是它存在的主要理由之一",
          "具体类指足够具体、可以被实例化的类",
          "抽象方法没有方法体，声明以分号结尾，不能带大括号",
          "类里只要有一个抽象方法，这个类就必须标成 abstract",
          "抽象类可以同时包含抽象方法和带实现的具体方法",
          "继承树上第一个具体子类必须实现所有抽象方法",
          "抽象子类可以把实现抽象方法的责任继续往下推",
          "实现抽象方法就是写一个签名兼容的非抽象方法，效果等同于覆盖",
          "Java 中每个类都直接或间接继承 java.lang.Object"
        ],
        "links": [
          {
            "t": "Wikipedia · Java reflection",
            "u": "https://en.wikipedia.org/wiki/Java_reflection"
          },
          {
            "t": "Wikipedia · Java annotation",
            "u": "https://en.wikipedia.org/wiki/Java_annotation"
          },
          {
            "t": "Wikipedia · Metaprogramming",
            "u": "https://en.wikipedia.org/wiki/Metaprogramming"
          },
          {
            "t": "Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c35.json"
      },
      {
        "id": "jb-c36",
        "title": "泛型与类型擦除：编译期的类型安全",
        "level": "intermediate",
        "minutes": 38,
        "lead": "泛型让集合类型安全，但 Java 的泛型是擦除实现的。本课讲清泛型语法、类型擦除原理、桥方法、通配符与 PECS 原则、以及泛型的种种限制。 本课同时并入《Head First Java》第 11 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
        "sectionsCount": 27,
        "chars": 95475,
        "points": [
          "泛型的概念与好处",
          "类型参数与泛型类、泛型方法",
          "类型擦除与原始类型",
          "桥方法 bridge method",
          "通配符与上下界",
          "PECS 原则",
          "泛型与数组的矛盾",
          "不可实例化类型参数",
          "ArrayList 的元素按加入顺序保存，本身不会自动排序",
          "ArrayList IS-A List，可以创建 ArrayList 并用 List 类型接收或返回",
          "Collections.sort(List) 按元素的自然序（natural ordering）升序排列",
          "Java 的自然序基于 Unicode：数字排在大写字母前，大写排在小写前",
          "打印对象会调用它的 toString()，打印集合会调用每个元素的 toString()",
          "Collections.sort 的签名是 <T extends Comparable<? super T>> void sort(List<T>)",
          "Song 不实现 Comparable，所以 List<Song> 传不进 sort，编译期就报错",
          "泛型让集合在编译期检查元素类型，而不是运行期才发现类型错",
          "ArrayList 文档里的 E 是「元素类型」的占位符，实例化时被真实类型替换",
          "泛型方法把 <T> 写在返回类型之前，例如 public <T extends Animal> void foo(List<T>)"
        ],
        "links": [
          {
            "t": "Wikipedia · Generic programming",
            "u": "https://en.wikipedia.org/wiki/Generic_programming"
          },
          {
            "t": "Wikipedia · Type erasure",
            "u": "https://en.wikipedia.org/wiki/Type_erasure"
          },
          {
            "t": "Wikipedia · Java (programming language)",
            "u": "https://en.wikipedia.org/wiki/Java_(programming_language)"
          },
          {
            "t": "Head First Java 3E · 第 11 章（集合与泛型：从排序点到框架全景）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c36.json"
      }
    ]
  },
  {
    "id": "jch-17",
    "part": 5,
    "number": "17",
    "title": "Stream、异常、设计模式与模块化",
    "summary": "Stream 与 Lambda、异常体系与异常链、设计模式、JPMS/序列化/IO，完成工程化能力。",
    "goals": [
      "Lambda 表达式与函数式接口",
      "@FunctionalInterface",
      "方法引用",
      "Stream 的三大特征"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c37",
        "title": "Stream 与 Lambda：函数式编程原理",
        "level": "intermediate",
        "minutes": 36,
        "lead": "Stream 让集合处理链式、声明式。本课讲清 Lambda 的本质、函数式接口、Stream 的惰性求值与短路、中间与终止操作、并行流及常见陷阱。 本课同时并入《Head First Java》第 12 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
        "sectionsCount": 26,
        "chars": 95564,
        "points": [
          "Lambda 表达式与函数式接口",
          "@FunctionalInterface",
          "方法引用",
          "Stream 的三大特征",
          "中间操作与终止操作",
          "惰性求值与短路",
          "收集器 Collector",
          "并行流与线程安全",
          "Stream 常见陷阱",
          "forEach 接收 lambda，把「行为」而不是「数据对象」传进方法",
          "手写 for 循环容易犯的错：起点、终点、步长、拿错变量",
          "Java 8 引入 Streams API，让集合查询可以像配方一样组合",
          "stream() 把集合变成 Stream，是流水线的起点",
          "filter 只保留满足条件的元素，参数是 Predicate",
          "map 把元素从一种类型转成另一种类型，参数是 Function",
          "distinct 去掉重复元素，不需要参数",
          "sorted 按自然序排序，也可传 Comparator 自定义",
          "limit(n) 最多保留 n 个元素，skip(n) 跳过前 n 个",
          "takeWhile 在条件为真时继续处理，dropWhile 在条件为真时跳过"
        ],
        "links": [
          {
            "t": "Wikipedia · Java 8",
            "u": "https://en.wikipedia.org/wiki/Java_version_history#Java_SE_8"
          },
          {
            "t": "Wikipedia · Functional programming",
            "u": "https://en.wikipedia.org/wiki/Functional_programming"
          },
          {
            "t": "Wikipedia · Lambda calculus",
            "u": "https://en.wikipedia.org/wiki/Lambda_calculus"
          },
          {
            "t": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c37.json"
      },
      {
        "id": "jb-c38",
        "title": "异常体系与异常链：优雅地处理错误",
        "level": "basic",
        "minutes": 42,
        "lead": "异常是程序处理错误的标准机制。本课讲清 Error 与 Exception、受检与非受检异常、try-catch-finally、异常链与抑制异常、try-with-resources。 本课同时并入《Head First Java》第 13 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 13 章（异常处理：当事情一定会出错）",
        "sectionsCount": 30,
        "chars": 124819,
        "points": [
          "Throwable 体系",
          "Error 与 Exception",
          "受检异常与非受检异常",
          "try-catch-finally 执行顺序",
          "throw 与 throws",
          "异常链与 getCause",
          "initCause 与构造器传因",
          "抑制异常 suppressed",
          "try-with-resources",
          "异常处理最佳实践",
          "异常（exception）是运行时「方法失败」的正式通知机制，不是给代码 bug 用的补丁",
          "bug 应该在开发期修掉；异常处理针对的是你无法保证成功的外部条件（文件、服务器、设备）",
          "一个方法要在声明里用 throws 告诉调用者它可能抛出哪些受检异常",
          "调用一个声明了受检异常的方法时，编译器强制你必须「处理或声明」（handle or declare）",
          "try 块放有风险的调用；catch 块放失败后的补救代码",
          "catch 的参数就是一个对象引用，写法和方法参数一样：catch(MidiUnavailableException e)",
          "catch 的类型必须能装下真正被抛出的那个异常对象，否则编译不通过",
          "异常是对象，都继承自 Throwable；Exception 是它的子类",
          "Throwable 提供 getMessage() 与 printStackTrace() 两个关键方法",
          "抛异常用 throw new XxxException()，不是 throws；throws 只出现在方法签名上"
        ],
        "links": [
          {
            "t": "Wikipedia · Exception handling",
            "u": "https://en.wikipedia.org/wiki/Exception_handling"
          },
          {
            "t": "Wikipedia · Java syntax",
            "u": "https://en.wikipedia.org/wiki/Java_syntax"
          },
          {
            "t": "Wikipedia · Call stack",
            "u": "https://en.wikipedia.org/wiki/Call_stack"
          },
          {
            "t": "Head First Java 3E · 第 13 章（异常处理：当事情一定会出错）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的基础题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c38.json"
      },
      {
        "id": "jb-c39",
        "title": "设计模式：可复用设计的经验结晶",
        "level": "intermediate",
        "minutes": 38,
        "lead": "设计模式是针对常见问题的成熟解决方案。本课讲清七大设计原则与 GoF 二十三模式中最常用的若干种，并说明它们解决什么问题、如何用 Java 实现。 本课同时并入《Head First Java》第 7、8 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 7 章（继承与多态：声明父类型，运行子类方法）；Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
        "sectionsCount": 27,
        "chars": 91348,
        "points": [
          "设计模式概念与 GoF",
          "单一职责与开闭原则",
          "依赖倒置与里氏替换",
          "接口隔离与迪米特法则",
          "单例模式与线程安全",
          "工厂方法、抽象工厂、建造者",
          "代理、装饰、适配器",
          "观察者、策略、模板方法",
          "继承用 extends 表示：class Dog extends Animal，Dog 称为子类，Animal 称为父类",
          "子类自动获得父类所有可继承成员，成员指实例变量与方法",
          "public 成员会被继承，private 成员不会被继承",
          "访问级别从最严到最松：private、default、protected、public",
          "把多个类的共同代码上提到父类，可以消除重复代码，改一处全部生效",
          "覆盖指子类重新定义继承来的方法，以改变或扩展其行为",
          "调用方法时 JVM 从最具体的类开始向上查找，第一个匹配实现生效，即最低者获胜",
          "编译期只看引用类型（左边），运行期只看堆上的真实对象类型（右边）",
          "多态允许引用类型与对象类型不同，前提是对象类型 IS-A 引用类型",
          "多态数组、多态参数、多态返回类型是多态落地的三个地方",
          "abstract 类不能被实例化，编译器会拦住任何 new 该类型的代码",
          "抽象类仍然可以作为引用类型使用，这是它存在的主要理由之一",
          "具体类指足够具体、可以被实例化的类",
          "抽象方法没有方法体，声明以分号结尾，不能带大括号",
          "类里只要有一个抽象方法，这个类就必须标成 abstract",
          "抽象类可以同时包含抽象方法和带实现的具体方法",
          "继承树上第一个具体子类必须实现所有抽象方法",
          "抽象子类可以把实现抽象方法的责任继续往下推",
          "实现抽象方法就是写一个签名兼容的非抽象方法，效果等同于覆盖",
          "Java 中每个类都直接或间接继承 java.lang.Object"
        ],
        "links": [
          {
            "t": "Wikipedia · Design pattern",
            "u": "https://en.wikipedia.org/wiki/Design_pattern"
          },
          {
            "t": "Wikipedia · SOLID",
            "u": "https://en.wikipedia.org/wiki/SOLID"
          },
          {
            "t": "Wikipedia · Singleton pattern",
            "u": "https://en.wikipedia.org/wiki/Singleton_pattern"
          },
          {
            "t": "Head First Java 3E · 第 7 章（继承与多态：声明父类型，运行子类方法）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 8 章（接口与抽象类：从继承走向角色化设计）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c39.json"
      },
      {
        "id": "jb-c40",
        "title": "模块化、序列化与 IO：进阶基础设施",
        "level": "hard",
        "minutes": 31,
        "lead": "JPMS 模块化、Java 序列化机制与 IO 模型是大型系统的基础设施。本课讲清模块系统、序列化与反序列化风险、BIO/NIO/AIO 与零拷贝。 本课同时并入《Head First Java》第 16 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 16 章（保存对象：序列化与文件 I/O）",
        "sectionsCount": 22,
        "chars": 86595,
        "points": [
          "JPMS 模块系统",
          "module-info.java",
          "模块路径与可读性",
          "强封装与 opens",
          "序列化与 Serializable",
          "serialVersionUID",
          "transient 关键字",
          "反序列化安全",
          "BIO、NIO、AIO",
          "缓冲区、通道与零拷贝",
          "序列化（serialization）把对象压平成字节流，用来保存对象状态；反序列化（deserialization）把字节流还原成堆上的对象",
          "对象的「状态」就是实例变量的值；行为存在类里，不参与保存",
          "只在 Java 程序之间传数据 → 用序列化；要给别的语言读 → 写带分隔符的纯文本",
          "连接流（connection stream）代表到文件、网络、控制台的连接，如 FileOutputStream、FileWriter",
          "链流（chain stream）不能自己连目标，必须挂在别的流上，如 ObjectOutputStream、BufferedWriter",
          "写序列化对象的四步：new FileOutputStream → new ObjectOutputStream 链上去 → writeObject → close",
          "关闭最上层流会自动关闭它下面的整条链；文件不存在时 FileOutputStream 会自动创建",
          "一次 writeObject 会保存整个对象图（object graph），包括实例变量引用的对象，逐层递归下去",
          "对象图里同一个对象只保存一份，反序列化时共享引用会被正确还原",
          "对象图里任何一个对象不可序列化，运行时就抛 NotSerializableException——序列化是全有或全无"
        ],
        "links": [
          {
            "t": "Wikipedia · Java Platform Module System",
            "u": "https://en.wikipedia.org/wiki/Java_Platform_Module_System"
          },
          {
            "t": "Wikipedia · Java serialization",
            "u": "https://en.wikipedia.org/wiki/Java_serialization"
          },
          {
            "t": "Wikipedia · Non-blocking I/O",
            "u": "https://en.wikipedia.org/wiki/Non-blocking_I/O"
          },
          {
            "t": "Head First Java 3E · 第 16 章（保存对象：序列化与文件 I/O）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c40.json"
      }
    ]
  },
  {
    "id": "jch-18",
    "part": 5,
    "number": "18",
    "title": "高级并发、NIO 与 JIT",
    "summary": "虚拟线程、JMM、synchronized、AQS、CompletableFuture、NIO、类加载器、GC 调优与 JIT 分层编译。",
    "goals": [
      "平台线程与内核线程的一对一",
      "线程池方案的天花板",
      "虚拟线程是什么",
      "Continuation 与挂载卸载"
    ],
    "source": "Head First Java 3E · 18 章；Oracle Java 教程",
    "lessons": [
      {
        "id": "jb-c41",
        "title": "虚拟线程与结构化并发",
        "level": "intermediate",
        "minutes": 36,
        "lead": "JDK 21 把虚拟线程定为正式特性，它把「一个请求一个线程」这种最朴素的写法重新变成可行方案。本课讲清平台线程的瓶颈、虚拟线程的挂载与卸载、载体线程与调度、pinning 陷阱，以及结构化并发的作用域语义。 本课同时并入《Head First Java》第 17 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 17 章（建立连接：网络编程与多线程）",
        "sectionsCount": 26,
        "chars": 86835,
        "points": [
          "平台线程与内核线程的一对一",
          "线程池方案的天花板",
          "虚拟线程是什么",
          "Continuation 与挂载卸载",
          "载体线程与 ForkJoinPool",
          "虚拟线程的适用场景",
          "pinning 与 synchronized 陷阱",
          "结构化并发 StructuredTaskScope",
          "作用域关闭与异常传播",
          "客户端与服务器通过 Channel 通信，Channel 代表两个应用之间的连接",
          "客户端必须知道服务器在哪（IP 地址或主机名）和哪个端口（TCP 端口号）",
          "TCP 端口是 16 位无符号数，标识服务器上某个具体程序",
          "自己写的服务器用 1024 到 65535 之间的端口，书中聊天例子用 5000",
          "同一端口不能被两个程序同时绑定，否则抛 BindException",
          "建立连接：new InetSocketAddress(IP, port) 再 SocketChannel.open(address)",
          "SocketChannel 不用构造器创建，用静态 open() 方法",
          "读数据：Channels.newReader(channel, StandardCharsets.UTF_8) 得到 Reader，再链 BufferedReader",
          "写数据：Channels.newWriter(channel, UTF_8) 得到 Writer，再链 PrintWriter，用 print/println",
          "Reader 和 Writer 是字节流与字符流之间的桥；读写要用同一个字符集"
        ],
        "links": [
          {
            "t": "Oracle · JEP 444: Virtual Threads",
            "u": "https://openjdk.org/jeps/444"
          },
          {
            "t": "Oracle · JEP 453: Structured Concurrency",
            "u": "https://openjdk.org/jeps/453"
          },
          {
            "t": "Oracle Java Docs · Virtual Threads",
            "u": "https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html"
          },
          {
            "t": "Head First Java 3E · 第 17 章（建立连接：网络编程与多线程）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c41.json"
      },
      {
        "id": "jb-c42",
        "title": "Java 内存模型与 happens-before",
        "level": "hard",
        "minutes": 34,
        "lead": "volatile 为什么能保证可见性却不保证原子性？重排序到底在哪些层面发生？本课从 CPU 缓存与写缓冲讲起，讲清 JMM 的抽象模型、happens-before 八条规则、volatile 的语义与内存屏障，以及双重检查锁定的经典修复。 本课同时并入《Head First Java》第 18 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
        "sectionsCount": 24,
        "chars": 87654,
        "points": [
          "可见性问题的物理来源",
          "重排序的三种层次",
          "JMM 的抽象与主内存",
          "原子性、可见性、有序性",
          "happens-before 的定义",
          "程序顺序与监视器锁规则",
          "volatile 变量规则与传递性",
          "volatile 的语义与屏障",
          "双重检查锁定与安全发布",
          "并发问题的唯一根源：两个或更多线程访问同一个对象的同一份数据",
          "竞态条件（race condition）指多个线程同时修改同一份数据，结果依赖调度时序",
          "Ryan 和 Monica 的故事：各自先查余额再花钱，中间被插队就会透支",
          "检查余额 + 扣钱必须作为一个原子操作（atomic），不能被拆开",
          "这里的「原子」指不可分割，不是物理上的原子；想牛顿，别想爱因斯坦",
          "synchronized 加在方法声明上，或用在代码块上并指定一个对象",
          "synchronized 锁的是对象，不是方法，也不是代码块本身",
          "每个对象只有一把锁、一把钥匙；大部分时间锁是开着的，没人关心",
          "线程进入 synchronized 代码前必须先拿到该对象的钥匙",
          "线程一旦拿到钥匙，会一直持有到执行完整个 synchronized 方法或块"
        ],
        "links": [
          {
            "t": "Oracle Java Docs · Java Language Specification 第 17 章（线程与锁）",
            "u": "https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html"
          },
          {
            "t": "Wikipedia · Java memory model",
            "u": "https://en.wikipedia.org/wiki/Java_memory_model"
          },
          {
            "t": "Oracle · JSR-133: Java Memory Model and Thread Specification",
            "u": "https://www.jcp.org/en/jsr/detail?id=133"
          },
          {
            "t": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c42.json"
      },
      {
        "id": "jb-c43",
        "title": "synchronized 的实现与锁升级",
        "level": "hard",
        "minutes": 27,
        "lead": "synchronized 从「重量级」变成了「自适应」，这条演化本身就是一部优化史。本课讲清对象头与 Mark Word、监视器 monitor 的结构、偏向锁、轻量级锁和重量级锁的升级路径、逃逸分析带来的锁消除，以及它与 ReentrantLock 的取舍。 本课同时并入《Head First Java》第 18 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
        "sectionsCount": 19,
        "chars": 86355,
        "points": [
          "对象头与 Mark Word 布局",
          "monitor 与 ObjectMonitor",
          "管程与条件队列",
          "偏向锁的动机与撤销",
          "轻量级锁与自旋 CAS",
          "锁膨胀到重量级",
          "自旋、自适应自旋与消除",
          "锁粗化与锁消除",
          "与 ReentrantLock 的对比",
          "并发问题的唯一根源：两个或更多线程访问同一个对象的同一份数据",
          "竞态条件（race condition）指多个线程同时修改同一份数据，结果依赖调度时序",
          "Ryan 和 Monica 的故事：各自先查余额再花钱，中间被插队就会透支",
          "检查余额 + 扣钱必须作为一个原子操作（atomic），不能被拆开",
          "这里的「原子」指不可分割，不是物理上的原子；想牛顿，别想爱因斯坦",
          "synchronized 加在方法声明上，或用在代码块上并指定一个对象",
          "synchronized 锁的是对象，不是方法，也不是代码块本身",
          "每个对象只有一把锁、一把钥匙；大部分时间锁是开着的，没人关心",
          "线程进入 synchronized 代码前必须先拿到该对象的钥匙",
          "线程一旦拿到钥匙，会一直持有到执行完整个 synchronized 方法或块"
        ],
        "links": [
          {
            "t": "Oracle Java Docs · Intrinsic Locks and Synchronization",
            "u": "https://docs.oracle.com/javase/tutorial/essential/concurrency/locksync.html"
          },
          {
            "t": "Wikipedia · Monitor (synchronization)",
            "u": "https://en.wikipedia.org/wiki/Monitor_(synchronization)"
          },
          {
            "t": "Oracle · JEP 374: Deprecate and Disable Biased Locking",
            "u": "https://openjdk.org/jeps/374"
          },
          {
            "t": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c43.json"
      },
      {
        "id": "jb-c44",
        "title": "AQS 与 ReentrantLock 原理",
        "level": "hard",
        "minutes": 28,
        "lead": "AQS 是 java.util.concurrent 包里几乎所有同步器的公共骨架。本课讲清 state 与 CLH 变体队列、独占与共享两种模式、模板方法的设计、ReentrantLock 的公平与非公平差异，以及 Condition 的条件队列如何与主队列协作。 本课同时并入《Head First Java》第 18 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
        "sectionsCount": 20,
        "chars": 87858,
        "points": [
          "AQS 的定位与设计目标",
          "volatile state 与 CAS",
          "CLH 变体等待队列",
          "Node 结构与状态位",
          "独占模式 acquire 流程",
          "共享模式与传播",
          "模板方法的设计模式",
          "ReentrantLock 的可重入实现",
          "公平锁与非公平锁的差异",
          "Condition 与条件队列",
          "并发问题的唯一根源：两个或更多线程访问同一个对象的同一份数据",
          "竞态条件（race condition）指多个线程同时修改同一份数据，结果依赖调度时序",
          "Ryan 和 Monica 的故事：各自先查余额再花钱，中间被插队就会透支",
          "检查余额 + 扣钱必须作为一个原子操作（atomic），不能被拆开",
          "这里的「原子」指不可分割，不是物理上的原子；想牛顿，别想爱因斯坦",
          "synchronized 加在方法声明上，或用在代码块上并指定一个对象",
          "synchronized 锁的是对象，不是方法，也不是代码块本身",
          "每个对象只有一把锁、一把钥匙；大部分时间锁是开着的，没人关心",
          "线程进入 synchronized 代码前必须先拿到该对象的钥匙",
          "线程一旦拿到钥匙，会一直持有到执行完整个 synchronized 方法或块"
        ],
        "links": [
          {
            "t": "Oracle Java Docs · AbstractQueuedSynchronizer",
            "u": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/AbstractQueuedSynchronizer.html"
          },
          {
            "t": "Oracle Java Docs · ReentrantLock",
            "u": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html"
          },
          {
            "t": "Wikipedia · Spinlock（CLH 队列来源）",
            "u": "https://en.wikipedia.org/wiki/Spinlock"
          },
          {
            "t": "Head First Java 3E · 第 18 章（并发问题与不可变数据）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c44.json"
      },
      {
        "id": "jb-c45",
        "title": "CompletableFuture 异步编排",
        "level": "intermediate",
        "minutes": 29,
        "lead": "回调地狱的解药不是更多回调，而是一套可组合的异步抽象。本课讲清 Future 的局限、CompletionStage 的流水线语义、thenApply 与 thenCompose 的关键区别、异常的两条通道、线程池选择，以及常见的死锁与吞异常陷阱。 本课同时并入《Head First Java》第 17 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 17 章（建立连接：网络编程与多线程）",
        "sectionsCount": 21,
        "chars": 91245,
        "points": [
          "Future 的五个局限",
          "CompletableFuture 的角色",
          "supplyAsync 与 runAsync",
          "thenApply 与 thenCompose",
          "thenCombine 与 allOf",
          "异常通道 exceptionally 与 handle",
          "whenComplete 与副作用",
          "默认线程池与自定义池",
          "get 与 join 的差异",
          "编排中的常见陷阱",
          "客户端与服务器通过 Channel 通信，Channel 代表两个应用之间的连接",
          "客户端必须知道服务器在哪（IP 地址或主机名）和哪个端口（TCP 端口号）",
          "TCP 端口是 16 位无符号数，标识服务器上某个具体程序",
          "自己写的服务器用 1024 到 65535 之间的端口，书中聊天例子用 5000",
          "同一端口不能被两个程序同时绑定，否则抛 BindException",
          "建立连接：new InetSocketAddress(IP, port) 再 SocketChannel.open(address)",
          "SocketChannel 不用构造器创建，用静态 open() 方法",
          "读数据：Channels.newReader(channel, StandardCharsets.UTF_8) 得到 Reader，再链 BufferedReader",
          "写数据：Channels.newWriter(channel, UTF_8) 得到 Writer，再链 PrintWriter，用 print/println",
          "Reader 和 Writer 是字节流与字符流之间的桥；读写要用同一个字符集"
        ],
        "links": [
          {
            "t": "Oracle Java Docs · CompletableFuture",
            "u": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html"
          },
          {
            "t": "Oracle Java Docs · CompletionStage",
            "u": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletionStage.html"
          },
          {
            "t": "Wikipedia · Futures and promises",
            "u": "https://en.wikipedia.org/wiki/Futures_and_promises"
          },
          {
            "t": "Head First Java 3E · 第 17 章（建立连接：网络编程与多线程）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c45.json"
      },
      {
        "id": "jb-c46",
        "title": "Stream 惰性求值与并行流陷阱",
        "level": "intermediate",
        "minutes": 38,
        "lead": "Stream 不是集合，它是一条描述「怎么算」的流水线。本课讲清流的惰性求值、中间操作与终止操作的划分、有状态与无状态操作、短路、原始类型流，以及并行流的分割策略、顺序依赖与何时不该用。 本课同时并入《Head First Java》第 12 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
        "sectionsCount": 27,
        "chars": 93891,
        "points": [
          "流与集合的本质区别",
          "中间操作与终止操作",
          "惰性求值与不调用不执行",
          "有状态与无状态操作",
          "短路操作与无限流",
          "原始类型流避免装箱",
          "流不可复用",
          "fork/join 与分割策略",
          "并行流的顺序敏感陷阱",
          "何时不该用并行流",
          "forEach 接收 lambda，把「行为」而不是「数据对象」传进方法",
          "手写 for 循环容易犯的错：起点、终点、步长、拿错变量",
          "Java 8 引入 Streams API，让集合查询可以像配方一样组合",
          "stream() 把集合变成 Stream，是流水线的起点",
          "filter 只保留满足条件的元素，参数是 Predicate",
          "map 把元素从一种类型转成另一种类型，参数是 Function",
          "distinct 去掉重复元素，不需要参数",
          "sorted 按自然序排序，也可传 Comparator 自定义",
          "limit(n) 最多保留 n 个元素，skip(n) 跳过前 n 个",
          "takeWhile 在条件为真时继续处理，dropWhile 在条件为真时跳过"
        ],
        "links": [
          {
            "t": "Oracle Java Docs · java.util.stream",
            "u": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html"
          },
          {
            "t": "Oracle Java Docs · Stream",
            "u": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html"
          },
          {
            "t": "Oracle · Fork/Join Framework 教程",
            "u": "https://docs.oracle.com/javase/tutorial/essential/concurrency/forkjoin.html"
          },
          {
            "t": "Head First Java 3E · 第 12 章（Lambda 与 Stream：只说 What，不说 How）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c46.json"
      },
      {
        "id": "jb-c47",
        "title": "NIO 的 Channel、Buffer 与 Selector",
        "level": "intermediate",
        "minutes": 39,
        "lead": "NIO 的三件套是高性能 IO 的地基。本课讲清流与通道的差别、Buffer 的四个指针与翻转语义、直接内存与零拷贝、Selector 的多路复用模型，以及 Reactor 模式如何把它们组装成服务器。 本课同时并入《Head First Java》第 16、17 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 16 章（保存对象：序列化与文件 I/O）；Head First Java 3E · 第 17 章（建立连接：网络编程与多线程）",
        "sectionsCount": 28,
        "chars": 87749,
        "points": [
          "BIO 与 NIO 的模型差异",
          "Channel 与流的区别",
          "Buffer 的四个指针",
          "flip、clear、compact 的语义",
          "堆内存与直接内存",
          "零拷贝与 transferTo",
          "阻塞与非阻塞模式",
          "Selector 与就绪事件",
          "Reactor 模式与事件循环",
          "序列化（serialization）把对象压平成字节流，用来保存对象状态；反序列化（deserialization）把字节流还原成堆上的对象",
          "对象的「状态」就是实例变量的值；行为存在类里，不参与保存",
          "只在 Java 程序之间传数据 → 用序列化；要给别的语言读 → 写带分隔符的纯文本",
          "连接流（connection stream）代表到文件、网络、控制台的连接，如 FileOutputStream、FileWriter",
          "链流（chain stream）不能自己连目标，必须挂在别的流上，如 ObjectOutputStream、BufferedWriter",
          "写序列化对象的四步：new FileOutputStream → new ObjectOutputStream 链上去 → writeObject → close",
          "关闭最上层流会自动关闭它下面的整条链；文件不存在时 FileOutputStream 会自动创建",
          "一次 writeObject 会保存整个对象图（object graph），包括实例变量引用的对象，逐层递归下去",
          "对象图里同一个对象只保存一份，反序列化时共享引用会被正确还原",
          "对象图里任何一个对象不可序列化，运行时就抛 NotSerializableException——序列化是全有或全无",
          "客户端与服务器通过 Channel 通信，Channel 代表两个应用之间的连接",
          "客户端必须知道服务器在哪（IP 地址或主机名）和哪个端口（TCP 端口号）",
          "TCP 端口是 16 位无符号数，标识服务器上某个具体程序",
          "自己写的服务器用 1024 到 65535 之间的端口，书中聊天例子用 5000",
          "同一端口不能被两个程序同时绑定，否则抛 BindException",
          "建立连接：new InetSocketAddress(IP, port) 再 SocketChannel.open(address)",
          "SocketChannel 不用构造器创建，用静态 open() 方法",
          "读数据：Channels.newReader(channel, StandardCharsets.UTF_8) 得到 Reader，再链 BufferedReader",
          "写数据：Channels.newWriter(channel, UTF_8) 得到 Writer，再链 PrintWriter，用 print/println",
          "Reader 和 Writer 是字节流与字符流之间的桥；读写要用同一个字符集"
        ],
        "links": [
          {
            "t": "Oracle Java Docs · java.nio.channels.Selector",
            "u": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/Selector.html"
          },
          {
            "t": "Oracle Java Docs · java.nio.ByteBuffer",
            "u": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/ByteBuffer.html"
          },
          {
            "t": "Wikipedia · Non-blocking I/O",
            "u": "https://en.wikipedia.org/wiki/Non-blocking_I/O_(Java)"
          },
          {
            "t": "Head First Java 3E · 第 16 章（保存对象：序列化与文件 I/O）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 17 章（建立连接：网络编程与多线程）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c47.json"
      },
      {
        "id": "jb-c48",
        "title": "类加载器与双亲委派实战",
        "level": "intermediate",
        "minutes": 38,
        "lead": "同一个类被两个加载器加载就是两个不同的类，这条规则解释了大量「诡异」问题。本课讲清类加载的三个阶段与连接过程、双亲委派的工作与破坏场景、SPI 与线程上下文加载器、热部署与自定义加载器，以及它带来的内存泄漏。 本课同时并入《Head First Java》第 1、16 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）；Head First Java 3E · 第 16 章（保存对象：序列化与文件 I/O）",
        "sectionsCount": 27,
        "chars": 86779,
        "points": [
          "类的生命周期七个阶段",
          "加载、链接、初始化",
          "类加载器的层次",
          "双亲委派的工作流程",
          "为什么需要双亲委派",
          "SPI 与线程上下文类加载器",
          "Tomcat 的类加载隔离",
          "自定义 ClassLoader 与字节码",
          "热部署与元空间泄漏",
          "Java 的目标是一次编写、到处运行（write once, run anywhere）",
          "Java 程序运行的四个步骤：写源文件、编译、产出字节码、JVM 执行",
          "源文件的扩展名是 .java，编译产物是 .class",
          "javac 是编译器程序，负责检查错误并产出字节码",
          "java 命令启动 JVM，后面跟的是类名而不是文件名",
          "字节码（bytecode）与平台无关，可被任何 JVM 解释执行",
          "JVM 是用软件实现的虚拟机，负责把字节码翻译成当前平台能执行的东西",
          "JVM 启动时在指定的类里寻找 public static void main(String[] args)",
          "一个应用至少要有一个类，至少要有一个 main，但不是每个类都要 main",
          "源文件放类、类里放方法、方法里放语句，这是 Java 的三段式结构",
          "序列化（serialization）把对象压平成字节流，用来保存对象状态；反序列化（deserialization）把字节流还原成堆上的对象",
          "对象的「状态」就是实例变量的值；行为存在类里，不参与保存",
          "只在 Java 程序之间传数据 → 用序列化；要给别的语言读 → 写带分隔符的纯文本",
          "连接流（connection stream）代表到文件、网络、控制台的连接，如 FileOutputStream、FileWriter",
          "链流（chain stream）不能自己连目标，必须挂在别的流上，如 ObjectOutputStream、BufferedWriter",
          "写序列化对象的四步：new FileOutputStream → new ObjectOutputStream 链上去 → writeObject → close",
          "关闭最上层流会自动关闭它下面的整条链；文件不存在时 FileOutputStream 会自动创建",
          "一次 writeObject 会保存整个对象图（object graph），包括实例变量引用的对象，逐层递归下去",
          "对象图里同一个对象只保存一份，反序列化时共享引用会被正确还原",
          "对象图里任何一个对象不可序列化，运行时就抛 NotSerializableException——序列化是全有或全无"
        ],
        "links": [
          {
            "t": "Oracle Java Docs · ClassLoader",
            "u": "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ClassLoader.html"
          },
          {
            "t": "Oracle Java Docs · JVM 规范第 5 章（加载、链接与初始化）",
            "u": "https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html"
          },
          {
            "t": "Wikipedia · Java ClassLoader",
            "u": "https://en.wikipedia.org/wiki/Java_Classloader"
          },
          {
            "t": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 16 章（保存对象：序列化与文件 I/O）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的进阶题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c48.json"
      },
      {
        "id": "jb-c49",
        "title": "GC 算法与 G1/ZGC 调优",
        "level": "hard",
        "minutes": 31,
        "lead": "GC 不是玄学，它是一组有明确取舍的工程决策。本课讲清可达性分析与三色标记、分代假说与回收算法、常见收集器的演进、G1 的区域与混合回收、ZGC 的染色指针，以及停顿时间的调优思路。 本课同时并入《Head First Java》第 9、2 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）；Head First Java 3E · 第 2 章（走进对象村：类与对象）",
        "sectionsCount": 22,
        "chars": 94858,
        "points": [
          "可达性分析与 GC Roots",
          "标记清除、复制与标记整理",
          "分代假说与堆布局",
          "对象晋升与逃逸分析",
          "Serial、Parallel 与 CMS",
          "G1 的 Region 与 SATB",
          "混合回收与停顿预测",
          "ZGC 的染色指针与并发转移",
          "调优的目标与常用参数",
          "JVM 关心两块内存：栈（Stack）与堆（Heap）",
          "栈存放方法调用与局部变量，堆存放所有对象",
          "实例变量声明在类里、方法外；局部变量声明在方法里或作为方法参数",
          "所有局部变量都活在栈上，位于它所属方法的栈帧（stack frame）里",
          "栈帧保存方法的状态：执行到哪一行、所有局部变量的值",
          "方法被调用时压栈（push），执行到右大括号时弹栈（pop）",
          "栈顶的方法永远是当前正在执行的方法",
          "局部变量的生命（life）指栈帧还在栈上；作用域（scope）指它所属的方法正在执行",
          "方法调用另一个方法时，局部变量还活着但不在作用域内，不能用",
          "对象引用变量如果声明为局部变量，引用本身在栈上",
          "把代码全写在 main 里属于过程式写法，不是面向对象",
          "面向对象让你能扩展程序而不必改动已经测试通过的旧代码",
          "规格永远会变，这是本章故事的核心前提",
          "过程式做法用一个大方法加 shapeNum 查表来区分不同图形",
          "面向对象做法为每种图形写一个类，各自实现自己的行为",
          "继承（inheritance）把共同特征抽到父类，子类自动获得",
          "父类叫 superclass，子类叫 subclass，子类继承父类的方法",
          "覆写（override）是子类重新定义继承来的方法以改变行为",
          "有了多态式的调用，程序只需对对象说「rotate」，不必关心它怎么转",
          "类（class）是对象的蓝图，告诉 JVM 如何造出这种对象"
        ],
        "links": [
          {
            "t": "Oracle · HotSpot 虚拟机垃圾收集调优指南",
            "u": "https://docs.oracle.com/en/java/javase/21/gctuning/"
          },
          {
            "t": "Oracle · JEP 439: Generational ZGC",
            "u": "https://openjdk.org/jeps/439"
          },
          {
            "t": "Wikipedia · Garbage collection (computer science)",
            "u": "https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)"
          },
          {
            "t": "Head First Java 3E · 第 9 章（对象的生与死：构造器、栈堆与垃圾回收）",
            "u": "#"
          },
          {
            "t": "Head First Java 3E · 第 2 章（走进对象村：类与对象）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c49.json"
      },
      {
        "id": "jb-c50",
        "title": "JIT 分层编译与逃逸分析",
        "level": "hard",
        "minutes": 25,
        "lead": "Java 的性能秘密藏在运行时编译里。本课讲清解释执行与编译执行的切换、C1 与 C2 的分工、分层编译的五级、热点探测与去优化，以及逃逸分析如何带来栈上分配、锁消除与标量替换。 本课同时并入《Head First Java》第 1 章的相关小节，原书的类比、对话、练习与逐行代码讲解都保留在正文里。",
        "source": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
        "sectionsCount": 18,
        "chars": 93827,
        "points": [
          "解释器与编译器的分工",
          "C1 与 C2 的优化取舍",
          "分层编译的五个层级",
          "热点探测与计数器",
          "内联与它的连锁效应",
          "去优化与逆优化",
          "逃逸分析的三种结论",
          "栈上分配与标量替换",
          "锁消除与实测方法",
          "Java 的目标是一次编写、到处运行（write once, run anywhere）",
          "Java 程序运行的四个步骤：写源文件、编译、产出字节码、JVM 执行",
          "源文件的扩展名是 .java，编译产物是 .class",
          "javac 是编译器程序，负责检查错误并产出字节码",
          "java 命令启动 JVM，后面跟的是类名而不是文件名",
          "字节码（bytecode）与平台无关，可被任何 JVM 解释执行",
          "JVM 是用软件实现的虚拟机，负责把字节码翻译成当前平台能执行的东西",
          "JVM 启动时在指定的类里寻找 public static void main(String[] args)",
          "一个应用至少要有一个类，至少要有一个 main，但不是每个类都要 main",
          "源文件放类、类里放方法、方法里放语句，这是 Java 的三段式结构"
        ],
        "links": [
          {
            "t": "Oracle · Java HotSpot 虚拟机性能增强",
            "u": "https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html"
          },
          {
            "t": "OpenJDK · JEP 165: Compiler Control",
            "u": "https://openjdk.org/jeps/165"
          },
          {
            "t": "Wikipedia · Just-in-time compilation",
            "u": "https://en.wikipedia.org/wiki/Just-in-time_compilation"
          },
          {
            "t": "Head First Java 3E · 第 1 章（快览 Java：从源码到运行）",
            "u": "#"
          }
        ],
        "practice": "完成本课后，去 Java 改错实验室练同主题的困难题；错题会自动进入错题本。",
        "bodyUrl": "../_features/java-courses/study-jbase-bodies/jb-c50.json"
      }
    ]
  }
];

window.JAVA_COURSE_STATS = {
  "chapters": 18,
  "parts": 5,
  "lessons": 50,
  "sections": 1436,
  "chars": 5698086
};
