/* z87 · JavaScript 改错 +30（三档各 10），用例由真实 Node 运行生成。 */
window.JS_DEBUG_TASKS = (window.JS_DEBUG_TASKS || []).concat([
  {
    "id": "z87-01",
    "level": "basic",
    "title": "偶数求和",
    "minutes": 6,
    "summary": "循环里的奇偶判断写反了，把奇数加进了总和。",
    "prompt": "实现 solve(nums)：返回数组中所有偶数的和。空数组返回 0。不要修改原数组。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "判断偶数应该用 n % 2 === 0；写反后加的是奇数。",
    "code": "function solve(nums){let s=0;for(const n of nums){if(n%2===1)s+=n;}return s;}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "expected": 6,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            2,
            4,
            6
          ]
        ],
        "expected": 12,
        "public": false,
        "label": "全是偶数"
      },
      {
        "args": [
          [
            1,
            3,
            5
          ]
        ],
        "expected": 0,
        "public": false,
        "label": "全奇数"
      }
    ],
    "hints": [
      "先手算 [1,2,3,4]，确认 2+4=6。",
      "空数组应返回 0。"
    ],
    "analysis": "n%2===0 才是偶数；先用 2 和 3 各试一次。",
    "fixed": "function solve(nums){let s=0;for(const n of nums){if(n%2===0)s+=n;}return s;}",
    "order": 43
  },
  {
    "id": "z87-02",
    "level": "basic",
    "title": "最大值",
    "minutes": 6,
    "summary": "求最大值却调用了 Math.min。",
    "prompt": "实现 solve(nums)：返回数组中的最大值，数组至少有一个元素。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "Math.min 返回最小值，方向反了。",
    "code": "function solve(nums){return Math.min(...nums);}",
    "tests": [
      {
        "args": [
          [
            3,
            9,
            2
          ]
        ],
        "expected": 9,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            -5,
            -1,
            -9
          ]
        ],
        "expected": -1,
        "public": false,
        "label": "全负数"
      },
      {
        "args": [
          [
            7
          ]
        ],
        "expected": 7,
        "public": false,
        "label": "单个"
      }
    ],
    "hints": [
      "全负数时不能把 max 初始成 0。",
      "单元素数组直接返回该元素。"
    ],
    "analysis": "求最大用 Math.max；用负数测试可排除初始化陷阱。",
    "fixed": "function solve(nums){return Math.max(...nums);}",
    "order": 44
  },
  {
    "id": "z87-03",
    "level": "basic",
    "title": "正数计数",
    "minutes": 6,
    "summary": "把 0 也算成了正数。",
    "prompt": "实现 solve(nums)：统计严格大于 0 的元素个数。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "正数是 > 0，0 既不是正数也不是负数。",
    "code": "function solve(nums){let c=0;for(const n of nums){if(n>=0)c++;}return c;}",
    "tests": [
      {
        "args": [
          [
            1,
            -2,
            0,
            3
          ]
        ],
        "expected": 2,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            -1,
            -2
          ]
        ],
        "expected": 0,
        "public": false,
        "label": "全负"
      },
      {
        "args": [
          [
            0,
            0,
            1
          ]
        ],
        "expected": 1,
        "public": false,
        "label": "两个零"
      }
    ],
    "hints": [
      "[1,-2,0,3] 中只有 1 和 3。",
      "负数不影响计数。"
    ],
    "analysis": "边界值 0 一定要单独测。",
    "fixed": "function solve(nums){let c=0;for(const n of nums){if(n>0)c++;}return c;}",
    "order": 45
  },
  {
    "id": "z87-04",
    "level": "basic",
    "title": "单词反转",
    "minutes": 6,
    "summary": "只反转了字符，没有按单词反转。",
    "prompt": "实现 solve(text)：把空格分隔的单词顺序反转，单词内部字符保持原样。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "split('') 按字符切分，反转的是字符顺序。",
    "code": "function solve(text){return text.split('').reverse().join('');}",
    "tests": [
      {
        "args": [
          "hello world"
        ],
        "expected": "world hello",
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          "a b c"
        ],
        "expected": "c b a",
        "public": false,
        "label": "三个词"
      },
      {
        "args": [
          "one"
        ],
        "expected": "one",
        "public": false,
        "label": "单个词"
      }
    ],
    "hints": [
      "先确认输出中 world 仍在 hello 前面。",
      "单个词反转后应保持不变。"
    ],
    "analysis": "按空格切分要用 split(' ')。",
    "fixed": "function solve(text){return text.split(' ').reverse().join(' ');}",
    "order": 46
  },
  {
    "id": "z87-05",
    "level": "basic",
    "title": "元音计数",
    "minutes": 6,
    "summary": "没有统一大小写，大写元音被漏掉。",
    "prompt": "实现 solve(text)：统计 a/e/i/o/u 的出现次数，大小写都算。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "没有 toLowerCase 时大写 E 不会匹配小写 e。",
    "code": "function solve(text){return text.split('').filter(c=>'aeiou'.includes(c)).length;}",
    "tests": [
      {
        "args": [
          "Hello"
        ],
        "expected": 2,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          "XYZ"
        ],
        "expected": 0,
        "public": false,
        "label": "无元音"
      },
      {
        "args": [
          "AEIOU"
        ],
        "expected": 5,
        "public": false,
        "label": "全大写"
      }
    ],
    "hints": [
      "Hello 有 e 和 o 两个。",
      "无元音返回 0。"
    ],
    "analysis": "先转小写再判断 includes。",
    "fixed": "function solve(text){return text.toLowerCase().split('').filter(c=>'aeiou'.includes(c)).length;}",
    "order": 47
  },
  {
    "id": "z87-06",
    "level": "basic",
    "title": "阶乘",
    "minutes": 6,
    "summary": "循环少乘了 n 本身。",
    "prompt": "实现 solve(n)：返回 n 的阶乘，n 为非负整数。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "range 不包含 n 会变成 (n-1)!。",
    "code": "function solve(n){let r=1;for(let i=1;i<n;i++)r*=i;return r;}",
    "tests": [
      {
        "args": [
          5
        ],
        "expected": 120,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          0
        ],
        "expected": 1,
        "public": false,
        "label": "0!"
      },
      {
        "args": [
          3
        ],
        "expected": 6,
        "public": false,
        "label": "3!"
      }
    ],
    "hints": [
      "5! = 120。",
      "循环必须到 n。"
    ],
    "analysis": "0! 定义为 1。",
    "fixed": "function solve(n){let r=1;for(let i=1;i<=n;i++)r*=i;return r;}",
    "order": 48
  },
  {
    "id": "z87-07",
    "level": "basic",
    "title": "FizzBuzz 单项",
    "minutes": 6,
    "summary": "判断顺序写错，15 只返回了 Fizz。",
    "prompt": "实现 solve(n)：3 的倍数返回 Fizz，5 的倍数返回 Buzz，同时是则返回 FizzBuzz，否则返回字符串 n。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "15 同时满足两个条件，必须先判断 FizzBuzz。",
    "code": "function solve(n){if(n%3===0&&n%5===0)return 'Fizz';if(n%3===0)return 'Fizz';if(n%5===0)return 'Buzz';return String(n);}",
    "tests": [
      {
        "args": [
          15
        ],
        "expected": "FizzBuzz",
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          9
        ],
        "expected": "Fizz",
        "public": false,
        "label": "3 的倍数"
      },
      {
        "args": [
          10
        ],
        "expected": "Buzz",
        "public": false,
        "label": "5 的倍数"
      }
    ],
    "hints": [
      "9 应返回 Fizz。",
      "10 应返回 Buzz。"
    ],
    "analysis": "先处理最特殊的情况，再处理单个条件。",
    "fixed": "function solve(n){if(n%3===0&&n%5===0)return 'FizzBuzz';if(n%3===0)return 'Fizz';if(n%5===0)return 'Buzz';return String(n);}",
    "order": 49
  },
  {
    "id": "z87-08",
    "level": "basic",
    "title": "字符串重复",
    "minutes": 6,
    "summary": "重复次数少了一次。",
    "prompt": "实现 solve(text,n)：返回 text 重复 n 次拼接的字符串。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "repeat(n-1) 会少一份，n=0 还会变成负数报错。",
    "code": "function solve(text,n){return text.repeat(n-1);}",
    "tests": [
      {
        "args": [
          "ab",
          3
        ],
        "expected": "ababab",
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          "x",
          1
        ],
        "expected": "x",
        "public": false,
        "label": "一次"
      },
      {
        "args": [
          "ha",
          0
        ],
        "expected": "",
        "public": false,
        "label": "零次"
      }
    ],
    "hints": [
      "ab 三次是 ababab。",
      "零次应返回空串。"
    ],
    "analysis": "重复次数直接传给 repeat。",
    "fixed": "function solve(text,n){return text.repeat(n);}",
    "order": 50
  },
  {
    "id": "z87-09",
    "level": "basic",
    "title": "区间夹取",
    "minutes": 6,
    "summary": "只返回了下界，没有考虑上界。",
    "prompt": "实现 solve(n,min,max)：把 n 夹到 [min,max] 区间内。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "只取 max(min,n) 会漏掉上界，12 仍会返回 12。",
    "code": "function solve(n,min,max){return Math.max(min,n);}",
    "tests": [
      {
        "args": [
          12,
          0,
          10
        ],
        "expected": 10,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          -5,
          0,
          10
        ],
        "expected": 0,
        "public": false,
        "label": "低于下界"
      },
      {
        "args": [
          5,
          0,
          10
        ],
        "expected": 5,
        "public": false,
        "label": "区间内"
      }
    ],
    "hints": [
      "12 应变成 10。",
      "区间内应原样返回。"
    ],
    "analysis": "夹取要同时应用下界和上界。",
    "fixed": "function solve(n,min,max){return Math.min(max,Math.max(min,n));}",
    "order": 51
  },
  {
    "id": "z87-10",
    "level": "basic",
    "title": "数位之和",
    "minutes": 6,
    "summary": "每隔一位取数，漏掉了相邻数字。",
    "prompt": "实现 solve(n)：返回非负整数 n 的各位数字之和。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "每次只去掉一位；步进成 /100 会漏掉下一位。",
    "code": "function solve(n){let s=0;while(n>0){s+=n%10;n=Math.floor(n/100);}return s;}",
    "tests": [
      {
        "args": [
          123
        ],
        "expected": 6,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          9
        ],
        "expected": 9,
        "public": false,
        "label": "一位"
      },
      {
        "args": [
          1001
        ],
        "expected": 2,
        "public": false,
        "label": "含零"
      }
    ],
    "hints": [
      "123 的数位和是 6。",
      "1001 的数位和是 2。"
    ],
    "analysis": "每轮必须 n=Math.floor(n/10)。",
    "fixed": "function solve(n){let s=0;while(n>0){s+=n%10;n=Math.floor(n/10);}return s;}",
    "order": 52
  },
  {
    "id": "z87-11",
    "level": "medium",
    "title": "数组去重",
    "minutes": 6,
    "summary": "直接返回原数组，没有去重。",
    "prompt": "实现 solve(nums)：返回去重后的新数组，保持首次出现的顺序。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "原数组直接返回，重复元素还在。",
    "code": "function solve(nums){return nums;}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            2,
            3
          ]
        ],
        "expected": [
          1,
          2,
          3
        ],
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            1,
            1,
            1
          ]
        ],
        "expected": [
          1
        ],
        "public": false,
        "label": "全同"
      },
      {
        "args": [
          []
        ],
        "expected": [],
        "public": false,
        "label": "空数组"
      }
    ],
    "hints": [
      "[1,2,2,3] 应变成 [1,2,3]。",
      "空数组返回空数组。"
    ],
    "analysis": "Set 天然去重，再用展开转回数组。",
    "fixed": "function solve(nums){return [...new Set(nums)];}",
    "order": 53
  },
  {
    "id": "z87-12",
    "level": "medium",
    "title": "数组扁平化",
    "minutes": 6,
    "summary": "只展开了一层，嵌套数组仍原样保留。",
    "prompt": "实现 solve(nums)：把一层嵌套数组展开成一维。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "直接返回原数组没有展开；concat(...nums) 才把每个元素摊开。",
    "code": "function solve(nums){return nums;}",
    "tests": [
      {
        "args": [
          [
            [
              1,
              2
            ],
            [
              3
            ],
            4
          ]
        ],
        "expected": [
          1,
          2,
          3,
          4
        ],
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            [
              1
            ],
            [
              2
            ]
          ]
        ],
        "expected": [
          1,
          2
        ],
        "public": false,
        "label": "全嵌套"
      },
      {
        "args": [
          [
            1,
            2
          ]
        ],
        "expected": [
          1,
          2
        ],
        "public": false,
        "label": "已一维"
      }
    ],
    "hints": [
      "[[1,2],[3],4] 应变成 [1,2,3,4]。",
      "已一维数组保持不变。"
    ],
    "analysis": "一层展开用 concat 展开运算符。",
    "fixed": "function solve(nums){return [].concat(...nums);}",
    "order": 54
  },
  {
    "id": "z87-13",
    "level": "medium",
    "title": "数组分块",
    "minutes": 6,
    "summary": "块大小多算了一个。",
    "prompt": "实现 solve(nums,k)：把数组按每 k 个一组切分，最后一组可不足 k 个。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "步进写成 k+1 会跳过一个元素。",
    "code": "function solve(nums,k){const out=[];for(let i=0;i<nums.length;i+=k+1)out.push(nums.slice(i,i+k));return out;}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            3,
            4,
            5
          ],
          2
        ],
        "expected": [
          [
            1,
            2
          ],
          [
            3,
            4
          ],
          [
            5
          ]
        ],
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            1,
            2,
            3,
            4
          ],
          2
        ],
        "expected": [
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ],
        "public": false,
        "label": "整除"
      },
      {
        "args": [
          [],
          3
        ],
        "expected": [],
        "public": false,
        "label": "空数组"
      }
    ],
    "hints": [
      "[1,2,3,4,5] k=2 应分成 [1,2],[3,4],[5]。",
      "空数组应返回 []。"
    ],
    "analysis": "每次切片起点按 k 递增。",
    "fixed": "function solve(nums,k){const out=[];for(let i=0;i<nums.length;i+=k)out.push(nums.slice(i,i+k));return out;}",
    "order": 55
  },
  {
    "id": "z87-14",
    "level": "medium",
    "title": "变位词",
    "minutes": 6,
    "summary": "只比较了长度，没有比较字母组成。",
    "prompt": "实现 solve(a,b)：判断两个字符串是否互为变位词（忽略大小写）。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "长度相同不代表字母相同，aab 和 abb 长度一样但不是变位词。",
    "code": "function solve(a,b){return a.length===b.length;}",
    "tests": [
      {
        "args": [
          "Listen",
          "Silent"
        ],
        "expected": true,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          "aab",
          "abb"
        ],
        "expected": false,
        "public": false,
        "label": "不同"
      },
      {
        "args": [
          "abc",
          "cba"
        ],
        "expected": true,
        "public": false,
        "label": "重排"
      }
    ],
    "hints": [
      "Listen 和 Silent 排序后都变成 eilnst。",
      "abc 和 cba 是变位词。"
    ],
    "analysis": "两边排序后逐字符比较。",
    "fixed": "function solve(a,b){return a.toLowerCase().split('').sort().join('')===b.toLowerCase().split('').sort().join('');}",
    "order": 56
  },
  {
    "id": "z87-15",
    "level": "medium",
    "title": "两数之和",
    "minutes": 6,
    "summary": "返回了两个相同的下标。",
    "prompt": "实现 solve(nums,target)：返回和等于 target 的两个不同下标，找不到返回 []。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "返回 i,i 是同一个位置两次，答案要求两个不同下标。",
    "code": "function solve(nums,t){const m=new Map();for(let i=0;i<nums.length;i++){const need=t-nums[i];if(m.has(need))return [i,i];m.set(nums[i],i);}return [];}",
    "tests": [
      {
        "args": [
          [
            2,
            7,
            11,
            15
          ],
          9
        ],
        "expected": [
          0,
          1
        ],
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            3,
            3
          ],
          6
        ],
        "expected": [
          0,
          1
        ],
        "public": false,
        "label": "重复值"
      },
      {
        "args": [
          [
            1,
            2
          ],
          5
        ],
        "expected": [],
        "public": false,
        "label": "无解"
      }
    ],
    "hints": [
      "[2,7,11,15] 应返回 [0,1]。",
      "无解返回空数组。"
    ],
    "analysis": "哈希表存“值→下标”，命中时返回存的下标和当前下标。",
    "fixed": "function solve(nums,t){const m=new Map();for(let i=0;i<nums.length;i++){const need=t-nums[i];if(m.has(need))return [m.get(need),i];m.set(nums[i],i);}return [];}",
    "order": 57
  },
  {
    "id": "z87-16",
    "level": "medium",
    "title": "标题格式",
    "minutes": 6,
    "summary": "把所有字母都转成了大写，没有只大写首字母。",
    "prompt": "实现 solve(text)：把每个单词首字母大写、其余小写。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "w.toUpperCase() 让整个单词都大写，不符合标题格式。",
    "code": "function solve(text){return text.split(' ').map(w=>w.toUpperCase()).join(' ');}",
    "tests": [
      {
        "args": [
          "hello world"
        ],
        "expected": "Hello World",
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          "jAVA script"
        ],
        "expected": "Java Script",
        "public": false,
        "label": "混合"
      },
      {
        "args": [
          "a"
        ],
        "expected": "A",
        "public": false,
        "label": "单字母"
      }
    ],
    "hints": [
      "jAVA 应变成 Java。",
      "单字母只大写自己。"
    ],
    "analysis": "首字母 upper，其余 lower。",
    "fixed": "function solve(text){return text.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');}",
    "order": 58
  },
  {
    "id": "z87-17",
    "level": "medium",
    "title": "区间求和",
    "minutes": 6,
    "summary": "循环少加了终点 b。",
    "prompt": "实现 solve(a,b)：返回从 a 到 b（含两端）的所有整数之和。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "条件写 i<b 会漏掉 b。",
    "code": "function solve(a,b){let s=0;for(let i=a;i<b;i++)s+=i;return s;}",
    "tests": [
      {
        "args": [
          1,
          5
        ],
        "expected": 15,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          3,
          3
        ],
        "expected": 3,
        "public": false,
        "label": "单点"
      },
      {
        "args": [
          -2,
          2
        ],
        "expected": 0,
        "public": false,
        "label": "跨零"
      }
    ],
    "hints": [
      "1..5 的和是 15。",
      "3..3 应返回 3。"
    ],
    "analysis": "闭区间要用 <=。",
    "fixed": "function solve(a,b){let s=0;for(let i=a;i<=b;i++)s+=i;return s;}",
    "order": 59
  },
  {
    "id": "z87-18",
    "level": "medium",
    "title": "二分查找",
    "minutes": 6,
    "summary": "left 更新多跳了一格。",
    "prompt": "实现 solve(nums,target)：在升序数组中返回 target 的下标，找不到返回 -1。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "lo=mid+2 会跳过 mid+1，答案可能正好在那里。",
    "code": "function solve(nums,target){let lo=0,hi=nums.length-1;while(lo<=hi){const mid=(lo+hi)>>1;if(nums[mid]===target)return mid;if(nums[mid]<target)lo=mid+2;else hi=mid-1;}return -1;}",
    "tests": [
      {
        "args": [
          [
            1,
            3,
            5,
            7
          ],
          5
        ],
        "expected": 2,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            1,
            3,
            5,
            7
          ],
          8
        ],
        "expected": -1,
        "public": false,
        "label": "找不到"
      },
      {
        "args": [
          [],
          3
        ],
        "expected": -1,
        "public": false,
        "label": "空数组"
      }
    ],
    "hints": [
      "[1,3,5,7] 找 5 返回 2。",
      "空数组返回 -1。"
    ],
    "analysis": "更新只排除 mid：lo=mid+1。",
    "fixed": "function solve(nums,target){let lo=0,hi=nums.length-1;while(lo<=hi){const mid=(lo+hi)>>1;if(nums[mid]===target)return mid;if(nums[mid]<target)lo=mid+1;else hi=mid-1;}return -1;}",
    "order": 60
  },
  {
    "id": "z87-19",
    "level": "medium",
    "title": "单词计数",
    "minutes": 6,
    "summary": "按单个空格切分，连续空格会产生空单词。",
    "prompt": "实现 solve(text)：统计由空白分隔的单词数量。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "连续空格会切出空串，长度被多算。",
    "code": "function solve(text){return text.split(' ').length;}",
    "tests": [
      {
        "args": [
          "hello  world"
        ],
        "expected": 2,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          "  a b  "
        ],
        "expected": 2,
        "public": false,
        "label": "首尾空格"
      },
      {
        "args": [
          ""
        ],
        "expected": 0,
        "public": false,
        "label": "空串"
      }
    ],
    "hints": [
      "hello  world 只有两个单词。",
      "空串应返回 0。"
    ],
    "analysis": "用正则 /\\s+/ 或 filter(Boolean)。",
    "fixed": "function solve(text){return text.trim().split(/\\s+/).filter(Boolean).length;}",
    "order": 61
  },
  {
    "id": "z87-20",
    "level": "medium",
    "title": "合并区间",
    "minutes": 6,
    "summary": "右端点被较短区间覆盖。",
    "prompt": "实现 solve(intervals)：合并所有重叠区间，返回合并后的区间数组。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "被包含的短区间会把右端点改小，应该取 max。",
    "code": "function solve(a){a.sort((x,y)=>x[0]-y[0]);const out=[];for(const [l,r] of a){if(!out.length||l>out[out.length-1][1])out.push([l,r]);else out[out.length-1][1]=Math.min(out[out.length-1][1],r);}return out;}",
    "tests": [
      {
        "args": [
          [
            [
              1,
              3
            ],
            [
              2,
              6
            ],
            [
              8,
              10
            ]
          ]
        ],
        "expected": [
          [
            1,
            6
          ],
          [
            8,
            10
          ]
        ],
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            [
              1,
              10
            ],
            [
              2,
              3
            ]
          ]
        ],
        "expected": [
          [
            1,
            10
          ]
        ],
        "public": false,
        "label": "包含"
      },
      {
        "args": [
          [
            [
              1,
              2
            ],
            [
              3,
              4
            ]
          ]
        ],
        "expected": [
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ],
        "public": false,
        "label": "不重叠"
      }
    ],
    "hints": [
      "[1,3] 和 [2,6] 合并成 [1,6]。",
      "不重叠区间保持分开。"
    ],
    "analysis": "合并右端取最大值。",
    "fixed": "function solve(a){a.sort((x,y)=>x[0]-y[0]);const out=[];for(const [l,r] of a){if(!out.length||l>out[out.length-1][1])out.push([l,r]);else out[out.length-1][1]=Math.max(out[out.length-1][1],r);}return out;}",
    "order": 62
  },
  {
    "id": "z87-21",
    "level": "hard",
    "title": "最长递增子序列",
    "minutes": 12,
    "summary": "只返回了 dp 的最后一项。",
    "prompt": "实现 solve(nums)：返回最长严格递增子序列的长度。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "答案可能在任何位置结尾，不能只取 dp[n-1]。",
    "code": "function solve(nums){const dp=nums.map(()=>1);for(let i=0;i<nums.length;i++){for(let j=0;j<i;j++){if(nums[j]<nums[i])dp[i]=Math.max(dp[i],dp[j]+1);}}return dp[dp.length-1];}",
    "tests": [
      {
        "args": [
          [
            6,
            1,
            2,
            3,
            0
          ]
        ],
        "expected": 3,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            2,
            2,
            2
          ]
        ],
        "expected": 1,
        "public": false,
        "label": "全相等"
      },
      {
        "args": [
          [
            5
          ]
        ],
        "expected": 1,
        "public": false,
        "label": "单个"
      }
    ],
    "hints": [
      "[6,1,2,3,0] 的 LIS 长度是 3。",
      "全相等时 LIS 是 1。"
    ],
    "analysis": "最后取 max(dp)。",
    "fixed": "function solve(nums){const dp=nums.map(()=>1);for(let i=0;i<nums.length;i++){for(let j=0;j<i;j++){if(nums[j]<nums[i])dp[i]=Math.max(dp[i],dp[j]+1);}}return Math.max(...dp);}",
    "order": 63
  },
  {
    "id": "z87-22",
    "level": "hard",
    "title": "硬币找零",
    "minutes": 12,
    "summary": "dp[0] 初始化错了，所有转移都变大。",
    "prompt": "实现 solve(coins,amount)：用最少的硬币凑出金额，凑不出返回 -1。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "dp[0] 表示凑 0 元需要 0 枚硬币，设成 1 会让所有结果偏大。",
    "code": "function solve(coins,amount){const dp=Array(amount+1).fill(Infinity);dp[0]=1;for(let i=1;i<=amount;i++){for(const c of coins){if(i>=c)dp[i]=Math.min(dp[i],dp[i-c]+1);}}return dp[amount]===Infinity?-1:dp[amount];}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            5
          ],
          11
        ],
        "expected": 3,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            2
          ],
          3
        ],
        "expected": -1,
        "public": false,
        "label": "凑不出"
      },
      {
        "args": [
          [
            1
          ],
          0
        ],
        "expected": 0,
        "public": false,
        "label": "零元"
      }
    ],
    "hints": [
      "11 元用 5+5+1 共 3 枚。",
      "凑不出返回 -1。"
    ],
    "analysis": "边界值按语义初始化。",
    "fixed": "function solve(coins,amount){const dp=Array(amount+1).fill(Infinity);dp[0]=0;for(let i=1;i<=amount;i++){for(const c of coins){if(i>=c)dp[i]=Math.min(dp[i],dp[i-c]+1);}}return dp[amount]===Infinity?-1:dp[amount];}",
    "order": 64
  },
  {
    "id": "z87-23",
    "level": "hard",
    "title": "网格路径",
    "minutes": 12,
    "summary": "第一行/列初始化成了 0，路径数不对。",
    "prompt": "实现 solve(m,n)：统计 m×n 网格从左上到右下的路径数，只能向右或向下。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "第一行只有一种走法，初始化为 0 会切断路径。",
    "code": "function solve(m,n){const dp=Array.from({length:m},()=>Array(n).fill(0));for(let i=0;i<m;i++)dp[i][0]=1;for(let j=0;j<n;j++)dp[0][j]=0;for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]=dp[i-1][j]+dp[i][j-1];return dp[m-1][n-1];}",
    "tests": [
      {
        "args": [
          3,
          4
        ],
        "expected": 10,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          1,
          1
        ],
        "expected": 1,
        "public": false,
        "label": "1x1"
      },
      {
        "args": [
          2,
          2
        ],
        "expected": 2,
        "public": false,
        "label": "2x2"
      }
    ],
    "hints": [
      "3×4 的路径数是 10。",
      "1×1 只有 1 条路径。"
    ],
    "analysis": "第一行第一列都应为 1。",
    "fixed": "function solve(m,n){const dp=Array.from({length:m},()=>Array(n).fill(0));for(let i=0;i<m;i++)dp[i][0]=1;for(let j=0;j<n;j++)dp[0][j]=1;for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]=dp[i-1][j]+dp[i][j-1];return dp[m-1][n-1];}",
    "order": 65
  },
  {
    "id": "z87-24",
    "level": "hard",
    "title": "编辑距离",
    "minutes": 12,
    "summary": "不等时取了最大而不是最小。",
    "prompt": "实现 solve(a,b)：返回把 a 变成 b 的最少编辑次数。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "三种编辑操作应取最小代价，取最大得到的是最坏路径。",
    "code": "function solve(a,b){const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)dp[i][0]=i;for(let j=0;j<=b.length;j++)dp[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){if(a[i-1]===b[j-1])dp[i][j]=dp[i-1][j-1];else dp[i][j]=1+Math.max(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]);}return dp[a.length][b.length];}",
    "tests": [
      {
        "args": [
          "kitten",
          "sitting"
        ],
        "expected": 3,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          "abc",
          "abc"
        ],
        "expected": 0,
        "public": false,
        "label": "相同"
      },
      {
        "args": [
          "",
          "abc"
        ],
        "expected": 3,
        "public": false,
        "label": "空串"
      }
    ],
    "hints": [
      "kitten→sitting 需要 3 次。",
      "相同字符串返回 0。"
    ],
    "analysis": "转移对插入/删除/替换取 min。",
    "fixed": "function solve(a,b){const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)dp[i][0]=i;for(let j=0;j<=b.length;j++)dp[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){if(a[i-1]===b[j-1])dp[i][j]=dp[i-1][j-1];else dp[i][j]=1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]);}return dp[a.length][b.length];}",
    "order": 66
  },
  {
    "id": "z87-25",
    "level": "hard",
    "title": "深层扁平化",
    "minutes": 12,
    "summary": "只展开了一层，深层数组仍保留。",
    "prompt": "实现 solve(nums)：递归展开任意深度的嵌套数组。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "只 concat 原元素不会递归，深层数组仍是数组。",
    "code": "function solve(nums){return nums.reduce((a,x)=>a.concat(x),[]);}",
    "tests": [
      {
        "args": [
          [
            1,
            [
              2,
              [
                3,
                [
                  4
                ]
              ]
            ]
          ]
        ],
        "expected": [
          1,
          2,
          3,
          4
        ],
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            [
              [
                1
              ]
            ]
          ]
        ],
        "expected": [
          1
        ],
        "public": false,
        "label": "单元素深嵌套"
      },
      {
        "args": [
          [
            1,
            2
          ]
        ],
        "expected": [
          1,
          2
        ],
        "public": false,
        "label": "一维"
      }
    ],
    "hints": [
      "[1,[2,[3,[4]]]] 应得到 [1,2,3,4]。",
      "一维数组保持不变。"
    ],
    "analysis": "遇到数组递归调用。",
    "fixed": "function solve(nums){return nums.reduce((a,x)=>a.concat(Array.isArray(x)?solve(x):x),[]);}",
    "order": 67
  },
  {
    "id": "z87-26",
    "level": "hard",
    "title": "频率 Top K",
    "minutes": 12,
    "summary": "排序方向反了，返回的是出现最少的值。",
    "prompt": "实现 solve(nums,k)：返回出现频率最高的 k 个值，频率相同按值升序。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "按频率降序应该是 b[1]-a[1]，写成 a[1]-b[1] 会取到最少。",
    "code": "function solve(nums,k){const m=new Map();for(const n of nums)m.set(n,(m.get(n)||0)+1);return [...m.entries()].sort((a,b)=>a[1]-b[1]||a[0]-b[0]).slice(0,k).map(x=>x[0]);}",
    "tests": [
      {
        "args": [
          [
            1,
            1,
            2,
            2,
            2,
            3
          ],
          2
        ],
        "expected": [
          2,
          1
        ],
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            4,
            4,
            5,
            5
          ],
          1
        ],
        "expected": [
          4
        ],
        "public": false,
        "label": "并列"
      },
      {
        "args": [
          [
            1
          ],
          1
        ],
        "expected": [
          1
        ],
        "public": false,
        "label": "单个"
      }
    ],
    "hints": [
      "2 出现 3 次排第一。",
      "并列时按值升序。"
    ],
    "analysis": "先按频次降序，再按值升序。",
    "fixed": "function solve(nums,k){const m=new Map();for(const n of nums)m.set(n,(m.get(n)||0)+1);return [...m.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,k).map(x=>x[0]);}",
    "order": 68
  },
  {
    "id": "z87-27",
    "level": "hard",
    "title": "最大子数组和",
    "minutes": 12,
    "summary": "遇到负数时把当前和清零了，漏掉跨负数的更大子段。",
    "prompt": "实现 solve(nums)：返回连续子数组的最大和。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "cur=Math.max(0,n) 会丢掉以负数开头但后面更大的子段。",
    "code": "function solve(nums){let best=-Infinity,cur=0;for(const n of nums){cur=Math.max(0,n);best=Math.max(best,cur);}return best;}",
    "tests": [
      {
        "args": [
          [
            -2,
            1,
            -3,
            4,
            -1,
            2,
            1,
            -5,
            4
          ]
        ],
        "expected": 6,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            -3,
            -1,
            -2
          ]
        ],
        "expected": -1,
        "public": false,
        "label": "全负"
      },
      {
        "args": [
          [
            1,
            2,
            3
          ]
        ],
        "expected": 6,
        "public": false,
        "label": "全正"
      }
    ],
    "hints": [
      "经典数组答案是 6（4,-1,2,1）。",
      "全负时答案是 -1。"
    ],
    "analysis": "Kadane：cur=max(n,cur+n)。",
    "fixed": "function solve(nums){let best=-Infinity,cur=0;for(const n of nums){cur=Math.max(n,cur+n);best=Math.max(best,cur);}return best;}",
    "order": 69
  },
  {
    "id": "z87-28",
    "level": "hard",
    "title": "快速排序",
    "minutes": 12,
    "summary": "递归时漏掉了右分区。",
    "prompt": "实现 solve(nums)：返回升序排序后的新数组。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "返回时漏掉 solve(r)，比 pivot 大的元素全部丢失。",
    "code": "function solve(nums){if(nums.length<=1)return nums.slice();const p=nums[0];const l=[],r=[],e=[];for(const n of nums){if(n<p)l.push(n);else if(n>p)r.push(n);else e.push(n);}return [...solve(l),...e];}",
    "tests": [
      {
        "args": [
          [
            3,
            1,
            2,
            3
          ]
        ],
        "expected": [
          1,
          2,
          3,
          3
        ],
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          [
            5,
            4,
            3,
            2,
            1
          ]
        ],
        "expected": [
          1,
          2,
          3,
          4,
          5
        ],
        "public": false,
        "label": "逆序"
      },
      {
        "args": [
          [
            1
          ]
        ],
        "expected": [
          1
        ],
        "public": false,
        "label": "单个"
      }
    ],
    "hints": [
      "[3,1,2,3] 应得到 [1,2,3,3]。",
      "单元素直接返回。"
    ],
    "analysis": "三路分区结果要按 左、等于、右 全部拼回。",
    "fixed": "function solve(nums){if(nums.length<=1)return nums.slice();const p=nums[0];const l=[],r=[],e=[];for(const n of nums){if(n<p)l.push(n);else if(n>p)r.push(n);else e.push(n);}return [...solve(l),...e,...solve(r)];}",
    "order": 70
  },
  {
    "id": "z87-29",
    "level": "hard",
    "title": "括号平衡",
    "minutes": 12,
    "summary": "右括号来时没有检查栈顶类型。",
    "prompt": "实现 solve(s)：判断 (),[],{} 三种括号是否正确嵌套。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "只看栈是否为空不够，还必须比较栈顶与当前右括号类型。",
    "code": "function solve(s){const st=[];const map={')':'(',']':'[','}':'{'};for(const c of s){if('([{'.includes(c))st.push(c);else{if(st.length===0)return false;}}return st.length===0;}",
    "tests": [
      {
        "args": [
          "({[]})"
        ],
        "expected": true,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          "([)]"
        ],
        "expected": false,
        "public": false,
        "label": "交叉错"
      },
      {
        "args": [
          "("
        ],
        "expected": false,
        "public": false,
        "label": "未闭合"
      }
    ],
    "hints": [
      "([)] 应返回 false。",
      "未闭合返回 false。"
    ],
    "analysis": "pop 后与 map[c] 比较。",
    "fixed": "function solve(s){const st=[];const map={')':'(',']':'[','}':'{'};for(const c of s){if('([{'.includes(c))st.push(c);else{if(st.pop()!==map[c])return false;}}return st.length===0;}",
    "order": 71
  },
  {
    "id": "z87-30",
    "level": "hard",
    "title": "深比较",
    "minutes": 12,
    "summary": "用 JSON.stringify 比较对象，属性顺序不同会误判。",
    "prompt": "实现 solve(a,b)：递归比较两个 JSON 值是否结构相等（对象键顺序无关）。",
    "source": "Head First JavaScript Programming 2nd · z87 扩展",
    "bug": "JSON.stringify 依赖键顺序，{a:1,b:2} 与 {b:2,a:1} 的字符串不同。",
    "code": "function solve(a,b){if(a===b)return true;if(typeof a!=='object'||a===null||typeof b!=='object'||b===null)return false;const ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;return JSON.stringify(a)===JSON.stringify(b);return true;}",
    "tests": [
      {
        "args": [
          {
            "a": 1,
            "b": 2
          },
          {
            "b": 2,
            "a": 1
          }
        ],
        "expected": true,
        "public": true,
        "label": "公开样例"
      },
      {
        "args": [
          {
            "a": [
              1,
              2
            ]
          },
          {
            "a": [
              1,
              3
            ]
          }
        ],
        "expected": false,
        "public": false,
        "label": "数组不同"
      },
      {
        "args": [
          {
            "a": 1
          },
          {
            "a": 1,
            "b": 2
          }
        ],
        "expected": false,
        "public": false,
        "label": "键不同"
      }
    ],
    "hints": [
      "键顺序不同应视为相等。",
      "数组元素不同应返回 false。"
    ],
    "analysis": "先比键集合，再递归比值。",
    "fixed": "function solve(a,b){if(a===b)return true;if(typeof a!=='object'||a===null||typeof b!=='object'||b===null)return false;const ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;for(const k of ka){if(!Object.prototype.hasOwnProperty.call(b,k)||!solve(a[k],b[k]))return false;}return true;}",
    "order": 72
  }
]);
