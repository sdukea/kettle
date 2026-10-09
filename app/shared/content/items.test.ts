// Content checks: every code test is answerable by a known-good solution,
// every buggy snippet really fails, and every topic has enough checks.
import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { ITEMS, type BugItem, type CodeItem, type Test } from "./items";
import { TOPICS } from "./topics";
import { sameAnswer } from "../engine/compare";

function runJs(code: string, fn: string, tests: Test[]): unknown[] {
  const ctx = vm.createContext({});
  vm.runInContext(code, ctx, { timeout: 500 });
  const f = vm.runInContext(fn, ctx);
  return tests.map((t) => vm.runInContext("f(...args)", Object.assign(ctx, { f, args: structuredClone(t.args) }), { timeout: 500 }));
}

function passes(code: string, fn: string, tests: Test[], compare: "exact" | "sorted" = "exact") {
  try {
    const got = runJs(code, fn, tests);
    return tests.every((t, i) => sameAnswer(got[i], t.expect, compare));
  } catch {
    return false;
  }
}

// Known-good JavaScript solutions for each code check.
const SOLUTIONS: Record<string, string> = {
  "code-two-sum": `function twoSum(n,t){const m=new Map();for(let i=0;i<n.length;i++){if(m.has(t-n[i]))return [m.get(t-n[i]),i];m.set(n[i],i);}}`,
  "code-valid-palindrome": `function isPalindrome(s){const c=s.toLowerCase().replace(/[^a-z0-9]/g,'');return c===[...c].reverse().join('');}`,
  "code-max-profit": `function maxProfit(p){let lo=Infinity,b=0;for(const x of p){lo=Math.min(lo,x);b=Math.max(b,x-lo);}return b;}`,
  "code-valid-parentheses": `function isValid(s){const st=[],m={')':'(',']':'[','}':'{'};for(const c of s){if(c in m){if(st.pop()!==m[c])return false;}else st.push(c);}return st.length===0;}`,
  "code-binary-search": `function search(a,t){let l=0,h=a.length-1;while(l<=h){const m=(l+h)>>1;if(a[m]===t)return m;if(a[m]<t)l=m+1;else h=m-1;}return -1;}`,
  "code-climb-stairs": `function climbStairs(n){let a=1,b=1;for(let i=1;i<n;i++){[a,b]=[b,a+b];}return b;}`,
  "code-contains-duplicate": `function containsDuplicate(n){return new Set(n).size!==n.length;}`,
  "code-valid-anagram": `function isAnagram(s,t){return [...s].sort().join('')===[...t].sort().join('');}`,
  "code-single-number": `function singleNumber(n){return n.reduce((a,b)=>a^b,0);}`,
  "code-longest-substring": `function lengthOfLongestSubstring(s){const m=new Map();let st=0,b=0;for(let i=0;i<s.length;i++){if(m.has(s[i]))st=Math.max(st,m.get(s[i])+1);m.set(s[i],i);b=Math.max(b,i-st+1);}return b;}`,
  "code-product-except-self": `function productExceptSelf(n){const r=new Array(n.length).fill(1);let p=1;for(let i=0;i<n.length;i++){r[i]=p;p*=n[i];}p=1;for(let i=n.length-1;i>=0;i--){r[i]*=p;p*=n[i];}return r;}`,
  "code-merge-intervals": `function merge(v){v=[...v].sort((a,b)=>a[0]-b[0]);const o=[];for(const [s,e] of v){if(o.length&&s<=o[o.length-1][1])o[o.length-1][1]=Math.max(o[o.length-1][1],e);else o.push([s,e]);}return o;}`,
  "code-num-islands": `function numIslands(g){let c=0;const d=(r,k)=>{if(r<0||k<0||r>=g.length||k>=g[0].length||g[r][k]!=='1')return;g[r][k]='0';d(r+1,k);d(r-1,k);d(r,k+1);d(r,k-1);};for(let r=0;r<g.length;r++)for(let k=0;k<g[0].length;k++)if(g[r][k]==='1'){c++;d(r,k);}return c;}`,
  "code-coin-change": `function coinChange(c,a){const d=new Array(a+1).fill(Infinity);d[0]=0;for(let i=1;i<=a;i++)for(const x of c)if(x<=i)d[i]=Math.min(d[i],d[i-x]+1);return d[a]===Infinity?-1:d[a];}`,
  "code-house-robber": `function rob(n){let a=0,b=0;for(const x of n){[a,b]=[b,Math.max(b,a+x)];}return b;}`,
  "code-daily-temperatures": `function dailyTemperatures(t){const r=new Array(t.length).fill(0),s=[];for(let i=0;i<t.length;i++){while(s.length&&t[s[s.length-1]]<t[i]){const j=s.pop();r[j]=i-j;}s.push(i);}return r;}`,
  "code-search-rotated": `function searchRotated(a,t){let l=0,h=a.length-1;while(l<=h){const m=(l+h)>>1;if(a[m]===t)return m;if(a[l]<=a[m]){if(a[l]<=t&&t<a[m])h=m-1;else l=m+1;}else{if(a[m]<t&&t<=a[h])l=m+1;else h=m-1;}}return -1;}`,
  "code-top-k-frequent": `function topKFrequent(n,k){const m=new Map();for(const x of n)m.set(x,(m.get(x)||0)+1);return [...m].sort((a,b)=>b[1]-a[1]).slice(0,k).map(e=>e[0]);}`,
};

