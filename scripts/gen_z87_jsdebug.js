const fs=require('fs');
const specs=[];
function S(level,title,summary,prompt,fix,bugPair,tests,why,analysis,hint1,hint2){
  const buggy=fix.replace(bugPair[0],bugPair[1]);
  if(buggy===fix) throw new Error('noop '+title);
  const f=new Function('return ('+fix+')')();
  const b=new Function('return ('+buggy+')')();
  const outTests=tests.map(([args,label,pub],idx)=>{
    args=args.slice();
    if(typeof pub==='undefined'){
      if(typeof args[args.length-1]==='boolean')pub=args.pop();
      if(typeof args[args.length-1]==='string'&&typeof label==='undefined')label=args.pop();
    }
    let expected; try{expected=f.apply(null,args);}catch(e){throw new Error(title+' fixed err '+e.message)}
    return {args,expected,public:idx===0,label:idx===0?'公开样例':label};
  });
  let bad=false;
  for(const t of outTests){let got;try{got=b.apply(null,t.args)}catch(e){got='ERR'} const norm=JSON.stringify(got); if(norm!==JSON.stringify(t.expected))bad=true;}
  if(!bad) throw new Error('bug not caught '+title);
  specs.push({level,title,summary,prompt,code:buggy,fixed:fix,tests:outTests,bug:why,analysis,analysis, hints:[hint1,hint2].filter(Boolean)});
}
// BASIC
S('basic','偶数求和','循环里的奇偶判断写反了，把奇数加进了总和。','实现 solve(nums)：返回数组中所有偶数的和。空数组返回 0。不要修改原数组。',
`function solve(nums){let s=0;for(const n of nums){if(n%2===0)s+=n;}return s;}`,
['n%2===0','n%2===1'],[[[ [1,2,3,4],'混合奇偶',true]],[[ [2,4,6],'全是偶数',true]],[[ [1,3,5],'全奇数',false]]],
'判断偶数应该用 n % 2 === 0；写反后加的是奇数。','n%2===0 才是偶数；先用 2 和 3 各试一次。','先手算 [1,2,3,4]，确认 2+4=6。','空数组应返回 0。');
S('basic','最大值','求最大值却调用了 Math.min。','实现 solve(nums)：返回数组中的最大值，数组至少有一个元素。',
`function solve(nums){return Math.max(...nums);}`,
['Math.max(...nums)','Math.min(...nums)'],[[[ [3,9,2],'基本',true]],[[ [-5,-1,-9],'全负数',true]],[[ [7],'单个',false]]],
'Math.min 返回最小值，方向反了。','求最大用 Math.max；用负数测试可排除初始化陷阱。','全负数时不能把 max 初始成 0。','单元素数组直接返回该元素。');
S('basic','正数计数','把 0 也算成了正数。','实现 solve(nums)：统计严格大于 0 的元素个数。',
`function solve(nums){let c=0;for(const n of nums){if(n>0)c++;}return c;}`,
['n>0','n>=0'],[[[ [1,-2,0,3],'含零',true]],[[ [-1,-2],'全负',true]],[[ [0,0,1],'两个零',false]]],
'正数是 > 0，0 既不是正数也不是负数。','边界值 0 一定要单独测。','[1,-2,0,3] 中只有 1 和 3。','负数不影响计数。');
S('basic','单词反转','只反转了字符，没有按单词反转。','实现 solve(text)：把空格分隔的单词顺序反转，单词内部字符保持原样。',
`function solve(text){return text.split(' ').reverse().join(' ');}`,
["text.split(' ').reverse().join(' ')","text.split('').reverse().join('')"],[[[ 'hello world','两个词',true]],[[ 'a b c','三个词',true]],[[ 'one','单个词',false]]],
'split(\'\') 按字符切分，反转的是字符顺序。','按空格切分要用 split(\' \')。','先确认输出中 world 仍在 hello 前面。','单个词反转后应保持不变。');
S('basic','元音计数','没有统一大小写，大写元音被漏掉。','实现 solve(text)：统计 a/e/i/o/u 的出现次数，大小写都算。',
`function solve(text){return text.toLowerCase().split('').filter(c=>'aeiou'.includes(c)).length;}`,
["text.toLowerCase().split('')","text.split('')"],[[[ 'Hello','大小写',true]],[[ 'XYZ','无元音',true]],[[ 'AEIOU','全大写',false]]],
'没有 toLowerCase 时大写 E 不会匹配小写 e。','先转小写再判断 includes。','Hello 有 e 和 o 两个。','无元音返回 0。');
S('basic','阶乘','循环少乘了 n 本身。','实现 solve(n)：返回 n 的阶乘，n 为非负整数。',
`function solve(n){let r=1;for(let i=1;i<=n;i++)r*=i;return r;}`,
['i<=n','i<n'],[[[ 5,'5!',true]],[[ 0,'0!',true]],[[ 3,'3!',false]]],
'range 不包含 n 会变成 (n-1)!。','0! 定义为 1。','5! = 120。','循环必须到 n。');
S('basic','FizzBuzz 单项','判断顺序写错，15 只返回了 Fizz。','实现 solve(n)：3 的倍数返回 Fizz，5 的倍数返回 Buzz，同时是则返回 FizzBuzz，否则返回字符串 n。',
`function solve(n){if(n%3===0&&n%5===0)return 'FizzBuzz';if(n%3===0)return 'Fizz';if(n%5===0)return 'Buzz';return String(n);}`,
["if(n%3===0&&n%5===0)return 'FizzBuzz';","if(n%3===0&&n%5===0)return 'Fizz';"],[[[ 15,'15',true]],[[ 9,'3 的倍数',true]],[[ 10,'5 的倍数',false]]],
'15 同时满足两个条件，必须先判断 FizzBuzz。','先处理最特殊的情况，再处理单个条件。','9 应返回 Fizz。','10 应返回 Buzz。');
S('basic','字符串重复','重复次数少了一次。','实现 solve(text,n)：返回 text 重复 n 次拼接的字符串。',
`function solve(text,n){return text.repeat(n);}`,
['text.repeat(n)','text.repeat(n-1)'],[[[ 'ab',3,'三次',true]],[[ 'x',1,'一次',true]],[[ 'ha',0,'零次',false]]],
'repeat(n-1) 会少一份，n=0 还会变成负数报错。','重复次数直接传给 repeat。','ab 三次是 ababab。','零次应返回空串。');
S('basic','区间夹取','只返回了下界，没有考虑上界。','实现 solve(n,min,max)：把 n 夹到 [min,max] 区间内。',
`function solve(n,min,max){return Math.min(max,Math.max(min,n));}`,
['Math.min(max,Math.max(min,n))','Math.max(min,n)'],[[[ 12,0,10,'超上界',true]],[[ -5,0,10,'低于下界',true]],[[ 5,0,10,'区间内',false]]],
'只取 max(min,n) 会漏掉上界，12 仍会返回 12。','夹取要同时应用下界和上界。','12 应变成 10。','区间内应原样返回。');
S('basic','数位之和','每隔一位取数，漏掉了相邻数字。','实现 solve(n)：返回非负整数 n 的各位数字之和。',
`function solve(n){let s=0;while(n>0){s+=n%10;n=Math.floor(n/10);}return s;}`,
['s+=n%10;n=Math.floor(n/10);','s+=n%10;n=Math.floor(n/100);'],[[[ 123,'三位',true]],[[ 9,'一位',true]],[[ 1001,'含零',false]]],
'每次只去掉一位；步进成 /100 会漏掉下一位。','每轮必须 n=Math.floor(n/10)。','123 的数位和是 6。','1001 的数位和是 2。');
// INTERMEDIATE
S('intermediate','数组去重','直接返回原数组，没有去重。','实现 solve(nums)：返回去重后的新数组，保持首次出现的顺序。',
`function solve(nums){return [...new Set(nums)];}`,
['return [...new Set(nums)];','return nums;'],[[[ [1,2,2,3],'重复',true]],[[ [1,1,1],'全同',true]],[[ [],'空数组',false]]],
'原数组直接返回，重复元素还在。','Set 天然去重，再用展开转回数组。','[1,2,2,3] 应变成 [1,2,3]。','空数组返回空数组。');
S('intermediate','数组扁平化','只展开了一层，嵌套数组仍原样保留。','实现 solve(nums)：把一层嵌套数组展开成一维。',
`function solve(nums){return [].concat(...nums);}`,
['[].concat(...nums)','nums'],[[[ [[1,2],[3],4],'混合',true]],[[ [[1],[2]],'全嵌套',true]],[[ [1,2],'已一维',false]]],
'直接返回原数组没有展开；concat(...nums) 才把每个元素摊开。','一层展开用 concat 展开运算符。','[[1,2],[3],4] 应变成 [1,2,3,4]。','已一维数组保持不变。');
S('intermediate','数组分块','块大小多算了一个。','实现 solve(nums,k)：把数组按每 k 个一组切分，最后一组可不足 k 个。',
`function solve(nums,k){const out=[];for(let i=0;i<nums.length;i+=k)out.push(nums.slice(i,i+k));return out;}`,
['i+=k','i+=k+1'],[[[ [1,2,3,4,5],2,'k=2',true]],[[ [1,2,3,4],2,'整除',true]],[[ [],3,'空数组',false]]],
'步进写成 k+1 会跳过一个元素。','每次切片起点按 k 递增。','[1,2,3,4,5] k=2 应分成 [1,2],[3,4],[5]。','空数组应返回 []。');
S('intermediate','变位词','只比较了长度，没有比较字母组成。','实现 solve(a,b)：判断两个字符串是否互为变位词（忽略大小写）。',
`function solve(a,b){return a.toLowerCase().split('').sort().join('')===b.toLowerCase().split('').sort().join('');}`,
["a.toLowerCase().split('').sort().join('')===b.toLowerCase().split('').sort().join('')","a.length===b.length"],[[[ 'Listen','Silent','经典',true]],[[ 'aab','abb','不同',true]],[[ 'abc','cba','重排',false]]],
'长度相同不代表字母相同，aab 和 abb 长度一样但不是变位词。','两边排序后逐字符比较。','Listen 和 Silent 排序后都变成 eilnst。','abc 和 cba 是变位词。');
S('intermediate','两数之和','返回了两个相同的下标。','实现 solve(nums,target)：返回和等于 target 的两个不同下标，找不到返回 []。',
`function solve(nums,t){const m=new Map();for(let i=0;i<nums.length;i++){const need=t-nums[i];if(m.has(need))return [m.get(need),i];m.set(nums[i],i);}return [];}`,
['return [m.get(need),i]','return [i,i]'],[[[ [2,7,11,15],9,'经典',true]],[[ [3,3],6,'重复值',true]],[[ [1,2],5,'无解',false]]],
'返回 i,i 是同一个位置两次，答案要求两个不同下标。','哈希表存“值→下标”，命中时返回存的下标和当前下标。','[2,7,11,15] 应返回 [0,1]。','无解返回空数组。');
S('intermediate','标题格式','把所有字母都转成了大写，没有只大写首字母。','实现 solve(text)：把每个单词首字母大写、其余小写。',
`function solve(text){return text.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');}`,
["w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()","w.toUpperCase()"],[[[ 'hello world','两词',true]],[[ 'jAVA script','混合',true]],[[ 'a','单字母',false]]],
'w.toUpperCase() 让整个单词都大写，不符合标题格式。','首字母 upper，其余 lower。','jAVA 应变成 Java。','单字母只大写自己。');
S('intermediate','区间求和','循环少加了终点 b。','实现 solve(a,b)：返回从 a 到 b（含两端）的所有整数之和。',
`function solve(a,b){let s=0;for(let i=a;i<=b;i++)s+=i;return s;}`,
['i<=b','i<b'],[[[ 1,5,'1..5',true]],[[ 3,3,'单点',true]],[[ -2,2,'跨零',false]]],
'条件写 i<b 会漏掉 b。','闭区间要用 <=。','1..5 的和是 15。','3..3 应返回 3。');
S('intermediate','二分查找','left 更新多跳了一格。','实现 solve(nums,target)：在升序数组中返回 target 的下标，找不到返回 -1。',
`function solve(nums,target){let lo=0,hi=nums.length-1;while(lo<=hi){const mid=(lo+hi)>>1;if(nums[mid]===target)return mid;if(nums[mid]<target)lo=mid+1;else hi=mid-1;}return -1;}`,
['lo=mid+1','lo=mid+2'],[[[ [1,3,5,7],5,'找到',true]],[[ [1,3,5,7],8,'找不到',true]],[[ [],3,'空数组',false]]],
'lo=mid+2 会跳过 mid+1，答案可能正好在那里。','更新只排除 mid：lo=mid+1。','[1,3,5,7] 找 5 返回 2。','空数组返回 -1。');
S('intermediate','单词计数','按单个空格切分，连续空格会产生空单词。','实现 solve(text)：统计由空白分隔的单词数量。',
`function solve(text){return text.trim().split(/\\s+/).filter(Boolean).length;}`,
["text.trim().split(/\\s+/).filter(Boolean).length","text.split(' ').length"],[[[ 'hello  world','双空格',true]],[[ '  a b  ','首尾空格',true]],[[ '','空串',false]]],
'连续空格会切出空串，长度被多算。','用正则 /\\s+/ 或 filter(Boolean)。','hello  world 只有两个单词。','空串应返回 0。');
S('intermediate','合并区间','右端点被较短区间覆盖。','实现 solve(intervals)：合并所有重叠区间，返回合并后的区间数组。',
`function solve(a){a.sort((x,y)=>x[0]-y[0]);const out=[];for(const [l,r] of a){if(!out.length||l>out[out.length-1][1])out.push([l,r]);else out[out.length-1][1]=Math.max(out[out.length-1][1],r);}return out;}`,
['out[out.length-1][1]=Math.max(out[out.length-1][1],r)','out[out.length-1][1]=Math.min(out[out.length-1][1],r)'],[[[ [[1,3],[2,6],[8,10]],'经典',true]],[[ [[1,10],[2,3]],'包含',true]],[[ [[1,2],[3,4]],'不重叠',false]]],
'被包含的短区间会把右端点改小，应该取 max。','合并右端取最大值。','[1,3] 和 [2,6] 合并成 [1,6]。','不重叠区间保持分开。');
// HARD
S('hard','最长递增子序列','只返回了 dp 的最后一项。','实现 solve(nums)：返回最长严格递增子序列的长度。',
`function solve(nums){const dp=nums.map(()=>1);for(let i=0;i<nums.length;i++){for(let j=0;j<i;j++){if(nums[j]<nums[i])dp[i]=Math.max(dp[i],dp[j]+1);}}return Math.max(...dp);}`,
['return Math.max(...dp);','return dp[dp.length-1];'],[[[ [6,1,2,3,0],'经典',true]],[[ [2,2,2],'全相等',true]],[[ [5],'单个',false]]],
'答案可能在任何位置结尾，不能只取 dp[n-1]。','最后取 max(dp)。','[6,1,2,3,0] 的 LIS 长度是 3。','全相等时 LIS 是 1。');
S('hard','硬币找零','dp[0] 初始化错了，所有转移都变大。','实现 solve(coins,amount)：用最少的硬币凑出金额，凑不出返回 -1。',
`function solve(coins,amount){const dp=Array(amount+1).fill(Infinity);dp[0]=0;for(let i=1;i<=amount;i++){for(const c of coins){if(i>=c)dp[i]=Math.min(dp[i],dp[i-c]+1);}}return dp[amount]===Infinity?-1:dp[amount];}`,
['dp[0]=0','dp[0]=1'],[[[ [1,2,5],11,'经典',true]],[[ [2],3,'凑不出',true]],[[ [1],0,'零元',false]]],
'dp[0] 表示凑 0 元需要 0 枚硬币，设成 1 会让所有结果偏大。','边界值按语义初始化。','11 元用 5+5+1 共 3 枚。','凑不出返回 -1。');
S('hard','网格路径','第一行/列初始化成了 0，路径数不对。','实现 solve(m,n)：统计 m×n 网格从左上到右下的路径数，只能向右或向下。',
`function solve(m,n){const dp=Array.from({length:m},()=>Array(n).fill(0));for(let i=0;i<m;i++)dp[i][0]=1;for(let j=0;j<n;j++)dp[0][j]=1;for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]=dp[i-1][j]+dp[i][j-1];return dp[m-1][n-1];}`,
['for(let j=0;j<n;j++)dp[0][j]=1;','for(let j=0;j<n;j++)dp[0][j]=0;'],[[[ 3,4,'3x4',true]],[[ 1,1,'1x1',true]],[[ 2,2,'2x2',false]]],
'第一行只有一种走法，初始化为 0 会切断路径。','第一行第一列都应为 1。','3×4 的路径数是 10。','1×1 只有 1 条路径。');
S('hard','编辑距离','不等时取了最大而不是最小。','实现 solve(a,b)：返回把 a 变成 b 的最少编辑次数。',
`function solve(a,b){const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=0;i<=a.length;i++)dp[i][0]=i;for(let j=0;j<=b.length;j++)dp[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){if(a[i-1]===b[j-1])dp[i][j]=dp[i-1][j-1];else dp[i][j]=1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]);}return dp[a.length][b.length];}`,
['1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1])','1+Math.max(dp[i-1][j-1],dp[i-1][j],dp[i][j-1])'],[[[ 'kitten','sitting','经典',true]],[[ 'abc','abc','相同',true]],[[ '','abc','空串',false]]],
'三种编辑操作应取最小代价，取最大得到的是最坏路径。','转移对插入/删除/替换取 min。','kitten→sitting 需要 3 次。','相同字符串返回 0。');
S('hard','深层扁平化','只展开了一层，深层数组仍保留。','实现 solve(nums)：递归展开任意深度的嵌套数组。',
`function solve(nums){return nums.reduce((a,x)=>a.concat(Array.isArray(x)?solve(x):x),[]);}`,
['a.concat(Array.isArray(x)?solve(x):x)','a.concat(x)'],[[[ [1,[2,[3,[4]]]],'多层',true]],[[ [[[1]]],'单元素深嵌套',true]],[[ [1,2],'一维',false]]],
'只 concat 原元素不会递归，深层数组仍是数组。','遇到数组递归调用。','[1,[2,[3,[4]]]] 应得到 [1,2,3,4]。','一维数组保持不变。');
S('hard','频率 Top K','排序方向反了，返回的是出现最少的值。','实现 solve(nums,k)：返回出现频率最高的 k 个值，频率相同按值升序。',
`function solve(nums,k){const m=new Map();for(const n of nums)m.set(n,(m.get(n)||0)+1);return [...m.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,k).map(x=>x[0]);}`,
['b[1]-a[1]||a[0]-b[0]','a[1]-b[1]||a[0]-b[0]'],[[[ [1,1,2,2,2,3],2,'经典',true]],[[ [4,4,5,5],1,'并列',true]],[[ [1],1,'单个',false]]],
'按频率降序应该是 b[1]-a[1]，写成 a[1]-b[1] 会取到最少。','先按频次降序，再按值升序。','2 出现 3 次排第一。','并列时按值升序。');
S('hard','最大子数组和','遇到负数时把当前和清零了，漏掉跨负数的更大子段。','实现 solve(nums)：返回连续子数组的最大和。',
`function solve(nums){let best=-Infinity,cur=0;for(const n of nums){cur=Math.max(n,cur+n);best=Math.max(best,cur);}return best;}`,
['cur=Math.max(n,cur+n)','cur=Math.max(0,n)'],[[[ [-2,1,-3,4,-1,2,1,-5,4],'经典',true]],[[ [-3,-1,-2],'全负',true]],[[ [1,2,3],'全正',false]]],
'cur=Math.max(0,n) 会丢掉以负数开头但后面更大的子段。','Kadane：cur=max(n,cur+n)。','经典数组答案是 6（4,-1,2,1）。','全负时答案是 -1。');
S('hard','快速排序','递归时漏掉了右分区。','实现 solve(nums)：返回升序排序后的新数组。',
`function solve(nums){if(nums.length<=1)return nums.slice();const p=nums[0];const l=[],r=[],e=[];for(const n of nums){if(n<p)l.push(n);else if(n>p)r.push(n);else e.push(n);}return [...solve(l),...e,...solve(r)];}`,
['return [...solve(l),...e,...solve(r)];','return [...solve(l),...e];'],[[[ [3,1,2,3],'含重复',true]],[[ [5,4,3,2,1],'逆序',true]],[[ [1],'单个',false]]],
'返回时漏掉 solve(r)，比 pivot 大的元素全部丢失。','三路分区结果要按 左、等于、右 全部拼回。','[3,1,2,3] 应得到 [1,2,3,3]。','单元素直接返回。');
S('hard','括号平衡','右括号来时没有检查栈顶类型。','实现 solve(s)：判断 (),[],{} 三种括号是否正确嵌套。',
`function solve(s){const st=[];const map={')':'(',']':'[','}':'{'};for(const c of s){if('([{'.includes(c))st.push(c);else{if(st.pop()!==map[c])return false;}}return st.length===0;}`,
["if(st.pop()!==map[c])return false;","if(st.length===0)return false;"],[[[ '({[]})','正确',true]],[[ '([)]','交叉错',true]],[[ '(','未闭合',false]]],
'只看栈是否为空不够，还必须比较栈顶与当前右括号类型。','pop 后与 map[c] 比较。','([)] 应返回 false。','未闭合返回 false。');
S('hard','深比较','用 JSON.stringify 比较对象，属性顺序不同会误判。','实现 solve(a,b)：递归比较两个 JSON 值是否结构相等（对象键顺序无关）。',
`function solve(a,b){if(a===b)return true;if(typeof a!=='object'||a===null||typeof b!=='object'||b===null)return false;const ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;for(const k of ka){if(!Object.prototype.hasOwnProperty.call(b,k)||!solve(a[k],b[k]))return false;}return true;}`,
["for(const k of ka){if(!Object.prototype.hasOwnProperty.call(b,k)||!solve(a[k],b[k]))return false;}","return JSON.stringify(a)===JSON.stringify(b);"],
[
  [[{a:1,b:2},{b:2,a:1}], '键顺序', true],
  [[{a:[1,2]},{a:[1,3]}], '数组不同', true],
  [[{a:1},{a:1,b:2}], '键不同', false]
],
'JSON.stringify 依赖键顺序，{a:1,b:2} 与 {b:2,a:1} 的字符串不同。','先比键集合，再递归比值。','键顺序不同应视为相等。','数组元素不同应返回 false。');
// build
const out=[];
for(const [i,s] of specs.entries()){
  out.push({id:'z87-'+String(i+1).padStart(2,'0'),level:s.level==='intermediate'?'medium':s.level,title:s.title,minutes:s.level==='hard'?12:6,summary:s.summary,prompt:s.prompt,source:'Head First JavaScript Programming 2nd · z87 扩展',bug:s.bug,code:s.code,tests:s.tests,hints:s.hints,analysis:s.analysis,fixed:s.fixed,order:43+i});
}
const text='/* z87 · JavaScript 改错 +30（三档各 10），用例由真实 Node 运行生成。 */\nwindow.JS_DEBUG_TASKS = (window.JS_DEBUG_TASKS || []).concat('+JSON.stringify(out,null,2)+');\n';
fs.writeFileSync('assets/js/javascript-foundations/js-debug-z87.js',text);
console.log('tasks',out.length,'levels',out.reduce((a,x)=>(a[x.level]=(a[x.level]||0)+1,a),{}),'size',text.length);
