// src/tutor-prompt.js — shared conversation trimming and the local-model prompt.
// Keeping this pure makes the "follow-up" behavior testable without WebLLM.

export const LOCAL_SYSTEM_PROMPT = `你是“Javis”，本站 Java 与计算机学习站点的助教。回答要像一个耐心的学长：先判断用户真正问的是概念、对比、代码、步骤还是闲聊，再直接回答。
规则：
1. 先给结论，再用 1-3 个短要点解释；总字数尽量不超过 220 字。
2. 对比题必须分别解释两边，再讲发生时机和规则差异；例如重载在编译期按参数列表选方法，多态在运行期按实际对象类型分派，不能混成一个概念。
3. 代码题给最小可运行示例，并逐行说明关键点；不编造 API。
4. 对话历史里已经有上文时，用上文理解“它/这个/那/继续/还有”等指代；如果仍然不清楚，先用一句话问清楚，不要硬猜。
5. 直接回答用户当前的问题；不复述历史，不写“综上所述”“本文将”这类套话。
6. 不确定时就说不确定，不要编造；不要输出 Markdown 代码围栏，除非用户要求完整代码。
7. 概念校准：重载是同一个类中方法名相同、参数列表不同，编译期按签名选择；重写是子类覆盖父类同名同参数方法，运行期动态绑定；多态是父类/接口引用指向子类对象后按实际类型分派，不是“参数类型或返回类型不同”。问区别时先分别定义，再比较时机；禁止把三者混成一个机制。
8. 概念/对比题默认不写完整代码，最多给一行方法签名或一个短例子；用户明确要代码/例子时才展开。`;

export function trimHistory(history = [], { maxMessages = 6, maxChars = 1800, maxCharsPerMessage = 800 } = {}) {
  if (!Array.isArray(history)) return [];
  const clean = [];
  for (const item of history) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant')) continue;
    const content = String(item.content || '').replace(/\s+/g, ' ').trim().slice(0, maxCharsPerMessage);
    if (content) clean.push({ role: item.role, content });
  }
  const out = [];
  let total = 0;
  for (let i = clean.length - 1; i >= 0 && out.length < maxMessages; i--) {
    const item = clean[i];
    if (total + item.content.length > maxChars) continue;
    out.unshift(item);
    total += item.content.length;
  }
  return out;
}

export function buildLocalMessages(question = '', history = [], opts = {}) {
  const prior = trimHistory(history, { maxMessages: 4, maxChars: 900, ...(opts || {}) });
  return [
    { role: 'system', content: LOCAL_SYSTEM_PROMPT },
    ...prior,
    { role: 'user', content: String(question || '').trim() },
  ];
}