const FIXES: Record<string, string> = {
  "bug-binary-search": `function search(nums,target){let lo=0,hi=nums.length-1;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(nums[mid]<target)lo=mid+1;else hi=mid;}return nums.length&&nums[lo]===target?lo:-1;}`,
  "bug-two-sum-sorted": `function twoSum(n,t){const m=new Map();for(let i=0;i<n.length;i++){if(m.has(t-n[i]))return [m.get(t-n[i]),i];m.set(n[i],i);}return [];}`,
  "bug-reachable": `function countReachable(g,s){const seen=new Set();const d=n=>{if(seen.has(n))return;seen.add(n);for(const x of g[n])d(x);};d(s);return seen.size;}`,
  "bug-longest-window": `function longest(s){const m=new Map();let b=0,st=0;for(let i=0;i<s.length;i++){if(m.has(s[i]))st=Math.max(st,m.get(s[i])+1);m.set(s[i],i);b=Math.max(b,i-st+1);}return b;}`,
  "bug-prefix-sums": `function rangeSums(n,q){const p=[0];for(const x of n)p.push(p[p.length-1]+x);return q.map(([l,r])=>p[r+1]-p[l]);}`,
};

describe("code checks", () => {
  for (const item of ITEMS.filter((i): i is CodeItem => i.kind === "code")) {
    it(`${item.id} is solvable and has at least 3 tests`, () => {
      expect(item.tests.length).toBeGreaterThanOrEqual(3);
      expect(SOLUTIONS[item.id], "missing reference solution").toBeTruthy();
      expect(passes(SOLUTIONS[item.id], item.fn.javascript, item.tests, item.compare)).toBe(true);
    });
    it(`${item.id} rejects the empty starter`, () => {
      expect(passes(item.starter.javascript, item.fn.javascript, item.tests, item.compare)).toBe(false);
    });
  }
});

describe("find-the-bug checks", () => {
  for (const item of ITEMS.filter((i): i is BugItem => i.kind === "bug")) {
    it(`${item.id}: the snippet fails and the fix passes`, () => {
      expect(passes(item.code.javascript, item.fn.javascript, item.tests, item.compare)).toBe(false);
      expect(passes(FIXES[item.id], item.fn.javascript, item.tests, item.compare)).toBe(true);
    });
    it(`${item.id}: bug lines exist in both snippets`, () => {
      for (const lang of ["python", "javascript"] as const) {
        const n = item.code[lang].trimEnd().split("\n").length;
        for (const l of item.bugLines[lang]) expect(l).toBeLessThanOrEqual(n);
      }
    });
  }
});

describe("coverage", () => {
  it("ids are unique", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
  });
  it("every topic id used exists", () => {
    const ids = new Set(TOPICS.map((t) => t.id));
    for (const i of ITEMS) for (const t of i.topics) expect(ids.has(t), `${i.id} uses ${t}`).toBe(true);
  });
  it("every core and common topic has at least 2 quick checks for daily and weekly use", () => {
    for (const t of TOPICS.filter((t) => t.tier !== "advanced")) {
      const quick = ITEMS.filter((i) => (i.kind === "approach" || i.kind === "mcq") && i.topics.includes(t.id));
      expect(quick.length, `${t.id} ${t.name}`).toBeGreaterThanOrEqual(2);
    }
  });
  it("choice questions have distinct options", () => {
    for (const i of ITEMS) {
      if (i.kind === "approach") {
        expect(new Set(i.structures).size).toBe(i.structures.length);
        expect(new Set(i.complexities).size).toBe(i.complexities.length);
      }
      if (i.kind === "mcq") expect(new Set(i.options).size).toBe(i.options.length);
    }
  });
});
